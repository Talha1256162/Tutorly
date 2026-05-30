using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Mvc;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Infrastructure.Security;
using Tutorly.Shared;

namespace Tutorly.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly GoogleAuthSettings _googleAuthSettings;

    public AuthController(IAuthService authService, IOptions<GoogleAuthSettings> googleAuthOptions)
    {
        _authService = authService;
        _googleAuthSettings = googleAuthOptions.Value;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<object>>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        return Ok(ApiResponse<AuthResult>.Ok(result, "Signed in."));
    }

    [HttpGet("google/config")]
    public ActionResult<ApiResponse<GoogleAuthConfig>> GoogleConfig()
    {
        var clientId = string.IsNullOrWhiteSpace(_googleAuthSettings.ClientId)
            ? null
            : _googleAuthSettings.ClientId;
        return Ok(ApiResponse<GoogleAuthConfig>.Ok(
            new GoogleAuthConfig(clientId is not null, clientId),
            clientId is not null ? "Google sign-in is available." : "Google sign-in is not configured."));
    }

    [HttpPost("google")]
    public async Task<ActionResult<ApiResponse<object>>> GoogleLogin(GoogleLoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginWithGoogleAsync(request, cancellationToken);
        return Ok(ApiResponse<AuthResult>.Ok(result, "Signed in with Google."));
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<object>>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<AuthResult>.Created(result, "Account created."));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<object>>> Refresh(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RefreshAsync(request, cancellationToken);
        return Ok(ApiResponse<AuthResult>.Ok(result, "Token refreshed."));
    }
}
