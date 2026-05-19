using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Shared;

namespace Tutorly.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardController(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpGet("student")]
    public async Task<ActionResult<ApiResponse<StudentDashboard>>> Student(CancellationToken cancellationToken)
    {
        var result = await _dashboardRepository.GetStudentDashboardAsync(GetUserId(), cancellationToken);
        return Ok(ApiResponse<StudentDashboard>.Ok(result));
    }

    [Authorize(Roles = "tutor,admin")]
    [HttpGet("tutor")]
    public async Task<ActionResult<ApiResponse<TutorDashboard>>> Tutor(CancellationToken cancellationToken)
    {
        var result = await _dashboardRepository.GetTutorDashboardAsync(GetUserId(), cancellationToken);
        return Ok(ApiResponse<TutorDashboard>.Ok(result));
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var userId) ? userId : Guid.Empty;
    }
}
