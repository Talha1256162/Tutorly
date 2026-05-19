using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Shared;

namespace Tutorly.Api.Controllers;

[ApiController]
[Route("api/saved-tutors")]
[Authorize(Roles = "student,parent,admin")]
public sealed class SavedTutorsController : ControllerBase
{
    private readonly ISavedTutorRepository _savedTutorRepository;

    public SavedTutorsController(ISavedTutorRepository savedTutorRepository)
    {
        _savedTutorRepository = savedTutorRepository;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TutorSummary>>>> List(CancellationToken cancellationToken)
    {
        var result = await _savedTutorRepository.GetSavedTutorsAsync(GetUserId(), cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<TutorSummary>>.Ok(result, count: result.Count));
    }

    [HttpPost("{tutorId}")]
    public async Task<ActionResult<ApiResponse<object>>> Save(string tutorId, CancellationToken cancellationToken)
    {
        await _savedTutorRepository.SaveTutorAsync(GetUserId(), tutorId, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { tutorId }, "Tutor saved."));
    }

    [HttpDelete("{tutorId}")]
    public async Task<ActionResult<ApiResponse<object>>> Remove(string tutorId, CancellationToken cancellationToken)
    {
        await _savedTutorRepository.RemoveSavedTutorAsync(GetUserId(), tutorId, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { tutorId }, "Saved tutor removed."));
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var userId) ? userId : Guid.Empty;
    }
}
