using Dapper;
using System.Data;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Infrastructure.Data;

namespace Tutorly.Infrastructure.Repositories;

public sealed class TutorlyInsightRepository : ITutorlyInsightRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public TutorlyInsightRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<InsightChildProfile[]> GetChildrenAsync(Guid userId, CancellationToken cancellationToken)
    {
        const string sql = """
            select
                sp.Id as ChildId,
                coalesce(nullif(sp.ChildName, ''), u.FullName) as ChildName,
                coalesce(sp.CurrentClass, 5) as CurrentClass,
                coalesce(nullif(sp.City, ''), 'Karachi') as City,
                sp.Area,
                coalesce(nullif(sp.PreferredLearningModeCode, ''), 'online') as PreferredLearningMode,
                sp.BoardCode
            from studentProfiles sp
            inner join users u on u.Id = sp.UserId
            where sp.UserId = @UserId
            order by sp.CreatedAtUtc;
            """;

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<InsightChildProfile>(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken));
        return rows.ToArray();
    }

    public async Task<InsightDiagnosticQuestion[]> GetQuestionsAsync(int classLevel, string[] subjectCodes, CancellationToken cancellationToken)
    {
        const string sql = """
            select
                Id,
                SubjectCode,
                SubjectName,
                ClassLevel,
                TopicCode,
                TopicName,
                DifficultyCode as Difficulty,
                QuestionText,
                Marks
            from insightDiagnosticQuestions
            where ClassLevel = @ClassLevel
              and SubjectCode in @SubjectCodes
              and IsActive = 1
            order by SubjectCode, SortOrder;

            select
                o.Id,
                o.QuestionId,
                o.OptionCode,
                o.OptionText
            from insightDiagnosticOptions o
            inner join insightDiagnosticQuestions q on q.Id = o.QuestionId
            where q.ClassLevel = @ClassLevel
              and q.SubjectCode in @SubjectCodes
              and q.IsActive = 1
            order by q.SubjectCode, q.SortOrder, o.SortOrder;
            """;

        using var connection = _connectionFactory.CreateConnection();
        using var grid = await connection.QueryMultipleAsync(new CommandDefinition(
            sql,
            new { ClassLevel = classLevel, SubjectCodes = subjectCodes },
            cancellationToken: cancellationToken));
        var questions = (await grid.ReadAsync<InsightQuestionRow>()).ToArray();
        var options = (await grid.ReadAsync<InsightOptionRow>())
            .GroupBy(option => option.QuestionId)
            .ToDictionary(group => group.Key, group => group.Select(option => new InsightDiagnosticOption(option.Id, option.OptionCode, option.OptionText)).ToArray());

        return questions
            .Select(question => new InsightDiagnosticQuestion(
                question.Id,
                question.SubjectCode,
                question.SubjectName,
                question.ClassLevel,
                question.TopicCode,
                question.TopicName,
                question.Difficulty,
                question.QuestionText,
                question.Marks,
                options.TryGetValue(question.Id, out var questionOptions) ? questionOptions : Array.Empty<InsightDiagnosticOption>()))
            .ToArray();
    }

    public async Task<InsightDiagnosticAttempt?> GetActiveAttemptAsync(Guid userId, Guid childId, int currentClass, string[] subjectCodes, CancellationToken cancellationToken)
    {
        const string sql = """
            select top 1
                Id as AttemptId,
                ChildProfileId as ChildId,
                ParentUserId,
                CurrentClass,
                SubjectCodes,
                StatusCode as Status,
                StartedAtUtc,
                CompletedAtUtc
            from insightDiagnosticAttempts
            where ParentUserId = @UserId
              and ChildProfileId = @ChildId
              and CurrentClass = @CurrentClass
              and SubjectCodes = @SubjectCodes
              and StatusCode = 'started'
            order by StartedAtUtc desc;
            """;

        using var connection = _connectionFactory.CreateConnection();
        var row = await connection.QuerySingleOrDefaultAsync<AttemptRow>(new CommandDefinition(
            sql,
            new { UserId = userId, ChildId = childId, CurrentClass = currentClass, SubjectCodes = JoinSubjects(subjectCodes) },
            cancellationToken: cancellationToken));
        return row?.ToAttempt();
    }

    public async Task<InsightDiagnosticAttempt?> GetAttemptAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken)
    {
        const string sql = """
            select
                a.Id as AttemptId,
                a.ChildProfileId as ChildId,
                a.ParentUserId,
                a.CurrentClass,
                a.SubjectCodes,
                a.StatusCode as Status,
                a.StartedAtUtc,
                a.CompletedAtUtc
            from insightDiagnosticAttempts a
            inner join studentProfiles sp on sp.Id = a.ChildProfileId
            where a.Id = @AttemptId
              and (a.ParentUserId = @UserId or sp.UserId = @UserId);
            """;

        using var connection = _connectionFactory.CreateConnection();
        var row = await connection.QuerySingleOrDefaultAsync<AttemptRow>(new CommandDefinition(
            sql,
            new { UserId = userId, AttemptId = attemptId },
            cancellationToken: cancellationToken));
        return row?.ToAttempt();
    }

    public async Task<InsightDiagnosticAttempt> CreateAttemptAsync(Guid userId, StartInsightDiagnosticAttemptRequest request, string[] subjectCodes, CancellationToken cancellationToken)
    {
        const string sql = """
            if not exists
            (
                select 1
                from studentProfiles
                where Id = @ChildId
                  and UserId = @UserId
            )
                throw 51001, 'Child profile does not belong to this account.', 1;

            declare @AttemptId uniqueidentifier = newid();

            insert into insightDiagnosticAttempts
            (
                Id, ChildProfileId, ParentUserId, CurrentClass, SubjectCodes, StatusCode, StartedAtUtc
            )
            values
            (
                @AttemptId, @ChildId, @UserId, @CurrentClass, @SubjectCodes, 'started', sysutcdatetime()
            );

            select
                @AttemptId as AttemptId,
                @ChildId as ChildId,
                @UserId as ParentUserId,
                @CurrentClass as CurrentClass,
                @SubjectCodes as SubjectCodes,
                'started' as Status,
                sysutcdatetime() as StartedAtUtc,
                cast(null as datetime2) as CompletedAtUtc;
            """;

        using var connection = _connectionFactory.CreateConnection();
        var row = await connection.QuerySingleAsync<AttemptRow>(new CommandDefinition(
            sql,
            new
            {
                UserId = userId,
                ChildId = request.ChildId,
                request.CurrentClass,
                SubjectCodes = JoinSubjects(subjectCodes)
            },
            cancellationToken: cancellationToken));
        return row.ToAttempt();
    }

    public async Task<SubmitInsightAnswerResponse> SaveAnswerAsync(Guid userId, Guid attemptId, Guid questionId, string selectedOptionCode, CancellationToken cancellationToken)
    {
        const string sql = """
            declare @CurrentClass int;
            declare @SubjectCodes nvarchar(300);

            select
                @CurrentClass = CurrentClass,
                @SubjectCodes = SubjectCodes
            from insightDiagnosticAttempts
            where Id = @AttemptId
              and ParentUserId = @UserId
              and StatusCode = 'started';

            if @CurrentClass is null
                throw 51002, 'Diagnostic attempt is not active.', 1;

            declare @CorrectOptionCode nvarchar(10);
            declare @Marks int;

            select
                @CorrectOptionCode = CorrectOptionCode,
                @Marks = Marks
            from insightDiagnosticQuestions
            where Id = @QuestionId
              and ClassLevel = @CurrentClass
              and charindex(',' + SubjectCode + ',', ',' + @SubjectCodes + ',') > 0
              and IsActive = 1;

            if @CorrectOptionCode is null
                throw 51003, 'Question does not belong to this diagnostic attempt.', 1;

            if not exists
            (
                select 1
                from insightDiagnosticOptions
                where QuestionId = @QuestionId
                  and OptionCode = @SelectedOptionCode
            )
                throw 51004, 'Selected option is invalid.', 1;

            declare @IsCorrect bit = case when @CorrectOptionCode = @SelectedOptionCode then 1 else 0 end;
            declare @MarksAwarded int = case when @IsCorrect = 1 then @Marks else 0 end;

            if exists (select 1 from insightDiagnosticAttemptAnswers where AttemptId = @AttemptId and QuestionId = @QuestionId)
            begin
                update insightDiagnosticAttemptAnswers
                set SelectedOptionCode = @SelectedOptionCode,
                    IsCorrect = @IsCorrect,
                    MarksAwarded = @MarksAwarded,
                    AnsweredAtUtc = sysutcdatetime()
                where AttemptId = @AttemptId
                  and QuestionId = @QuestionId;
            end
            else
            begin
                insert into insightDiagnosticAttemptAnswers
                (
                    Id, AttemptId, QuestionId, SelectedOptionCode, IsCorrect, MarksAwarded, AnsweredAtUtc
                )
                values
                (
                    newid(), @AttemptId, @QuestionId, @SelectedOptionCode, @IsCorrect, @MarksAwarded, sysutcdatetime()
                );
            end;

            select @AttemptId as AttemptId, @QuestionId as QuestionId, @IsCorrect as IsCorrect, @MarksAwarded as MarksAwarded;
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleAsync<SubmitInsightAnswerResponse>(new CommandDefinition(
            sql,
            new { UserId = userId, AttemptId = attemptId, QuestionId = questionId, SelectedOptionCode = selectedOptionCode },
            cancellationToken: cancellationToken));
    }

    public async Task<InsightAttemptAnswer[]> GetAttemptAnswersAsync(Guid attemptId, CancellationToken cancellationToken)
    {
        const string sql = """
            select QuestionId, SelectedOptionCode, IsCorrect, MarksAwarded
            from insightDiagnosticAttemptAnswers
            where AttemptId = @AttemptId;
            """;

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<InsightAttemptAnswer>(new CommandDefinition(sql, new { AttemptId = attemptId }, cancellationToken: cancellationToken));
        return rows.ToArray();
    }

    public async Task CompleteAttemptAsync(Guid attemptId, decimal score, int estimatedLevel, string recommendedTutorType, CancellationToken cancellationToken)
    {
        const string sql = """
            update insightDiagnosticAttempts
            set StatusCode = 'completed',
                CompletedAtUtc = coalesce(CompletedAtUtc, sysutcdatetime()),
                OverallLearningScore = @Score,
                EstimatedActualLevel = @EstimatedLevel,
                RecommendedTutorType = @RecommendedTutorType
            where Id = @AttemptId;
            """;

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new { AttemptId = attemptId, Score = score, EstimatedLevel = estimatedLevel, RecommendedTutorType = recommendedTutorType },
            cancellationToken: cancellationToken));
    }

    public async Task<InsightLearningGapReport> SaveReportAsync(InsightLearningGapReport report, CancellationToken cancellationToken)
    {
        const string deleteSql = """
            declare @ExistingReportId uniqueidentifier = (select Id from insightLearningGapReports where DiagnosticAttemptId = @DiagnosticAttemptId);

            if @ExistingReportId is not null
            begin
                delete from insightLearningGapReportTopics where ReportId = @ExistingReportId;
                delete from insightLearningGapReportSubjects where ReportId = @ExistingReportId;
                delete from insightLearningGapReports where Id = @ExistingReportId;
            end;
            """;

        const string reportSql = """
            insert into insightLearningGapReports
            (
                Id, DiagnosticAttemptId, ChildProfileId, ParentUserId, CurrentClass, EstimatedActualLevel,
                OverallLearningScore, RecommendedTutorType, ThirtyDayPlan, ParentExplanation, CreatedAtUtc
            )
            values
            (
                @ReportId, @DiagnosticAttemptId, @ChildId, @ParentUserId, @CurrentClass, @EstimatedActualLevel,
                @OverallLearningScore, @RecommendedTutorType, @ThirtyDayPlan, @ParentExplanation, @CreatedAtUtc
            );
            """;

        const string subjectSql = """
            insert into insightLearningGapReportSubjects
            (
                Id, ReportId, SubjectCode, SubjectName, Score, EstimatedLevel
            )
            values
            (
                newid(), @ReportId, @SubjectCode, @SubjectName, @Score, @EstimatedLevel
            );
            """;

        const string topicSql = """
            insert into insightLearningGapReportTopics
            (
                Id, ReportId, SubjectCode, TopicCode, TopicName, StrengthCode, Score
            )
            values
            (
                newid(), @ReportId, @SubjectCode, @TopicCode, @TopicName, @StrengthCode, @Score
            );
            """;

        using var connection = _connectionFactory.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction();
        await connection.ExecuteAsync(new CommandDefinition(deleteSql, new { report.DiagnosticAttemptId }, transaction, cancellationToken: cancellationToken));
        await connection.ExecuteAsync(new CommandDefinition(
            reportSql,
            new
            {
                report.ReportId,
                report.DiagnosticAttemptId,
                report.ChildId,
                ParentUserId = report.ChildId == Guid.Empty ? Guid.Empty : await GetParentUserIdAsync(connection, transaction, report.ChildId, cancellationToken),
                report.CurrentClass,
                report.EstimatedActualLevel,
                report.OverallLearningScore,
                report.RecommendedTutorType,
                report.ThirtyDayPlan,
                report.ParentExplanation,
                report.CreatedAtUtc
            },
            transaction,
            cancellationToken: cancellationToken));

        foreach (var subject in report.SubjectScores)
        {
            await connection.ExecuteAsync(new CommandDefinition(
                subjectSql,
                new
                {
                    report.ReportId,
                    subject.SubjectCode,
                    subject.SubjectName,
                    subject.Score,
                    subject.EstimatedLevel
                },
                transaction,
                cancellationToken: cancellationToken));
        }

        foreach (var topic in report.WeakTopics.Concat(report.StrongTopics))
        {
            await connection.ExecuteAsync(new CommandDefinition(
                topicSql,
                new
                {
                    report.ReportId,
                    topic.SubjectCode,
                    topic.TopicCode,
                    topic.TopicName,
                    topic.StrengthCode,
                    topic.Score
                },
                transaction,
                cancellationToken: cancellationToken));
        }

        transaction.Commit();
        return await GetReportByAttemptAsync(await GetParentUserIdAsync(report.ChildId, cancellationToken), report.DiagnosticAttemptId, cancellationToken)
            ?? report;
    }

    public Task<InsightLearningGapReport?> GetLatestReportAsync(Guid userId, CancellationToken cancellationToken)
    {
        const string sql = """
            select top 1 Id
            from insightLearningGapReports
            where ParentUserId = @UserId
            order by CreatedAtUtc desc;
            """;

        return GetReportIdThenReportAsync(sql, new { UserId = userId }, userId, cancellationToken);
    }

    public Task<InsightLearningGapReport?> GetReportAsync(Guid userId, Guid reportId, CancellationToken cancellationToken)
    {
        return ReadReportAsync(userId, reportId, cancellationToken);
    }

    public Task<InsightLearningGapReport?> GetReportByAttemptAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken)
    {
        const string sql = """
            select top 1 Id
            from insightLearningGapReports
            where ParentUserId = @UserId
              and DiagnosticAttemptId = @AttemptId
            order by CreatedAtUtc desc;
            """;

        return GetReportIdThenReportAsync(sql, new { UserId = userId, AttemptId = attemptId }, userId, cancellationToken);
    }

    public async Task<InsightMatchedTutorCard[]> GetMatchedTutorsAsync(InsightLearningGapReport report, CancellationToken cancellationToken)
    {
        const string sql = """
            select top 12
                tp.Slug as TutorId,
                u.FullName as Name,
                coalesce(f.PublicUrl, tp.PhotoUrl) as PhotoUrl,
                tp.Initials,
                (
                    select string_agg(v.Name, '|') within group (order by v.Name)
                    from tutorSubjects x
                    inner join lookupValues v on v.Id = x.SubjectLookupValueId
                    where x.TutorProfileId = tp.Id
                ) as Subjects,
                city.Name as City,
                cast(null as nvarchar(160)) as Area,
                tp.ExperienceYears,
                cast(case when tp.VerificationStatusCode = 'verified' then 1 else 0 end as bit) as Verified,
                cast(coalesce(tqm.IsCnicVerified, 0) as bit) as IsCnicVerified,
                cast(coalesce(tqm.IsQualificationVerified, 0) as bit) as IsQualificationVerified,
                coalesce(tqm.QualityScore, 70) as TutorQualityScore,
                tqm.AverageImprovementPercent as AverageStudentImprovementPercent,
                tqm.ComplaintRate,
                coalesce
                (
                    (
                        select string_agg(v.Name, ', ') within group (order by v.Name)
                        from tutorClassLevels x
                        inner join lookupValues v on v.Id = x.ClassLevelLookupValueId
                        where x.TutorProfileId = tp.Id
                    ),
                    'Class 1-8'
                ) as BestForClassRange,
                cast(case when nullif(tp.NextSlot, '') is not null then 1 else 0 end as bit) as TrialClassAvailable,
                tp.FeeText as EstimatedFee,
                cast
                (
                    coalesce(tqm.QualityScore, 70)
                    + case when exists
                      (
                          select 1
                          from tutorSubjects x
                          inner join lookupValues v on v.Id = x.SubjectLookupValueId
                          where x.TutorProfileId = tp.Id
                            and v.Name in @SubjectNames
                      ) then 20 else 0 end
                    + case when city.Name = @City then 8 else 0 end
                    + case when exists
                      (
                          select 1
                          from tutorClassLevels x
                          inner join lookupValues v on v.Id = x.ClassLevelLookupValueId
                          where x.TutorProfileId = tp.Id
                            and
                            (
                                (@CurrentClass between 1 and 5 and v.Code = 'grade-1-5')
                                or (@CurrentClass between 6 and 8 and v.Code = 'grade-6-8')
                                or v.Code in ('grade-9-10-o-levels', 'a-levels', 'test-prep')
                            )
                      ) then 12 else 0 end
                    - coalesce(tqm.ComplaintRate, 0)
                    as decimal(6,2)
                ) as MatchScore
            from tutorProfiles tp
            inner join users u on u.Id = tp.UserId
            left join lookupValues city on city.Id = tp.CityLookupValueId
            left join fileUploads f on f.Id = tp.PhotoFileId
            left join tutorQualityMetrics tqm on tqm.TutorProfileId = tp.Id
            where u.StatusCode = 'active'
              and tp.VerificationStatusCode = 'verified'
            order by MatchScore desc, tp.Rating desc, tp.ReviewCount desc;
            """;

        var subjectNames = report.WeakTopics
            .Select(topic => MapSubjectName(topic.SubjectCode))
            .Concat(report.SubjectScores.Where(score => score.Score < 75).Select(score => score.SubjectName))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .DefaultIfEmpty("Mathematics")
            .ToArray();
        var city = await GetChildCityAsync(report.ChildId, cancellationToken);
        var topWeak = report.WeakTopics.FirstOrDefault();

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<MatchedTutorRow>(new CommandDefinition(
            sql,
            new { SubjectNames = subjectNames, City = city, CurrentClass = report.CurrentClass },
            cancellationToken: cancellationToken));

        return rows
            .Select(row => new InsightMatchedTutorCard(
                row.TutorId,
                row.Name,
                row.PhotoUrl,
                row.Initials,
                SplitList(row.Subjects),
                row.City ?? "",
                row.Area,
                row.ExperienceYears,
                row.Verified,
                row.IsCnicVerified,
                row.IsQualificationVerified,
                row.TutorQualityScore,
                row.AverageStudentImprovementPercent,
                row.ComplaintRate,
                row.BestForClassRange,
                row.TrialClassAvailable,
                row.EstimatedFee,
                row.MatchScore,
                BuildTutorMatchReason(SplitList(row.Subjects), report, topWeak)))
            .ToArray();
    }

    public async Task<InsightProgressReport[]> GetProgressReportsAsync(Guid userId, CancellationToken cancellationToken)
    {
        const string sql = """
            select
                pr.Id,
                pr.ChildProfileId as ChildId,
                coalesce(sp.ChildName, u.FullName) as ChildName,
                coalesce(tu.FullName, 'Tutorly Tutor') as TutorName,
                format(pr.ReportMonth, 'MMM yyyy') as ReportMonth,
                pr.BeforeScore,
                pr.AfterScore,
                pr.TutorAttendanceCount,
                pr.ParentFeedback,
                pr.RecommendationCode as Recommendation
            from studentProgressReports pr
            inner join studentProfiles sp on sp.Id = pr.ChildProfileId
            inner join users u on u.Id = sp.UserId
            left join tutorProfiles tp on tp.Id = pr.TutorProfileId
            left join users tu on tu.Id = tp.UserId
            where sp.UserId = @UserId
            order by pr.ReportMonth desc;

            select
                ps.ProgressReportId,
                ps.SubjectCode,
                ps.SubjectName,
                ps.BeforeScore,
                ps.AfterScore,
                ps.ImprovementPercent
            from studentProgressReportSubjects ps
            inner join studentProgressReports pr on pr.Id = ps.ProgressReportId
            inner join studentProfiles sp on sp.Id = pr.ChildProfileId
            where sp.UserId = @UserId;

            select
                pt.ProgressReportId,
                pt.TopicName,
                pt.StatusCode
            from studentProgressReportTopics pt
            inner join studentProgressReports pr on pr.Id = pt.ProgressReportId
            inner join studentProfiles sp on sp.Id = pr.ChildProfileId
            where sp.UserId = @UserId;
            """;

        using var connection = _connectionFactory.CreateConnection();
        using var grid = await connection.QueryMultipleAsync(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken));
        var reports = (await grid.ReadAsync<ProgressReportRow>()).ToArray();
        var subjects = (await grid.ReadAsync<ProgressSubjectRow>())
            .GroupBy(row => row.ProgressReportId)
            .ToDictionary(group => group.Key, group => group.Select(row => new InsightProgressSubject(row.SubjectCode, row.SubjectName, row.BeforeScore, row.AfterScore, row.ImprovementPercent)).ToArray());
        var topics = (await grid.ReadAsync<ProgressTopicRow>())
            .GroupBy(row => row.ProgressReportId)
            .ToDictionary(group => group.Key, group => group.ToArray());

        return reports
            .Select(row =>
            {
                var reportTopics = topics.TryGetValue(row.Id, out var topicRows) ? topicRows : Array.Empty<ProgressTopicRow>();
                return new InsightProgressReport(
                    row.Id,
                    row.ChildId,
                    row.ChildName,
                    row.TutorName,
                    row.ReportMonth,
                    row.BeforeScore,
                    row.AfterScore,
                    subjects.TryGetValue(row.Id, out var subjectRows) ? subjectRows : Array.Empty<InsightProgressSubject>(),
                    reportTopics.Where(topic => topic.StatusCode == "completed").Select(topic => topic.TopicName).ToArray(),
                    reportTopics.Where(topic => topic.StatusCode == "still-weak").Select(topic => topic.TopicName).ToArray(),
                    row.TutorAttendanceCount,
                    row.ParentFeedback,
                    row.Recommendation);
            })
            .ToArray();
    }

    public async Task<TutorInsightSummary> GetTutorSummaryAsync(Guid userId, CancellationToken cancellationToken)
    {
        const string sql = """
            select top 1
                coalesce(tqm.QualityScore, 72) as QualityScore,
                tqm.ParentFeedbackScore as FeedbackScore,
                3 as AssignedInsightStudents,
                2 as ProgressReportsPending
            from tutorProfiles tp
            left join tutorQualityMetrics tqm on tqm.TutorProfileId = tp.Id
            where tp.UserId = @UserId;
            """;

        using var connection = _connectionFactory.CreateConnection();
        var row = await connection.QuerySingleOrDefaultAsync<TutorSummaryRow>(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken))
            ?? new TutorSummaryRow(72, 4.2m, 0, 0);

        return new TutorInsightSummary(
            row.QualityScore,
            row.FeedbackScore,
            row.AssignedInsightStudents,
            row.ProgressReportsPending,
            new[]
            {
                "Upload monthly before/after topic scores.",
                "Keep trial class notes short and parent-friendly.",
                "Focus recommendations on weak topics, not generic homework."
            });
    }

    public async Task<AdminInsightSummary> GetAdminSummaryAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            select
                (select count(*) from insightDiagnosticAttempts) as TotalDiagnosticAttempts,
                (select count(*) from insightLearningGapReports) as ReportsGenerated,
                (select count(*) from tutorProfiles where VerificationStatusCode <> 'verified') as TutorsNeedingVerification,
                2 as ProgressReportsPending,
                (select count(*) from tutorQualityMetrics where QualityScore < 70 or ComplaintRate > 8) as LowQualityTutors;
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleAsync<AdminInsightSummary>(new CommandDefinition(sql, cancellationToken: cancellationToken));
    }

    private async Task<InsightLearningGapReport?> GetReportIdThenReportAsync(string sql, object parameters, Guid userId, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();
        var reportId = await connection.ExecuteScalarAsync<Guid?>(new CommandDefinition(sql, parameters, cancellationToken: cancellationToken));
        return reportId is null ? null : await ReadReportAsync(userId, reportId.Value, cancellationToken);
    }

    private async Task<InsightLearningGapReport?> ReadReportAsync(Guid userId, Guid reportId, CancellationToken cancellationToken)
    {
        const string sql = """
            select
                r.Id as ReportId,
                r.ChildProfileId as ChildId,
                r.DiagnosticAttemptId,
                coalesce(sp.ChildName, u.FullName) as ChildName,
                r.CurrentClass,
                r.EstimatedActualLevel,
                r.OverallLearningScore,
                r.RecommendedTutorType,
                r.ThirtyDayPlan,
                r.ParentExplanation,
                r.CreatedAtUtc
            from insightLearningGapReports r
            inner join studentProfiles sp on sp.Id = r.ChildProfileId
            inner join users u on u.Id = sp.UserId
            where r.Id = @ReportId
              and r.ParentUserId = @UserId;

            select SubjectCode, SubjectName, Score, EstimatedLevel
            from insightLearningGapReportSubjects
            where ReportId = @ReportId
            order by SubjectName;

            select SubjectCode, TopicCode, TopicName, StrengthCode, Score
            from insightLearningGapReportTopics
            where ReportId = @ReportId
            order by StrengthCode, Score;
            """;

        using var connection = _connectionFactory.CreateConnection();
        using var grid = await connection.QueryMultipleAsync(new CommandDefinition(
            sql,
            new { UserId = userId, ReportId = reportId },
            cancellationToken: cancellationToken));
        var row = await grid.ReadSingleOrDefaultAsync<ReportRow>();
        if (row is null)
        {
            return null;
        }

        var subjects = (await grid.ReadAsync<InsightSubjectScore>()).ToArray();
        var topics = (await grid.ReadAsync<InsightTopicScore>()).ToArray();
        return row.ToReport(
            subjects,
            topics.Where(topic => topic.StrengthCode == "weak").ToArray(),
            topics.Where(topic => topic.StrengthCode == "strong").ToArray());
    }

    private async Task<Guid> GetParentUserIdAsync(IDbConnection connection, IDbTransaction transaction, Guid childId, CancellationToken cancellationToken)
    {
        const string sql = "select UserId from studentProfiles where Id = @ChildId;";
        return await connection.ExecuteScalarAsync<Guid>(new CommandDefinition(sql, new { ChildId = childId }, transaction, cancellationToken: cancellationToken));
    }

    private async Task<Guid> GetParentUserIdAsync(Guid childId, CancellationToken cancellationToken)
    {
        const string sql = "select UserId from studentProfiles where Id = @ChildId;";
        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<Guid>(new CommandDefinition(sql, new { ChildId = childId }, cancellationToken: cancellationToken));
    }

    private async Task<string> GetChildCityAsync(Guid childId, CancellationToken cancellationToken)
    {
        const string sql = "select coalesce(nullif(City, ''), 'Karachi') from studentProfiles where Id = @ChildId;";
        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<string?>(new CommandDefinition(sql, new { ChildId = childId }, cancellationToken: cancellationToken)) ?? "Karachi";
    }

    private static string JoinSubjects(string[] subjects)
    {
        return string.Join(",", subjects.Select(subject => subject.Trim().ToLowerInvariant()).OrderBy(subject => subject));
    }

    private static string[] SplitSubjects(string subjectCodes)
    {
        return subjectCodes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    private static string[] SplitList(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? Array.Empty<string>()
            : value.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    private static string MapSubjectName(string subjectCode)
    {
        return subjectCode.Equals("math", StringComparison.OrdinalIgnoreCase) ? "Mathematics" : subjectCode[..1].ToUpperInvariant() + subjectCode[1..];
    }

    private static string BuildTutorMatchReason(string[] tutorSubjects, InsightLearningGapReport report, InsightTopicScore? fallbackWeakTopic)
    {
        var matchingWeakTopic = report.WeakTopics.FirstOrDefault(topic =>
            tutorSubjects.Contains(MapSubjectName(topic.SubjectCode), StringComparer.OrdinalIgnoreCase));

        if (matchingWeakTopic is not null)
        {
            return $"Strong fit for {MapSubjectName(matchingWeakTopic.SubjectCode)} gap: {matchingWeakTopic.TopicName.ToLowerInvariant()}.";
        }

        if (fallbackWeakTopic is not null)
        {
            return $"Verified tutor with high Tutor Quality Score for Class {report.CurrentClass} support.";
        }

        return "Verified tutor with strong parent feedback and trial class availability.";
    }

    private sealed record InsightQuestionRow(
        Guid Id,
        string SubjectCode,
        string SubjectName,
        int ClassLevel,
        string TopicCode,
        string TopicName,
        string Difficulty,
        string QuestionText,
        int Marks);

    private sealed record InsightOptionRow(Guid Id, Guid QuestionId, string OptionCode, string OptionText);

    private sealed record AttemptRow(
        Guid AttemptId,
        Guid ChildId,
        Guid ParentUserId,
        int CurrentClass,
        string SubjectCodes,
        string Status,
        DateTime StartedAtUtc,
        DateTime? CompletedAtUtc)
    {
        public InsightDiagnosticAttempt ToAttempt()
        {
            return new InsightDiagnosticAttempt(AttemptId, ChildId, ParentUserId, CurrentClass, SplitSubjects(SubjectCodes), Status, StartedAtUtc, CompletedAtUtc);
        }
    }

    private sealed record ReportRow(
        Guid ReportId,
        Guid ChildId,
        Guid DiagnosticAttemptId,
        string ChildName,
        int CurrentClass,
        int EstimatedActualLevel,
        decimal OverallLearningScore,
        string RecommendedTutorType,
        string ThirtyDayPlan,
        string ParentExplanation,
        DateTime CreatedAtUtc)
    {
        public InsightLearningGapReport ToReport(
            InsightSubjectScore[] subjectScores,
            InsightTopicScore[] weakTopics,
            InsightTopicScore[] strongTopics)
        {
            return new InsightLearningGapReport(
                ReportId,
                ChildId,
                DiagnosticAttemptId,
                ChildName,
                CurrentClass,
                EstimatedActualLevel,
                OverallLearningScore,
                subjectScores,
                weakTopics,
                strongTopics,
                RecommendedTutorType,
                ThirtyDayPlan,
                ParentExplanation,
                CreatedAtUtc);
        }
    }

    private sealed record MatchedTutorRow(
        string TutorId,
        string Name,
        string PhotoUrl,
        string Initials,
        string? Subjects,
        string? City,
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
        decimal MatchScore);

    private sealed record ProgressReportRow(
        Guid Id,
        Guid ChildId,
        string ChildName,
        string TutorName,
        string ReportMonth,
        decimal BeforeScore,
        decimal AfterScore,
        int TutorAttendanceCount,
        string? ParentFeedback,
        string Recommendation);

    private sealed record ProgressSubjectRow(
        Guid ProgressReportId,
        string SubjectCode,
        string SubjectName,
        decimal BeforeScore,
        decimal AfterScore,
        decimal ImprovementPercent);

    private sealed record ProgressTopicRow(Guid ProgressReportId, string TopicName, string StatusCode);

    private sealed record TutorSummaryRow(decimal QualityScore, decimal? FeedbackScore, int AssignedInsightStudents, int ProgressReportsPending);
}
