using Dapper;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Infrastructure.Data;

namespace Tutorly.Infrastructure.Repositories;

public sealed class SavedTutorRepository : ISavedTutorRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public SavedTutorRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<TutorSummary>> GetSavedTutorsAsync(Guid userId, CancellationToken cancellationToken)
    {
        const string sql = """
            select
                tp.Slug as Id,
                u.FullName as Name,
                coalesce(f.PublicUrl, tp.PhotoUrl) as PhotoUrl,
                tp.Initials,
                cast(case when tp.VerificationStatusCode = 'verified' then 1 else 0 end as bit) as Verified,
                tp.Rating,
                tp.ReviewCount as Reviews,
                city.Name as City,
                (
                    select string_agg(v.Name, '|') within group (order by v.Name)
                    from tutorSubjects x
                    inner join lookupValues v on v.Id = x.SubjectLookupValueId
                    where x.TutorProfileId = tp.Id
                ) as Subjects,
                (
                    select string_agg(v.Name, '|') within group (order by v.Name)
                    from tutorClassLevels x
                    inner join lookupValues v on v.Id = x.ClassLevelLookupValueId
                    where x.TutorProfileId = tp.Id
                ) as ClassLevels,
                tp.ExperienceYears,
                tp.FeeText,
                tp.FeeAmount,
                mode.Name as TeachingMode,
                (
                    select string_agg(v.Name, '|') within group (order by v.Name)
                    from tutorLanguages x
                    inner join lookupValues v on v.Id = x.LanguageLookupValueId
                    where x.TutorProfileId = tp.Id
                ) as Languages,
                tp.NextSlot,
                gender.Name as Gender,
                tp.ResponseTime,
                tp.StudentsTaught,
                tp.MatchPercentage,
                tp.MatchReason,
                tp.Tagline
            from savedTutors s
            inner join tutorProfiles tp on tp.Id = s.TutorProfileId
            inner join users u on u.Id = tp.UserId
            inner join lookupValues city on city.Id = tp.CityLookupValueId
            inner join lookupValues mode on mode.Id = tp.TeachingModeLookupValueId
            inner join lookupValues gender on gender.Id = tp.GenderLookupValueId
            left join fileUploads f on f.Id = tp.PhotoFileId
            where s.StudentUserId = @UserId and u.StatusCode = 'active'
            order by s.CreatedAtUtc desc;
            """;

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken));
        return rows.Select(MapTutorSummary).ToArray();
    }

    public async Task SaveTutorAsync(Guid userId, string tutorId, CancellationToken cancellationToken)
    {
        const string sql = """
            insert into savedTutors (StudentUserId, TutorProfileId, CreatedAtUtc)
            select @UserId, tp.Id, sysutcdatetime()
            from tutorProfiles tp
            where tp.Slug = @TutorId
              and not exists (
                  select 1
                  from savedTutors s
                  where s.StudentUserId = @UserId and s.TutorProfileId = tp.Id
              );
            """;

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(new CommandDefinition(sql, new { UserId = userId, TutorId = tutorId }, cancellationToken: cancellationToken));
    }

    public async Task RemoveSavedTutorAsync(Guid userId, string tutorId, CancellationToken cancellationToken)
    {
        const string sql = """
            delete s
            from savedTutors s
            inner join tutorProfiles tp on tp.Id = s.TutorProfileId
            where s.StudentUserId = @UserId and tp.Slug = @TutorId;
            """;

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(new CommandDefinition(sql, new { UserId = userId, TutorId = tutorId }, cancellationToken: cancellationToken));
    }

    private static TutorSummary MapTutorSummary(dynamic row)
    {
        return new TutorSummary(
            row.Id,
            row.Name,
            row.PhotoUrl,
            row.Initials,
            row.Verified,
            row.Rating,
            row.Reviews,
            row.City,
            SqlMapping.SplitList(Convert.ToString(row.Subjects)),
            SqlMapping.SplitList(Convert.ToString(row.ClassLevels)),
            row.ExperienceYears,
            row.FeeText,
            row.FeeAmount,
            row.TeachingMode,
            SqlMapping.SplitList(Convert.ToString(row.Languages)),
            row.NextSlot,
            row.Gender,
            row.ResponseTime,
            row.StudentsTaught,
            row.MatchPercentage,
            row.MatchReason,
            row.Tagline);
    }
}
