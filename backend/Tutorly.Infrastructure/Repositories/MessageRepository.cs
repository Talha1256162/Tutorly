using Dapper;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Infrastructure.Data;

namespace Tutorly.Infrastructure.Repositories;

public sealed class MessageRepository : IMessageRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public MessageRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Conversation>> GetConversationsAsync(Guid userId, CancellationToken cancellationToken)
    {
        const string sql = """
            select
                c.Id,
                case when c.StudentUserId = @UserId then tutorUser.FullName else studentUser.FullName end as PersonName,
                case
                    when c.StudentUserId = @UserId then coalesce(nullif(tp.PhotoUrl, ''), concat('https://ui-avatars.com/api/?name=', replace(tutorUser.FullName, ' ', '+'), '&background=172554&color=ffffff'))
                    else concat('https://ui-avatars.com/api/?name=', replace(studentUser.FullName, ' ', '+'), '&background=172554&color=ffffff')
                end as PhotoUrl,
                cast(case when c.StudentUserId = @UserId and tp.VerificationStatusCode = 'verified' then 1 else 0 end as bit) as Verified,
                case when c.StudentUserId = @UserId then tp.ResponseTime else 'Student conversation' end as Status,
                coalesce(latest.Body, 'Start the conversation') as LastMessage,
                latest.CreatedAtUtc as LastMessageAtUtc
            from conversations c
            inner join users studentUser on studentUser.Id = c.StudentUserId
            inner join tutorProfiles tp on tp.Id = c.TutorProfileId
            inner join users tutorUser on tutorUser.Id = tp.UserId
            outer apply
            (
                select top 1 m.Body, m.CreatedAtUtc
                from messages m
                where m.ConversationId = c.Id
                order by m.CreatedAtUtc desc
            ) latest
            where c.StudentUserId = @UserId or tp.UserId = @UserId
            order by coalesce(latest.CreatedAtUtc, c.CreatedAtUtc) desc;

            select
                m.Id,
                m.ConversationId,
                m.SenderUserId,
                m.Body,
                m.CreatedAtUtc
            from messages m
            inner join conversations c on c.Id = m.ConversationId
            inner join tutorProfiles tp on tp.Id = c.TutorProfileId
            where c.StudentUserId = @UserId or tp.UserId = @UserId
            order by m.CreatedAtUtc asc;
            """;

        using var connection = _connectionFactory.CreateConnection();
        using var results = await connection.QueryMultipleAsync(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken));
        var conversations = (await results.ReadAsync<ConversationRow>()).ToArray();
        var messages = (await results.ReadAsync<MessageRow>())
            .GroupBy(message => message.ConversationId)
            .ToDictionary(group => group.Key, group => group.ToArray());

        return conversations
            .Select(conversation => MapConversation(
                conversation,
                messages.GetValueOrDefault(conversation.Id) ?? Array.Empty<MessageRow>(),
                userId))
            .ToArray();
    }

    public async Task<Conversation?> GetConversationAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken)
    {
        var conversations = await GetConversationsAsync(userId, cancellationToken);
        return conversations.SingleOrDefault(conversation => conversation.Id == conversationId.ToString());
    }

    public async Task<Conversation> GetOrCreateTutorConversationAsync(Guid studentUserId, string tutorId, CancellationToken cancellationToken)
    {
        const string sql = """
            declare @TutorProfileId uniqueidentifier =
            (
                select top 1 tp.Id
                from tutorProfiles tp
                inner join users u on u.Id = tp.UserId
                where tp.Slug = @TutorId and u.StatusCode = 'active'
            );

            if @TutorProfileId is not null
            begin
                declare @ConversationId uniqueidentifier =
                (
                    select top 1 Id
                    from conversations
                    where StudentUserId = @StudentUserId and TutorProfileId = @TutorProfileId
                );

                if @ConversationId is null
                begin
                    set @ConversationId = newid();
                    begin try
                        insert into conversations (Id, StudentUserId, TutorProfileId, CreatedAtUtc)
                        values (@ConversationId, @StudentUserId, @TutorProfileId, sysutcdatetime());
                    end try
                    begin catch
                        if error_number() not in (2601, 2627)
                            throw;

                        select @ConversationId = Id
                        from conversations
                        where StudentUserId = @StudentUserId and TutorProfileId = @TutorProfileId;
                    end catch
                end

                select @ConversationId;
            end
            """;

        using var connection = _connectionFactory.CreateConnection();
        var conversationId = await connection.QuerySingleOrDefaultAsync<Guid?>(new CommandDefinition(
            sql,
            new { StudentUserId = studentUserId, TutorId = tutorId },
            cancellationToken: cancellationToken));

        if (conversationId is null)
        {
            throw new KeyNotFoundException("Tutor was not found.");
        }

        var conversations = await GetConversationsAsync(studentUserId, cancellationToken);
        return conversations.Single(conversation => conversation.Id == conversationId.Value.ToString());
    }

    public async Task<MessageItem> SendMessageAsync(Guid userId, Guid conversationId, string body, CancellationToken cancellationToken)
    {
        const string recipientSql = """
            select top 1
                case when c.StudentUserId = @UserId then tp.UserId else c.StudentUserId end
            from conversations c
            inner join tutorProfiles tp on tp.Id = c.TutorProfileId
            where c.Id = @ConversationId
              and (c.StudentUserId = @UserId or tp.UserId = @UserId);
            """;

        const string insertSql = """
            declare @MessageId uniqueidentifier = newid();
            declare @CreatedAtUtc datetime2 = sysutcdatetime();

            insert into messages (Id, ConversationId, SenderUserId, Body, CreatedAtUtc)
            values (@MessageId, @ConversationId, @UserId, @Body, @CreatedAtUtc);

            insert into notifications (Id, UserId, NotificationTypeCode, Title, Body, CreatedAtUtc)
            values (newid(), @RecipientUserId, 'message', 'New message', left(@Body, 800), @CreatedAtUtc);

            insert into auditLogs (Id, ActorUserId, Action, EntityName, EntityId, NewValuesJson, CreatedAtUtc)
            values (newid(), @UserId, 'message.sent', 'messages', cast(@MessageId as nvarchar(80)), concat('{"conversationId":"', cast(@ConversationId as nvarchar(80)), '"}'), @CreatedAtUtc);

            select @MessageId as Id, @ConversationId as ConversationId, @UserId as SenderUserId, @Body as Body, @CreatedAtUtc as CreatedAtUtc;
            """;

        using var connection = _connectionFactory.CreateConnection();
        var recipientUserId = await connection.QuerySingleOrDefaultAsync<Guid?>(new CommandDefinition(
            recipientSql,
            new { UserId = userId, ConversationId = conversationId },
            cancellationToken: cancellationToken));

        if (recipientUserId is null)
        {
            throw new UnauthorizedAccessException("You cannot access this conversation.");
        }

        var message = await connection.QuerySingleAsync<MessageRow>(new CommandDefinition(
            insertSql,
            new
            {
                UserId = userId,
                ConversationId = conversationId,
                RecipientUserId = recipientUserId.Value,
                Body = body
            },
            cancellationToken: cancellationToken));

        return MapMessage(message, userId);
    }

    private static Conversation MapConversation(ConversationRow conversation, IEnumerable<MessageRow> messages, Guid userId)
    {
        return new Conversation(
            conversation.Id.ToString(),
            conversation.PersonName,
            conversation.PhotoUrl,
            conversation.Verified,
            conversation.Status,
            conversation.LastMessage,
            conversation.LastMessageAtUtc.HasValue ? FormatTime(conversation.LastMessageAtUtc.Value) : "",
            messages.Select(message => MapMessage(message, userId)).ToArray());
    }

    private static MessageItem MapMessage(MessageRow message, Guid userId)
    {
        var isMine = message.SenderUserId == userId;
        return new MessageItem(
            message.Id.ToString(),
            isMine ? "me" : "partner",
            message.Body,
            FormatTime(message.CreatedAtUtc),
            isMine);
    }

    private static string FormatTime(DateTime createdAtUtc)
    {
        return DateTime.SpecifyKind(createdAtUtc, DateTimeKind.Utc).ToLocalTime().ToString("h:mm tt");
    }

    private sealed class ConversationRow
    {
        public Guid Id { get; init; }
        public string PersonName { get; init; } = "";
        public string PhotoUrl { get; init; } = "";
        public bool Verified { get; init; }
        public string Status { get; init; } = "";
        public string LastMessage { get; init; } = "";
        public DateTime? LastMessageAtUtc { get; init; }
    }

    private sealed class MessageRow
    {
        public Guid Id { get; init; }
        public Guid ConversationId { get; init; }
        public Guid SenderUserId { get; init; }
        public string Body { get; init; } = "";
        public DateTime CreatedAtUtc { get; init; }
    }
}
