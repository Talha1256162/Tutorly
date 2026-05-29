namespace Tutorly.Domain;

public sealed record InsightChildProfile(
    Guid ChildId,
    string ChildName,
    int CurrentClass,
    string City,
    string? Area,
    string PreferredLearningMode,
    string? BoardCode);

public sealed record InsightDiagnosticSetup(
    InsightChildProfile[] Children,
    int[] Classes,
    string[] Subjects,
    InsightTopicGroup[] Topics,
    int QuestionCount);

public sealed record InsightTopicGroup(string SubjectCode, string SubjectName, string[] Topics);

public sealed record StartInsightDiagnosticAttemptRequest(Guid ChildId, int CurrentClass, string[] Subjects);

public sealed record StartInsightDiagnosticAttemptResponse(
    Guid AttemptId,
    string Status,
    int QuestionCount,
    InsightDiagnosticQuestion[] Questions);

public sealed record SubmitInsightAnswerRequest(Guid QuestionId, string SelectedOptionCode);

public sealed record SubmitInsightAnswerResponse(Guid AttemptId, Guid QuestionId, bool IsCorrect, int MarksAwarded);

public sealed record InsightAttemptAnswer(Guid QuestionId, string SelectedOptionCode, bool IsCorrect, int MarksAwarded);

public sealed record InsightDiagnosticAttempt(
    Guid AttemptId,
    Guid ChildId,
    Guid ParentUserId,
    int CurrentClass,
    string[] SubjectCodes,
    string Status,
    DateTime StartedAtUtc,
    DateTime? CompletedAtUtc);

public sealed record InsightDiagnosticQuestion(
    Guid Id,
    string SubjectCode,
    string SubjectName,
    int ClassLevel,
    string TopicCode,
    string TopicName,
    string Difficulty,
    string QuestionText,
    int Marks,
    InsightDiagnosticOption[] Options);

public sealed record InsightDiagnosticOption(Guid Id, string OptionCode, string OptionText);

public sealed record CompleteInsightAttemptResponse(Guid AttemptId, Guid ReportId, InsightLearningGapReport Report);

public sealed record InsightLearningGapReport(
    Guid ReportId,
    Guid ChildId,
    Guid DiagnosticAttemptId,
    string ChildName,
    int CurrentClass,
    int EstimatedActualLevel,
    decimal OverallLearningScore,
    InsightSubjectScore[] SubjectScores,
    InsightTopicScore[] WeakTopics,
    InsightTopicScore[] StrongTopics,
    string RecommendedTutorType,
    string ThirtyDayPlan,
    string ParentExplanation,
    DateTime CreatedAtUtc);

public sealed record InsightSubjectScore(string SubjectCode, string SubjectName, decimal Score, int EstimatedLevel);

public sealed record InsightTopicScore(string SubjectCode, string TopicCode, string TopicName, string StrengthCode, decimal Score);

public sealed record InsightMatchedTutorCard(
    string TutorId,
    string Name,
    string PhotoUrl,
    string Initials,
    string[] Subjects,
    string City,
    string? Area,
    int ExperienceYears,
    bool Verified,
    bool IsCnicVerified,
    bool IsQualificationVerified,
    decimal TutorQualityScore,
    decimal? AverageStudentImprovementPercent,
    decimal? ComplaintRate,
    string BestForClassRange,
    bool TrialClassAvailable,
    string? EstimatedFee,
    decimal MatchScore,
    string MatchReason);

public sealed record InsightDashboardSummary(
    InsightChildProfile? SelectedChild,
    Guid? LatestReportId,
    Guid? LatestAttemptId,
    decimal? LatestLearningScore,
    int? ActualLevel,
    int? CurrentClass,
    string[] WeakSubjects,
    string InsightMessage,
    string NextActionLabel);

public sealed record InsightProgressReport(
    Guid Id,
    Guid ChildId,
    string ChildName,
    string TutorName,
    string ReportMonth,
    decimal BeforeScore,
    decimal AfterScore,
    InsightProgressSubject[] Subjects,
    string[] CompletedTopics,
    string[] StillWeakTopics,
    int TutorAttendanceCount,
    string? ParentFeedback,
    string Recommendation);

public sealed record InsightProgressSubject(
    string SubjectCode,
    string SubjectName,
    decimal BeforeScore,
    decimal AfterScore,
    decimal ImprovementPercent);

public sealed record TutorInsightSummary(
    decimal QualityScore,
    decimal? FeedbackScore,
    int AssignedInsightStudents,
    int ProgressReportsPending,
    string[] ImprovementTips);

public sealed record AdminInsightSummary(
    int TotalDiagnosticAttempts,
    int ReportsGenerated,
    int TutorsNeedingVerification,
    int ProgressReportsPending,
    int LowQualityTutors);
