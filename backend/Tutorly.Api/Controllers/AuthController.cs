using Microsoft.AspNetCore.Mvc;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Shared;

namespace Tutorly.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<object>>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        return Ok(ApiResponse<AuthResult>.Ok(result, "Signed in."));
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
