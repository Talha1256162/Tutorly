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
        var userId = GetUserId();
        var result = await _bookingRepository.CreateDemoBookingAsync(request, userId, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<BookingConfirmation>.Created(result, "Demo booking requested."));
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var userId) ? userId : Guid.Empty;
    }
}
