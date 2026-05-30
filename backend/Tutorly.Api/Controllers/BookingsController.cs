using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Shared;

namespace Tutorly.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public sealed class BookingsController : ControllerBase
{
    private readonly IBookingRepository _bookingRepository;

    public BookingsController(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpGet("mine")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BookingSummary>>>> Mine(CancellationToken cancellationToken)
    {
        var result = await _bookingRepository.GetStudentBookingsAsync(GetUserId(), cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<BookingSummary>>.Ok(result, count: result.Count));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpPost("demo")]
    public async Task<ActionResult<ApiResponse<BookingConfirmation>>> CreateDemo(BookingRequest request, CancellationToken cancellationToken)
    {
        var validationErrors = ValidateDemoRequest(request);
        if (validationErrors.Count > 0)
        {
            return BadRequest(ApiResponse<object>.Fail(
                StatusCodes.Status400BadRequest,
                "Demo booking details are incomplete.",
                validationErrors));
        }

        var userId = GetUserId();
        var result = await _bookingRepository.CreateDemoBookingAsync(Normalize(request), userId, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<BookingConfirmation>.Created(result, "Demo booking requested."));
    }

    private static List<string> ValidateDemoRequest(BookingRequest request)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(request.TutorId))
        {
            errors.Add("Tutor is required.");
        }

        if (!DateOnly.TryParse(request.SelectedDate, out _))
        {
            errors.Add("A valid demo date is required.");
        }

        if (string.IsNullOrWhiteSpace(request.SelectedTime))
        {
            errors.Add("Demo time is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Mode))
        {
            errors.Add("Teaching mode is required.");
        }

        if (string.IsNullOrWhiteSpace(request.StudentName))
        {
            errors.Add("Student name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ParentPhone))
        {
            errors.Add("Parent phone is required.");
        }

        if (string.IsNullOrWhiteSpace(request.LearningGoal))
        {
            errors.Add("Learning goal is required.");
        }

        return errors;
    }

    private static BookingRequest Normalize(BookingRequest request)
    {
        return request with
        {
            TutorId = request.TutorId.Trim(),
            SelectedDate = request.SelectedDate.Trim(),
            SelectedTime = request.SelectedTime.Trim(),
            Mode = request.Mode.Trim(),
            StudentName = request.StudentName.Trim(),
            ParentPhone = request.ParentPhone.Trim(),
            LearningGoal = request.LearningGoal.Trim()
        };
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var userId) ? userId : Guid.Empty;
    }
}
