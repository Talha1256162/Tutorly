namespace Tutorly.Infrastructure.Security;

public sealed class JwtSettings
{
    public string Issuer { get; init; } = "Tutorly";
    public string Audience { get; init; } = "Tutorly.Web";
    public string SigningKey { get; init; } = "replace-this-with-a-strong-256-bit-key";
    public int AccessTokenMinutes { get; init; } = 30;
    public int RefreshTokenDays { get; init; } = 14;
}
