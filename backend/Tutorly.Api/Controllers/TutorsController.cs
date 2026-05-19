using Microsoft.AspNetCore.Mvc;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Shared;

namespace Tutorly.Api.Controllers;

[ApiController]
[Route("api/tutors")]
public sealed class TutorsController : ControllerBase
{
    private readonly ITutorRepository _tutorRepository;

    public TutorsController(ITutorRepository tutorRepository)
    {
        _tutorRepository = tutorRepository;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TutorSummary>>>> Search(
        [FromQuery] string? search,
        [FromQuery] string[] subjects,
        [FromQuery] string[] classLevels,
        [FromQuery] string[] cities,
        [FromQuery] string[] modes,
        [FromQuery] string[] genders,
        [FromQuery] string[] languages,
        [FromQuery] decimal? minFee,
        [FromQuery] decimal? maxFee,
        [FromQuery] string? sort,
        CancellationToken cancellationToken)
    {
        var result = await _tutorRepository.SearchAsync(
            new TutorSearchQuery(search, subjects, classLevels, cities, modes, genders, languages, minFee, maxFee, sort),
            cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<TutorSummary>>.Ok(result, count: result.Count));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TutorProfile>>> Profile(string id, CancellationToken cancellationToken)
    {
        var result = await _tutorRepository.GetProfileAsync(id, cancellationToken);
        return result is null
            ? NotFound(ApiResponse<TutorProfile>.Fail(StatusCodes.Status404NotFound, "Tutor not found."))
            : Ok(ApiResponse<TutorProfile>.Ok(result));
    }

    [HttpGet("{id}/booking-options")]
    public async Task<ActionResult<ApiResponse<BookingOption>>> BookingOptions(string id, CancellationToken cancellationToken)
    {
        var result = await _tutorRepository.GetBookingOptionsAsync(id, cancellationToken);
        return result is null
            ? NotFound(ApiResponse<BookingOption>.Fail(StatusCodes.Status404NotFound, "Tutor not found."))
            : Ok(ApiResponse<BookingOption>.Ok(result));
    }
}
