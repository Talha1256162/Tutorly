using Dapper;
using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Infrastructure.Data;

namespace Tutorly.Infrastructure.Security;

public sealed class AuthService : IAuthService
{
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly JwtSettings _jwtSettings;
    private readonly GoogleAuthSettings _googleAuthSettings;

    public AuthService(
        ISqlConnectionFactory connectionFactory,
        IOptions<JwtSettings> jwtOptions,
        IOptions<GoogleAuthSettings> googleAuthOptions)
    {
        _connectionFactory = connectionFactory;
        _jwtSettings = jwtOptions.Value;
        _googleAuthSettings = googleAuthOptions.Value;
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        const string sql = """
            select top 1
                u.Id,
                u.FullName,
                u.Email,
                u.Phone,
                u.PasswordHash,
                r.Code as Role
            from users u
            inner join userRoles ur on ur.UserId = u.Id
            inner join roles r on r.Id = ur.RoleId
            where (u.Email = @EmailOrPhone or u.Phone = @EmailOrPhone)
              and u.StatusCode = 'active';
            """;

        using var connection = _connectionFactory.CreateConnection();
        var user = await connection.QueryFirstOrDefaultAsync(new CommandDefinition(sql, request, cancellationToken: cancellationToken));
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, (string)user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email/phone or password.");
        }

        var session = new UserSession(user.Id, user.FullName, user.Email ?? user.Phone, user.Role);
        return await CreateAuthResultAsync(session, cancellationToken);
    }

    public async Task<AuthResult> LoginWithGoogleAsync(GoogleLoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_googleAuthSettings.ClientId))
        {
            throw new InvalidOperationException("Google sign-in is not configured.");
        }

        if (string.IsNullOrWhiteSpace(request.Credential))
        {
            throw new UnauthorizedAccessException("Google credential is missing.");
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                request.Credential,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _googleAuthSettings.ClientId }
                });
        }
        catch (InvalidJwtException ex)
        {
            throw new UnauthorizedAccessException("Google credential is invalid.", ex);
        }

        if (!payload.EmailVerified || string.IsNullOrWhiteSpace(payload.Email))
        {
            throw new UnauthorizedAccessException("Google account email is not verified.");
        }

        var email = payload.Email.Trim().ToLowerInvariant();
        var fullName = !string.IsNullOrWhiteSpace(payload.Name)
            ? payload.Name.Trim()
            : email[..email.IndexOf('@')];
        var role = NormalizeRegistrationRole(request.Role);

        const string existingUserSql = """
            select top 1
                u.Id as UserId,
                u.FullName,
                coalesce(u.Email, u.Phone) as EmailOrPhone,
                r.Code as Role
            from users u
            inner join userRoles ur on ur.UserId = u.Id
            inner join roles r on r.Id = ur.RoleId
            where lower(u.Email) = @Email
              and u.StatusCode = 'active';
            """;

        using var connection = _connectionFactory.CreateConnection();
        var session = await connection.QuerySingleOrDefaultAsync<UserSession>(new CommandDefinition(
            existingUserSql,
            new { Email = email },
            cancellationToken: cancellationToken));

        if (session is null)
        {
            const string createUserSql = """
                declare @UserId uniqueidentifier = newid();
                declare @RoleId int = (select top 1 Id from roles where Code = @Role);

                if @RoleId is null
                    throw 51000, 'Invalid role.', 1;

                insert into users
                (
                    Id, FullName, Phone, Email, PasswordHash, StatusCode, CreatedAtUtc
                )
                values
                (
                    @UserId, @FullName, null, @Email, @PasswordHash, 'active', sysutcdatetime()
                );

                insert into userRoles (UserId, RoleId)
                values (@UserId, @RoleId);

                if @Role = 'student'
                begin
                    insert into studentProfiles (Id, UserId, City, CreatedAtUtc)
                    values (newid(), @UserId, null, sysutcdatetime());
                end
                else if @Role = 'tutor'
                begin
                    insert into tutorProfiles
                    (
                        Id, UserId, Slug, Initials, PhotoUrl, VerificationStatusCode, Rating,
                        ReviewCount, ExperienceYears, FeeText, FeeAmount, NextSlot,
                        ResponseTime, StudentsTaught, Tagline, About, TeachingStyle, CreatedAtUtc
                    )
                    values
                    (
                        newid(), @UserId, @Slug, @Initials,
                        '', 'pending', 0, 0, 0, 'PKR 0/month', 0, 'Set availability',
                        'New tutor', 0, 'New verified tutor on Mentora.', '', '', sysutcdatetime()
                    );
                end

                select @UserId as UserId, @FullName as FullName, @Email as EmailOrPhone, @Role as Role;
                """;

            session = await connection.QuerySingleAsync<UserSession>(new CommandDefinition(
                createUserSql,
                new
                {
                    Role = role,
                    FullName = fullName,
                    Email = email,
                    PasswordHash = CreateExternalLoginPasswordHash(),
                    Slug = CreateSlug(fullName, payload.Subject),
                    Initials = CreateInitials(fullName)
                },
                cancellationToken: cancellationToken));
        }

        return await CreateAuthResultAsync(session, cancellationToken);
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        const string sql = """
            declare @UserId uniqueidentifier = newid();
            declare @RoleId int = (select top 1 Id from roles where Code = @Role);

            if @RoleId is null
                throw 51000, 'Invalid role.', 1;

            insert into users
            (
                Id, FullName, Phone, Email, PasswordHash, StatusCode, CreatedAtUtc
            )
            values
            (
                @UserId, @FullName, @Phone, @Email, @PasswordHash, 'active', sysutcdatetime()
            );

            insert into userRoles (UserId, RoleId)
            values (@UserId, @RoleId);

            if @Role = 'student'
            begin
                insert into studentProfiles (Id, UserId, City, CreatedAtUtc)
                values (newid(), @UserId, @City, sysutcdatetime());
            end
            else if @Role = 'tutor'
            begin
                insert into tutorProfiles
                (
                    Id, UserId, Slug, Initials, PhotoUrl, VerificationStatusCode, Rating,
                    ReviewCount, ExperienceYears, FeeText, FeeAmount, NextSlot,
                    ResponseTime, StudentsTaught, Tagline, About, TeachingStyle, CreatedAtUtc
                )
                values
                (
                    newid(), @UserId, lower(replace(@FullName, ' ', '-')), upper(left(@FullName, 1)),
                    '', 'pending', 0, 0, 0, 'PKR 0/month', 0, 'Set availability',
                    'New tutor', 0, 'New verified tutor on Mentora.', '', '', sysutcdatetime()
                );
            end

            select @UserId as UserId, @FullName as FullName, @Email as EmailOrPhone, @Role as Role;
            """;

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);
        var registrationRole = NormalizeRegistrationRole(request.Role);
        using var connection = _connectionFactory.CreateConnection();
        var session = await connection.QuerySingleAsync<UserSession>(new CommandDefinition(
            sql,
            new
            {
                Role = registrationRole,
                request.FullName,
                request.Phone,
                request.Email,
                PasswordHash = passwordHash,
                request.City
            },
            cancellationToken: cancellationToken));

        return await CreateAuthResultAsync(session, cancellationToken);
    }

    public async Task<AuthResult> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        const string sql = """
            select top 1 u.Id as UserId, u.FullName, coalesce(u.Email, u.Phone) as EmailOrPhone, r.Code as Role
            from refreshTokens rt
            inner join users u on u.Id = rt.UserId
            inner join userRoles ur on ur.UserId = u.Id
            inner join roles r on r.Id = ur.RoleId
            where rt.TokenHash = @TokenHash
              and rt.RevokedAtUtc is null
              and rt.ExpiresAtUtc > sysutcdatetime();
            """;

        using var connection = _connectionFactory.CreateConnection();
        var tokenHash = HashRefreshToken(request.RefreshToken);
        var session = await connection.QuerySingleOrDefaultAsync<UserSession>(new CommandDefinition(sql, new { TokenHash = tokenHash }, cancellationToken: cancellationToken));
        if (session is null)
        {
            throw new UnauthorizedAccessException("Refresh token is invalid or expired.");
        }

        return await CreateAuthResultAsync(session, cancellationToken);
    }

    private async Task<AuthResult> CreateAuthResultAsync(UserSession user, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(_jwtSettings.AccessTokenMinutes);
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SigningKey));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("emailOrPhone", user.EmailOrPhone)
        };

        var token = new JwtSecurityToken(
            _jwtSettings.Issuer,
            _jwtSettings.Audience,
            claims,
            now,
            expires,
            credentials);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        const string sql = """
            insert into refreshTokens
            (
                Id, UserId, TokenHash, ExpiresAtUtc, CreatedAtUtc
            )
            values
            (
                newid(), @UserId, @TokenHash, @ExpiresAtUtc, sysutcdatetime()
            );
            """;

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                user.UserId,
                TokenHash = HashRefreshToken(refreshToken),
                ExpiresAtUtc = now.AddDays(_jwtSettings.RefreshTokenDays)
            },
            cancellationToken: cancellationToken));

        return new AuthResult(accessToken, refreshToken, expires, user);
    }

    private static string HashRefreshToken(string refreshToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
        return Convert.ToHexString(bytes);
    }

    private static string NormalizeRegistrationRole(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return "student";
        }

        var normalizedRole = role.Equals("parent", StringComparison.OrdinalIgnoreCase)
            ? "student"
            : role.Trim().ToLowerInvariant();

        return normalizedRole.Equals("tutor", StringComparison.OrdinalIgnoreCase)
            ? "tutor"
            : "student";
    }

    private static string CreateExternalLoginPasswordHash()
    {
        var password = $"{Guid.NewGuid():N}:{Convert.ToHexString(RandomNumberGenerator.GetBytes(24))}";
        return BCrypt.Net.BCrypt.HashPassword(password, 12);
    }

    private static string CreateInitials(string fullName)
    {
        var initials = string.Concat(fullName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Take(2)
            .Select(part => char.ToUpperInvariant(part[0])));

        return string.IsNullOrWhiteSpace(initials) ? "U" : initials;
    }

    private static string CreateSlug(string fullName, string subject)
    {
        var builder = new StringBuilder();
        foreach (var character in fullName.Trim().ToLowerInvariant())
        {
            if (char.IsLetterOrDigit(character))
            {
                builder.Append(character);
            }
            else if (builder.Length > 0 && builder[^1] != '-')
            {
                builder.Append('-');
            }
        }

        var slug = builder.ToString().Trim('-');
        if (string.IsNullOrWhiteSpace(slug))
        {
            slug = "google-user";
        }

        var suffix = subject.Length > 8 ? subject[^8..] : subject;
        return $"{slug}-{suffix}".ToLowerInvariant();
    }
}
