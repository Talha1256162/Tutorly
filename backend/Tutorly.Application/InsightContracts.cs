using Tutorly.Domain;

namespace Tutorly.Application;

public interface ITutorlyInsightService
{
    Task<InsightDiagnosticSetup> GetSetupAsync(Guid userId, int? classLevel, string? subject, CancellationToken cancellationToken);
    Task<StartInsightDiagnosticAttemptResponse> StartAttemptAsync(Guid userId, StartInsightDiagnosticAttemptRequest request, CancellationToken cancellationToken);
    Task<InsightDiagnosticQuestion[]> GetAttemptQuestionsAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken);
    Task<SubmitInsightAnswerResponse> SubmitAnswerAsync(Guid userId, Guid attemptId, SubmitInsightAnswerRequest request, CancellationToken cancellationToken);
    Task<CompleteInsightAttemptResponse> CompleteAttemptAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken);
    Task<InsightLearningGapReport?> GetLatestReportAsync(Guid userId, CancellationToken cancellationToken);
    Task<InsightLearningGapReport?> GetReportAsync(Guid userId, Guid reportId, CancellationToken cancellationToken);
    Task<InsightLearningGapReport?> GetReportByAttemptAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken);
    Task<InsightMatchedTutorCard[]> GetMatchedTutorsAsync(Guid userId, Guid reportId, CancellationToken cancellationToken);
    Task<InsightDashboardSummary> GetDashboardSummaryAsync(Guid userId, CancellationToken cancellationToken);
    Task<InsightProgressReport[]> GetProgressReportsAsync(Guid userId, CancellationToken cancellationToken);
    Task<TutorInsightSummary> GetTutorSummaryAsync(Guid userId, CancellationToken cancellationToken);
    Task<AdminInsightSummary> GetAdminSummaryAsync(CancellationToken cancellationToken);
}

public interface ITutorlyInsightRepository
{
    Task<InsightChildProfile[]> GetChildrenAsync(Guid userId, CancellationToken cancellationToken);
    Task<InsightDiagnosticQuestion[]> GetQuestionsAsync(int classLevel, string[] subjectCodes, CancellationToken cancellationToken);
    Task<InsightDiagnosticAttempt?> GetActiveAttemptAsync(Guid userId, Guid childId, int currentClass, string[] subjectCodes, CancellationToken cancellationToken);
    Task<InsightDiagnosticAttempt?> GetAttemptAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken);
    Task<InsightDiagnosticAttempt> CreateAttemptAsync(Guid userId, StartInsightDiagnosticAttemptRequest request, string[] subjectCodes, CancellationToken cancellationToken);
    Task<SubmitInsightAnswerResponse> SaveAnswerAsync(Guid userId, Guid attemptId, Guid questionId, string selectedOptionCode, CancellationToken cancellationToken);
    Task<InsightAttemptAnswer[]> GetAttemptAnswersAsync(Guid attemptId, CancellationToken cancellationToken);
    Task<InsightLearningGapReport> SaveReportAsync(InsightLearningGapReport report, CancellationToken cancellationToken);
    Task CompleteAttemptAsync(Guid attemptId, decimal score, int estimatedLevel, string recommendedTutorType, CancellationToken cancellationToken);
    Task<InsightLearningGapReport?> GetLatestReportAsync(Guid userId, CancellationToken cancellationToken);
    Task<InsightLearningGapReport?> GetReportAsync(Guid userId, Guid reportId, CancellationToken cancellationToken);
    Task<InsightLearningGapReport?> GetReportByAttemptAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken);
    Task<InsightMatchedTutorCard[]> GetMatchedTutorsAsync(InsightLearningGapReport report, CancellationToken cancellationToken);
    Task<InsightProgressReport[]> GetProgressReportsAsync(Guid userId, CancellationToken cancellationToken);
    Task<TutorInsightSummary> GetTutorSummaryAsync(Guid userId, CancellationToken cancellationToken);
    Task<AdminInsightSummary> GetAdminSummaryAsync(CancellationToken cancellationToken);
}
