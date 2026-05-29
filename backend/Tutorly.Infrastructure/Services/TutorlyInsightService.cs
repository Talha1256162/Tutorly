using Tutorly.Application;
using Tutorly.Domain;

namespace Tutorly.Infrastructure.Services;

public sealed class TutorlyInsightService : ITutorlyInsightService
{
    private static readonly string[] DefaultSubjects = { "math", "english", "urdu" };

    private readonly ITutorlyInsightRepository _repository;

    public TutorlyInsightService(ITutorlyInsightRepository repository)
    {
        _repository = repository;
    }

    public async Task<InsightDiagnosticSetup> GetSetupAsync(Guid userId, int? classLevel, string? subject, CancellationToken cancellationToken)
    {
        var children = await _repository.GetChildrenAsync(userId, cancellationToken);
        var subjects = string.IsNullOrWhiteSpace(subject)
            ? DefaultSubjects
            : new[] { NormalizeSubject(subject) };
        var resolvedClass = Math.Clamp(classLevel ?? children.FirstOrDefault()?.CurrentClass ?? 5, 1, 8);
        var questions = await _repository.GetQuestionsAsync(resolvedClass, subjects, cancellationToken);

        return new InsightDiagnosticSetup(
            children,
            Enumerable.Range(1, 8).ToArray(),
            DefaultSubjects,
            new[]
            {
                new InsightTopicGroup("math", "Math", new[] { "addition", "subtraction", "multiplication", "division", "fractions", "word problems" }),
                new InsightTopicGroup("english", "English", new[] { "reading comprehension", "grammar", "vocabulary", "sentence structure" }),
                new InsightTopicGroup("urdu", "Urdu", new[] { "reading", "comprehension", "grammar", "vocabulary" })
            },
            questions.Length);
    }

    public async Task<StartInsightDiagnosticAttemptResponse> StartAttemptAsync(Guid userId, StartInsightDiagnosticAttemptRequest request, CancellationToken cancellationToken)
    {
        if (request.ChildId == Guid.Empty)
        {
            throw new ArgumentException("childId is required.");
        }

        var currentClass = Math.Clamp(request.CurrentClass, 1, 8);
        var subjectCodes = NormalizeSubjects(request.Subjects);
        var existing = await _repository.GetActiveAttemptAsync(userId, request.ChildId, currentClass, subjectCodes, cancellationToken);
        var attempt = existing ?? await _repository.CreateAttemptAsync(
            userId,
            request with { CurrentClass = currentClass },
            subjectCodes,
            cancellationToken);
        var questions = await _repository.GetQuestionsAsync(attempt.CurrentClass, attempt.SubjectCodes, cancellationToken);

        return new StartInsightDiagnosticAttemptResponse(attempt.AttemptId, attempt.Status, questions.Length, questions);
    }

    public async Task<InsightDiagnosticQuestion[]> GetAttemptQuestionsAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken)
    {
        var attempt = await GetOwnedAttemptAsync(userId, attemptId, cancellationToken);
        return await _repository.GetQuestionsAsync(attempt.CurrentClass, attempt.SubjectCodes, cancellationToken);
    }

    public async Task<SubmitInsightAnswerResponse> SubmitAnswerAsync(Guid userId, Guid attemptId, SubmitInsightAnswerRequest request, CancellationToken cancellationToken)
    {
        if (request.QuestionId == Guid.Empty)
        {
            throw new ArgumentException("questionId is required.");
        }

        var selected = request.SelectedOptionCode?.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(selected))
        {
            throw new ArgumentException("selectedOptionCode is required.");
        }

        await GetOwnedAttemptAsync(userId, attemptId, cancellationToken);
        return await _repository.SaveAnswerAsync(userId, attemptId, request.QuestionId, selected, cancellationToken);
    }

    public async Task<CompleteInsightAttemptResponse> CompleteAttemptAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken)
    {
        var attempt = await GetOwnedAttemptAsync(userId, attemptId, cancellationToken);
        var children = await _repository.GetChildrenAsync(userId, cancellationToken);
        var child = children.FirstOrDefault(item => item.ChildId == attempt.ChildId)
            ?? throw new UnauthorizedAccessException("Child profile does not belong to this account.");
        var questions = await _repository.GetQuestionsAsync(attempt.CurrentClass, attempt.SubjectCodes, cancellationToken);
        if (questions.Length == 0)
        {
            throw new InvalidOperationException("No diagnostic questions are configured for this class and subject selection.");
        }

        var answers = (await _repository.GetAttemptAnswersAsync(attempt.AttemptId, cancellationToken))
            .ToDictionary(answer => answer.QuestionId);
        var subjectScores = BuildSubjectScores(questions, answers, attempt.CurrentClass);
        var topicScores = BuildTopicScores(questions, answers);
        var overallScore = Math.Round(subjectScores.Average(score => score.Score), 2);
        var estimatedLevel = EstimateLevel(attempt.CurrentClass, overallScore);
        var weakTopics = topicScores.Where(topic => topic.Score < 60).OrderBy(topic => topic.Score).ToArray();
        var strongTopics = topicScores.Where(topic => topic.Score >= 75).OrderByDescending(topic => topic.Score).ToArray();
        var weakSubjects = subjectScores.Where(score => score.Score < 65).Select(score => score.SubjectName).ToArray();
        var recommendedTutorType = BuildRecommendedTutorType(weakSubjects, weakTopics, child.CurrentClass);
        var plan = BuildThirtyDayPlan(weakTopics);
        var explanation = BuildParentExplanation(child, overallScore, estimatedLevel, weakTopics);

        var report = new InsightLearningGapReport(
            Guid.NewGuid(),
            attempt.ChildId,
            attempt.AttemptId,
            child.ChildName,
            attempt.CurrentClass,
            estimatedLevel,
            overallScore,
            subjectScores,
            weakTopics,
            strongTopics,
            recommendedTutorType,
            plan,
            explanation,
            DateTime.UtcNow);

        await _repository.CompleteAttemptAsync(attempt.AttemptId, overallScore, estimatedLevel, recommendedTutorType, cancellationToken);
        var savedReport = await _repository.SaveReportAsync(report, cancellationToken);
        return new CompleteInsightAttemptResponse(attempt.AttemptId, savedReport.ReportId, savedReport);
    }

    public Task<InsightLearningGapReport?> GetLatestReportAsync(Guid userId, CancellationToken cancellationToken)
    {
        return _repository.GetLatestReportAsync(userId, cancellationToken);
    }

    public Task<InsightLearningGapReport?> GetReportAsync(Guid userId, Guid reportId, CancellationToken cancellationToken)
    {
        return _repository.GetReportAsync(userId, reportId, cancellationToken);
    }

    public Task<InsightLearningGapReport?> GetReportByAttemptAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken)
    {
        return _repository.GetReportByAttemptAsync(userId, attemptId, cancellationToken);
    }

    public async Task<InsightMatchedTutorCard[]> GetMatchedTutorsAsync(Guid userId, Guid reportId, CancellationToken cancellationToken)
    {
        var report = await _repository.GetReportAsync(userId, reportId, cancellationToken)
            ?? throw new KeyNotFoundException("Learning gap report was not found.");
        return await _repository.GetMatchedTutorsAsync(report, cancellationToken);
    }

    public async Task<InsightDashboardSummary> GetDashboardSummaryAsync(Guid userId, CancellationToken cancellationToken)
    {
        var children = await _repository.GetChildrenAsync(userId, cancellationToken);
        var child = children.FirstOrDefault();
        var latestReport = await _repository.GetLatestReportAsync(userId, cancellationToken);

        if (child is null)
        {
            return new InsightDashboardSummary(null, null, null, null, null, null, Array.Empty<string>(), "Add a child profile to start Tutorly Insight.", "Start Diagnostic Test");
        }

        if (latestReport is null)
        {
            return new InsightDashboardSummary(child, null, null, null, null, child.CurrentClass, Array.Empty<string>(), $"{child.ChildName} is ready for a free learning level check.", "Start Diagnostic Test");
        }

        var weakSubjects = latestReport.SubjectScores
            .Where(score => score.Score < 65)
            .Select(score => score.SubjectName)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return new InsightDashboardSummary(
            child,
            latestReport.ReportId,
            latestReport.DiagnosticAttemptId,
            latestReport.OverallLearningScore,
            latestReport.EstimatedActualLevel,
            latestReport.CurrentClass,
            weakSubjects,
            latestReport.ParentExplanation,
            "View Insight Report");
    }

    public Task<InsightProgressReport[]> GetProgressReportsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return _repository.GetProgressReportsAsync(userId, cancellationToken);
    }

    public Task<TutorInsightSummary> GetTutorSummaryAsync(Guid userId, CancellationToken cancellationToken)
    {
        return _repository.GetTutorSummaryAsync(userId, cancellationToken);
    }

    public Task<AdminInsightSummary> GetAdminSummaryAsync(CancellationToken cancellationToken)
    {
        return _repository.GetAdminSummaryAsync(cancellationToken);
    }

    private async Task<InsightDiagnosticAttempt> GetOwnedAttemptAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken)
    {
        if (attemptId == Guid.Empty)
        {
            throw new ArgumentException("attemptId is required.");
        }

        return await _repository.GetAttemptAsync(userId, attemptId, cancellationToken)
            ?? throw new KeyNotFoundException("Diagnostic attempt was not found.");
    }

    private static InsightSubjectScore[] BuildSubjectScores(
        InsightDiagnosticQuestion[] questions,
        IReadOnlyDictionary<Guid, InsightAttemptAnswer> answers,
        int currentClass)
    {
        return questions
            .GroupBy(question => new { question.SubjectCode, question.SubjectName })
            .Select(group =>
            {
                var totalMarks = group.Sum(question => question.Marks);
                var earned = group.Sum(question => answers.TryGetValue(question.Id, out var answer) ? answer.MarksAwarded : 0);
                var score = totalMarks == 0 ? 0 : Math.Round((decimal)earned / totalMarks * 100, 2);
                return new InsightSubjectScore(group.Key.SubjectCode, group.Key.SubjectName, score, EstimateLevel(currentClass, score));
            })
            .OrderBy(score => score.SubjectName)
            .ToArray();
    }

    private static InsightTopicScore[] BuildTopicScores(
        InsightDiagnosticQuestion[] questions,
        IReadOnlyDictionary<Guid, InsightAttemptAnswer> answers)
    {
        return questions
            .GroupBy(question => new { question.SubjectCode, question.TopicCode, question.TopicName })
            .Select(group =>
            {
                var totalMarks = group.Sum(question => question.Marks);
                var earned = group.Sum(question => answers.TryGetValue(question.Id, out var answer) ? answer.MarksAwarded : 0);
                var score = totalMarks == 0 ? 0 : Math.Round((decimal)earned / totalMarks * 100, 2);
                var strength = score >= 75 ? "strong" : score < 60 ? "weak" : "developing";
                return new InsightTopicScore(group.Key.SubjectCode, group.Key.TopicCode, group.Key.TopicName, strength, score);
            })
            .ToArray();
    }

    private static int EstimateLevel(int currentClass, decimal score)
    {
        var gap = score switch
        {
            >= 80 => 0,
            >= 60 => 1,
            >= 40 => 2,
            _ => 3
        };

        return Math.Max(1, currentClass - gap);
    }

    private static string BuildRecommendedTutorType(string[] weakSubjects, InsightTopicScore[] weakTopics, int currentClass)
    {
        var subjectText = weakSubjects.Length == 0 ? "core subjects" : string.Join(", ", weakSubjects);
        var topicText = weakTopics.Length == 0
            ? "revision and exam confidence"
            : string.Join(", ", weakTopics.Take(3).Select(topic => topic.TopicName.ToLowerInvariant()));

        return $"Verified foundation tutor for Class {Math.Max(1, currentClass - 2)} to Class {currentClass}, focused on {subjectText} and {topicText}.";
    }

    private static string BuildThirtyDayPlan(InsightTopicScore[] weakTopics)
    {
        var focus = weakTopics.Length == 0
            ? "weekly revision, mixed practice, and confidence-building checks"
            : string.Join(", ", weakTopics.Take(4).Select(topic => topic.TopicName.ToLowerInvariant()));

        return $"Week 1: rebuild basics in {focus}. Week 2: guided practice with a verified tutor. Week 3: timed worksheets and parent review. Week 4: retest weak topics and adjust tutor plan.";
    }

    private static string BuildParentExplanation(InsightChildProfile child, decimal score, int estimatedLevel, InsightTopicScore[] weakTopics)
    {
        var weakTopicText = weakTopics.Length == 0
            ? "no major weak topic found"
            : string.Join(", ", weakTopics.Take(3).Select(topic => topic.TopicName.ToLowerInvariant()));

        return $"{child.ChildName} is in Class {child.CurrentClass}, and the diagnostic currently places the learning foundation around Class {estimatedLevel} level. Overall learning score is {score:0.#}%. Focus areas: {weakTopicText}.";
    }

    private static string[] NormalizeSubjects(string[] subjects)
    {
        var normalized = (subjects.Length == 0 ? DefaultSubjects : subjects)
            .Select(NormalizeSubject)
            .Where(subject => subject.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return normalized.Length == 0 ? DefaultSubjects : normalized;
    }

    private static string NormalizeSubject(string subject)
    {
        var value = subject.Trim().ToLowerInvariant();
        return value switch
        {
            "mathematics" => "math",
            "maths" => "math",
            "eng" => "english",
            _ => value
        };
    }
}
