using Dapper;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Infrastructure.Data;

namespace Tutorly.Infrastructure.Repositories;

public sealed class DashboardRepository : IDashboardRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly ITutorRepository _tutorRepository;

    public DashboardRepository(ISqlConnectionFactory connectionFactory, ITutorRepository tutorRepository)
    {
        _connectionFactory = connectionFactory;
        _tutorRepository = tutorRepository;
    }

    public async Task<StudentDashboard> GetStudentDashboardAsync(Guid userId, CancellationToken cancellationToken)
    {
        var tutors = (await _tutorRepository.SearchAsync(new TutorSearchQuery(null, Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), null, null, "top-rated"), cancellationToken))
            .Take(2)
            .ToArray();

        return new StudentDashboard(
            "Zara",
            "As-salamu alaykum, Zara",
            "You have 1 demo class today and 3 new tutor matches.",
            new[]
            {
                new StatCard("Active sessions", "3", "1 this week", "book", "success"),
                new StatCard("Upcoming demos", "2", "Today, 6 PM", "calendar", "success"),
                new StatCard("Saved tutors", "8", "2 new", "heart", "success"),
                new StatCard("Avg progress", "+18%", "Last 30 days", "trending-up", "success")
            },
            tutors,
            new[]
            {
                new ProgressMetric("Mathematics", 78),
                new ProgressMetric("Physics", 62),
                new ProgressMetric("English", 91)
            },
            new[]
            {
                new UpcomingDemo("Ayesha Malik", tutors.ElementAtOrDefault(0)?.PhotoUrl ?? "", "Mathematics", "Today, 6:00 PM", "Join"),
                new UpcomingDemo("Fatima Shah", tutors.ElementAtOrDefault(1)?.PhotoUrl ?? "", "English", "Tomorrow, 8:00 PM", "Join")
            },
            tutors.Select((tutor, index) => new MessagePreview(tutor.Name, tutor.PhotoUrl, "Looking forward to today's class!", $"5:4{index}p")).ToArray(),
            new[]
            {
                new ActivityItem("Booked demo with Ayesha M.", "1h ago", "cyan"),
                new ActivityItem("Saved Hamza R. to favorites", "2h ago", "violet"),
                new ActivityItem("Completed Physics session with Bilal A.", "3h ago", "success"),
                new ActivityItem("AI matched 3 new tutors", "4h ago", "cyan")
            });
    }

    public async Task<TutorDashboard> GetTutorDashboardAsync(Guid userId, CancellationToken cancellationToken)
    {
        const string sql = """
            select top 1 coalesce(u.FullName, 'Ayesha') as TutorName
            from users u
            where u.Id = @UserId;
            """;

        using var connection = _connectionFactory.CreateConnection();
        var tutorName = await connection.ExecuteScalarAsync<string?>(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken)) ?? "Ayesha";

        return new TutorDashboard(
            tutorName,
            $"Good evening, {tutorName.Split(' ')[0]}",
            "4 new student requests and 2 demo classes this week.",
            92,
            new[]
            {
                new StatCard("Monthly earnings", "PKR 184,000", "22% vs last month", "wallet", "success"),
                new StatCard("Active students", "12", "3 this month", "users", "success"),
                new StatCard("Demo bookings", "8", "this week", "calendar", "cyan"),
                new StatCard("Avg rating", "4.9", "184 reviews", "star", "warning")
            },
            new EarningsMetric(new[] { "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" }, new[] { 120, 150, 168, 172, 181, 184 }, "PKR 1,128,000"),
            new[]
            {
                new StudentRequest("H", "Hassan A.", "A Levels Physics · Lahore", "2 hrs ago"),
                new StudentRequest("M", "Maria K.", "O Levels Math · Online", "Yesterday"),
                new StudentRequest("B", "Bilal N.", "A Levels Math · Lahore", "Yesterday"),
                new StudentRequest("S", "Sara F.", "MDCAT Chemistry · Online", "2 days ago")
            },
            new[]
            {
                new SubjectPerformance("Mathematics", 4.95m, 98),
                new SubjectPerformance("Physics", 4.85m, 94)
            },
            new[]
            {
                new AvailabilityDay("M", new[] { true, false, false, true }),
                new AvailabilityDay("T", new[] { false, false, true, false }),
                new AvailabilityDay("W", new[] { false, true, false, false }),
                new AvailabilityDay("T", new[] { true, false, false, true }),
                new AvailabilityDay("F", new[] { false, false, true, false }),
                new AvailabilityDay("S", new[] { false, true, false, false }),
                new AvailabilityDay("S", new[] { true, false, false, true })
            },
            new[]
            {
                new ReviewSummary("Amna K.", "Parent", 5, "Best math teacher we've ever hired.", DateTime.UtcNow.AddDays(-2)),
                new ReviewSummary("Hassan R.", "Student", 5, "Got A* - would not have without her.", DateTime.UtcNow.AddDays(-4))
            },
            new ResponseRate(96, "Avg reply: 12 min", "Top 5% tutors", "+4% this month"));
    }
}
