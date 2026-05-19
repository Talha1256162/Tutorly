using Dapper;
using System.Data;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Infrastructure.Data;

namespace Tutorly.Infrastructure.Repositories;

public sealed class BookingRepository : IBookingRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public BookingRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<BookingConfirmation> CreateDemoBookingAsync(BookingRequest request, Guid requestedByUserId, CancellationToken cancellationToken)
    {
        const string sql = """
            declare @BookingId uniqueidentifier = newid();
            declare @StatusCode nvarchar(50) = 'pending';
            declare @TutorProfileId uniqueidentifier = (
                select top 1 Id
                from tutorProfiles
                where Slug = @TutorId
            );

            if @TutorProfileId is null
                throw 51001, 'Tutor profile was not found.', 1;

            insert into demoBookings
            (
                Id, TutorProfileId, StudentUserId, BookingDate, BookingTime, TeachingModeCode,
                StudentName, ParentPhone, LearningGoal, StatusCode, CreatedAtUtc, CreatedByUserId
            )
            values
            (
                @BookingId, @TutorProfileId, @RequestedByUserId, @SelectedDate, @SelectedTime, @Mode,
                @StudentName, @ParentPhone, @LearningGoal, @StatusCode, sysutcdatetime(), @RequestedByUserId
            );

            insert into auditLogs
            (
                Id, ActorUserId, Action, EntityName, EntityId, CreatedAtUtc
            )
            values
            (
                newid(), @RequestedByUserId, 'demo_booking.created', 'demoBookings', cast(@BookingId as nvarchar(80)), sysutcdatetime()
            );

            select @BookingId as BookingId, @StatusCode as Status, 'Demo request received. The tutor will confirm shortly.' as Message;
            """;

        using var connection = _connectionFactory.CreateConnection();
        var command = new CommandDefinition(
            sql,
            new
            {
                request.TutorId,
                request.SelectedDate,
                request.SelectedTime,
                request.Mode,
                request.StudentName,
                request.ParentPhone,
                request.LearningGoal,
                RequestedByUserId = requestedByUserId
            },
            commandType: CommandType.Text,
            cancellationToken: cancellationToken);

        return await connection.QuerySingleAsync<BookingConfirmation>(command);
    }

    public async Task<IReadOnlyList<BookingSummary>> GetStudentBookingsAsync(Guid userId, CancellationToken cancellationToken)
    {
        const string sql = """
            select
                b.Id,
                tp.Slug as TutorId,
                u.FullName as TutorName,
                coalesce(f.PublicUrl, tp.PhotoUrl) as TutorPhotoUrl,
                (
                    select string_agg(v.Name, '|') within group (order by v.Name)
                    from tutorSubjects x
                    inner join lookupValues v on v.Id = x.SubjectLookupValueId
                    where x.TutorProfileId = tp.Id
                ) as Subjects,
                convert(nvarchar(10), b.BookingDate, 23) as BookingDate,
                b.BookingTime,
                b.TeachingModeCode as TeachingMode,
                b.StatusCode as Status,
                coalesce(b.LearningGoal, '') as LearningGoal,
                b.CreatedAtUtc
            from demoBookings b
            inner join tutorProfiles tp on tp.Id = b.TutorProfileId
            inner join users u on u.Id = tp.UserId
            left join fileUploads f on f.Id = tp.PhotoFileId
            where b.StudentUserId = @UserId
            order by b.BookingDate asc, b.BookingTime asc;
            """;

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken));

        return rows.Select(row => new BookingSummary(
            row.Id,
            row.TutorId,
            row.TutorName,
            row.TutorPhotoUrl,
            SqlMapping.SplitList(Convert.ToString(row.Subjects)),
            row.BookingDate,
            row.BookingTime,
            row.TeachingMode,
            row.Status,
            row.LearningGoal,
            row.CreatedAtUtc)).ToArray();
    }
}
