using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Shared;

namespace Tutorly.Api.Controllers;

[ApiController]
[Route("api/insight")]
public sealed class TutorlyInsightController : ControllerBase
{
    private readonly ITutorlyInsightService _insightService;

    public TutorlyInsightController(ITutorlyInsightService insightService)
    {
        _insightService = insightService;
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpGet("setup")]
    public async Task<ActionResult<ApiResponse<InsightDiagnosticSetup>>> Setup(
        [FromQuery] int? classLevel,
        [FromQuery] string? subject,
        CancellationToken cancellationToken)
    {
        var result = await _insightService.GetSetupAsync(GetUserId(), classLevel, subject, cancellationToken);
        return Ok(ApiResponse<InsightDiagnosticSetup>.Ok(result));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpGet("children")]
    public async Task<ActionResult<ApiResponse<InsightChildProfile[]>>> Children(CancellationToken cancellationToken)
    {
        var setup = await _insightService.GetSetupAsync(GetUserId(), null, null, cancellationToken);
        return Ok(ApiResponse<InsightChildProfile[]>.Ok(setup.Children, count: setup.Children.Length));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpPost("diagnostic-attempts")]
    public async Task<ActionResult<ApiResponse<StartInsightDiagnosticAttemptResponse>>> StartAttempt(
        StartInsightDiagnosticAttemptRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _insightService.StartAttemptAsync(GetUserId(), request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<StartInsightDiagnosticAttemptResponse>.Created(result, "Diagnostic attempt ready."));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpGet("diagnostic-attempts/{attemptId:guid}/questions")]
    public async Task<ActionResult<ApiResponse<InsightDiagnosticQuestion[]>>> Questions(Guid attemptId, CancellationToken cancellationToken)
    {
        var result = await _insightService.GetAttemptQuestionsAsync(GetUserId(), attemptId, cancellationToken);
        return Ok(ApiResponse<InsightDiagnosticQuestion[]>.Ok(result, count: result.Length));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpPost("diagnostic-attempts/{attemptId:guid}/answers")]
    public async Task<ActionResult<ApiResponse<SubmitInsightAnswerResponse>>> SubmitAnswer(
        Guid attemptId,
        SubmitInsightAnswerRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _insightService.SubmitAnswerAsync(GetUserId(), attemptId, request, cancellationToken);
        return Ok(ApiResponse<SubmitInsightAnswerResponse>.Ok(result, result.IsCorrect ? "Answer saved." : "Answer saved for review."));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpPost("diagnostic-attempts/{attemptId:guid}/complete")]
    public async Task<ActionResult<ApiResponse<CompleteInsightAttemptResponse>>> CompleteAttempt(Guid attemptId, CancellationToken cancellationToken)
    {
        var result = await _insightService.CompleteAttemptAsync(GetUserId(), attemptId, cancellationToken);
        return Ok(ApiResponse<CompleteInsightAttemptResponse>.Ok(result, "Learning Gap Report generated."));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpGet("reports/latest")]
    public async Task<ActionResult<ApiResponse<InsightLearningGapReport>>> LatestReport(CancellationToken cancellationToken)
    {
        var result = await _insightService.GetLatestReportAsync(GetUserId(), cancellationToken);
        return result is null
            ? NotFound(ApiResponse<InsightLearningGapReport>.Fail(StatusCodes.Status404NotFound, "No Tutorly Insight report found."))
            : Ok(ApiResponse<InsightLearningGapReport>.Ok(result));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpGet("reports/{reportId:guid}")]
    public async Task<ActionResult<ApiResponse<InsightLearningGapReport>>> Report(Guid reportId, CancellationToken cancellationToken)
    {
        var result = await _insightService.GetReportAsync(GetUserId(), reportId, cancellationToken);
        return result is null
            ? NotFound(ApiResponse<InsightLearningGapReport>.Fail(StatusCodes.Status404NotFound, "Tutorly Insight report not found."))
            : Ok(ApiResponse<InsightLearningGapReport>.Ok(result));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpGet("reports/by-attempt/{attemptId:guid}")]
    public async Task<ActionResult<ApiResponse<InsightLearningGapReport>>> ReportByAttempt(Guid attemptId, CancellationToken cancellationToken)
    {
        var result = await _insightService.GetReportByAttemptAsync(GetUserId(), attemptId, cancellationToken);
        return result is null
            ? NotFound(ApiResponse<InsightLearningGapReport>.Fail(StatusCodes.Status404NotFound, "Tutorly Insight report not found."))
            : Ok(ApiResponse<InsightLearningGapReport>.Ok(result));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpGet("reports/{reportId:guid}/matched-tutors")]
    public async Task<ActionResult<ApiResponse<InsightMatchedTutorCard[]>>> MatchedTutors(Guid reportId, CancellationToken cancellationToken)
    {
        var result = await _insightService.GetMatchedTutorsAsync(GetUserId(), reportId, cancellationToken);
        return Ok(ApiResponse<InsightMatchedTutorCard[]>.Ok(result, count: result.Length));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpGet("dashboard-summary")]
    public async Task<ActionResult<ApiResponse<InsightDashboardSummary>>> DashboardSummary(CancellationToken cancellationToken)
    {
        var result = await _insightService.GetDashboardSummaryAsync(GetUserId(), cancellationToken);
        return Ok(ApiResponse<InsightDashboardSummary>.Ok(result));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpGet("progress")]
    public async Task<ActionResult<ApiResponse<InsightProgressReport[]>>> ProgressReports(CancellationToken cancellationToken)
    {
        var result = await _insightService.GetProgressReportsAsync(GetUserId(), cancellationToken);
        return Ok(ApiResponse<InsightProgressReport[]>.Ok(result, count: result.Length));
    }

    [Authorize(Roles = "tutor,admin")]
    [HttpGet("tutor-summary")]
    public async Task<ActionResult<ApiResponse<TutorInsightSummary>>> TutorSummary(CancellationToken cancellationToken)
    {
        var result = await _insightService.GetTutorSummaryAsync(GetUserId(), cancellationToken);
        return Ok(ApiResponse<TutorInsightSummary>.Ok(result));
    }

    [Authorize(Roles = "admin")]
    [HttpGet("admin-summary")]
    public async Task<ActionResult<ApiResponse<AdminInsightSummary>>> AdminSummary(CancellationToken cancellationToken)
    {
        var result = await _insightService.GetAdminSummaryAsync(cancellationToken);
        return Ok(ApiResponse<AdminInsightSummary>.Ok(result));
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var userId) ? userId : Guid.Empty;
    }
}
