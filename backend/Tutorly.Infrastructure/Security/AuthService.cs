using Dapper;
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

    public AuthService(ISqlConnectionFactory connectionFactory, IOptions<JwtSettings> jwtOptions)
    {
        _connectionFactory = connectionFactory;
        _jwtSettings = jwtOptions.Value;
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
                    'New tutor', 0, 'New verified tutor on Lumora.', '', '', sysutcdatetime()
                );
            end

            select @UserId as UserId, @FullName as FullName, @Email as EmailOrPhone, @Role as Role;
            """;

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);
        using var connection = _connectionFactory.CreateConnection();
        var session = await connection.QuerySingleAsync<UserSession>(new CommandDefinition(
            sql,
            new
            {
                request.Role,
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
}
