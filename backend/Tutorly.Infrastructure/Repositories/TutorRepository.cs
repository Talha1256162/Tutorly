using Dapper;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Infrastructure.Data;

namespace Tutorly.Infrastructure.Repositories;

public sealed class TutorRepository : ITutorRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public TutorRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<TutorSummary>> SearchAsync(TutorSearchQuery query, CancellationToken cancellationToken)
    {
        const string sql = """
            select top 60
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
            from tutorProfiles tp
            inner join users u on u.Id = tp.UserId
            inner join lookupValues city on city.Id = tp.CityLookupValueId
            inner join lookupValues mode on mode.Id = tp.TeachingModeLookupValueId
            inner join lookupValues gender on gender.Id = tp.GenderLookupValueId
            left join fileUploads f on f.Id = tp.PhotoFileId
            where u.StatusCode = 'active'
              and (@Search is null
                   or u.FullName like '%' + @Search + '%'
                   or tp.Tagline like '%' + @Search + '%'
                   or city.Name like '%' + @Search + '%'
                   or exists (
                        select 1
                        from tutorSubjects x
                        inner join lookupValues v on v.Id = x.SubjectLookupValueId
                        where x.TutorProfileId = tp.Id and v.Name like '%' + @Search + '%'
                   ))
              and (@MaxFee is null or tp.FeeAmount <= @MaxFee)
              and (@MinFee is null or tp.FeeAmount >= @MinFee)
              and (@HasSubjects = 0 or exists (
                    select 1
                    from tutorSubjects x
                    inner join lookupValues v on v.Id = x.SubjectLookupValueId
                    where x.TutorProfileId = tp.Id and (v.Name in @Subjects or v.Code in @Subjects)
              ))
              and (@HasClassLevels = 0 or exists (
                    select 1
                    from tutorClassLevels x
                    inner join lookupValues v on v.Id = x.ClassLevelLookupValueId
                    where x.TutorProfileId = tp.Id and (v.Name in @ClassLevels or v.Code in @ClassLevels)
              ))
              and (@HasCities = 0 or city.Name in @Cities or city.Code in @Cities)
              and (@HasModes = 0 or mode.Name in @Modes or mode.Code in @Modes)
              and (@HasGenders = 0 or gender.Name in @Genders or gender.Code in @Genders)
              and (@HasLanguages = 0 or exists (
                    select 1
                    from tutorLanguages x
                    inner join lookupValues v on v.Id = x.LanguageLookupValueId
                    where x.TutorProfileId = tp.Id and (v.Name in @Languages or v.Code in @Languages)
              ))
            order by
                case when @Sort = 'price-low' then tp.FeeAmount end asc,
                case when @Sort = 'price-high' then tp.FeeAmount end desc,
                case when @Sort = 'experience' then tp.ExperienceYears end desc,
                case when @Sort = 'reviews' then tp.ReviewCount end desc,
                case when @Sort = 'top-rated' then tp.Rating end desc,
                tp.MatchPercentage desc,
                tp.Rating desc;
            """;

        var subjects = NormalizeFilter(query.Subjects);
        var classLevels = NormalizeFilter(query.ClassLevels);
        var cities = NormalizeFilter(query.Cities);
        var modes = NormalizeFilter(query.Modes);
        var genders = NormalizeFilter(query.Genders);
        var languages = NormalizeFilter(query.Languages);
        var parameters = new
        {
            Search = string.IsNullOrWhiteSpace(query.Search) ? null : query.Search.Trim(),
            Subjects = ToSqlList(subjects),
            HasSubjects = subjects.Length > 0,
            ClassLevels = ToSqlList(classLevels),
            HasClassLevels = classLevels.Length > 0,
            Cities = ToSqlList(cities),
            HasCities = cities.Length > 0,
            Modes = ToSqlList(modes),
            HasModes = modes.Length > 0,
            Genders = ToSqlList(genders),
            HasGenders = genders.Length > 0,
            Languages = ToSqlList(languages),
            HasLanguages = languages.Length > 0,
            query.MinFee,
            query.MaxFee,
            Sort = string.IsNullOrWhiteSpace(query.Sort) ? "top-rated" : query.Sort.Trim()
        };

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync(new CommandDefinition(sql, parameters, cancellationToken: cancellationToken));
        return rows.Select(MapTutorSummary).ToArray();
    }

    public async Task<TutorProfile?> GetProfileAsync(string tutorId, CancellationToken cancellationToken)
    {
        var summary = (await SearchAsync(new TutorSearchQuery(tutorId, Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), null, null, null), cancellationToken))
            .FirstOrDefault(t => t.Id.Equals(tutorId, StringComparison.OrdinalIgnoreCase));

        if (summary is null)
        {
            return null;
        }

        const string detailSql = """
            select About, TeachingStyle, Education, Achievements, Availability
            from tutorProfiles
            where Slug = @TutorId;

            select r.ReviewerName, r.Context, r.Rating, r.Quote, r.CreatedAt
            from reviews r
            inner join tutorProfiles tp on tp.Id = r.TutorProfileId
            where tp.Slug = @TutorId and r.StatusCode = 'approved'
            order by r.CreatedAt desc;
            """;

        using var connection = _connectionFactory.CreateConnection();
        using var grid = await connection.QueryMultipleAsync(new CommandDefinition(detailSql, new { TutorId = tutorId }, cancellationToken: cancellationToken));
        var details = await grid.ReadFirstOrDefaultAsync();
        var reviews = (await grid.ReadAsync<ReviewSummary>()).ToArray();

        return new TutorProfile(
            summary,
            details?.About ?? "",
            details?.TeachingStyle ?? "",
            SqlMapping.SplitList(details?.Education),
            SqlMapping.SplitList(details?.Achievements),
            SqlMapping.SplitList(details?.Availability),
            reviews);
    }

    public async Task<BookingOption?> GetBookingOptionsAsync(string tutorId, CancellationToken cancellationToken)
    {
        var profile = await GetProfileAsync(tutorId, cancellationToken);
        if (profile is null)
        {
            return null;
        }

        var today = DateTime.UtcNow.Date;
        var dates = Enumerable.Range(0, 7)
            .Select(offset => today.AddDays(offset))
            .Select(date => new DateOption(date.ToString("ddd").ToUpperInvariant(), date.Day, date.ToString("yyyy-MM-dd")))
            .ToArray();

        return new BookingOption(
            profile.Summary.Id,
            profile.Summary.Name,
            profile.Summary.PhotoUrl,
            profile.Summary.Subjects,
            dates,
            new[] { "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM" },
            new[] { "Online", "Home tuition" },
            new[] { "Verified tutor with CNIC check", "Recorded for safety (online)", "No payment until you commit" });
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

    private static string[] NormalizeFilter(IEnumerable<string> values)
    {
        return values
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static string[] ToSqlList(string[] values)
    {
        return values.Length == 0 ? new[] { "__none__" } : values;
    }
}
