set nocount on;
set xact_abort on;

if not exists
(
    select 1
    from sys.indexes
    where name = 'UX_conversations_Student_Tutor'
      and object_id = object_id('conversations')
)
begin
    create unique index UX_conversations_Student_Tutor on conversations(StudentUserId, TutorProfileId);
end;

declare @studentUser uniqueidentifier = '11111111-1111-1111-1111-111111111111';
declare @tutorUser uniqueidentifier = '22222222-2222-2222-2222-222222222222';
declare @tutorProfile uniqueidentifier =
(
    select top 1 Id
    from tutorProfiles
    where UserId = @tutorUser
);
declare @conversationId uniqueidentifier =
(
    select top 1 Id
    from conversations
    where StudentUserId = @studentUser and TutorProfileId = @tutorProfile
);

if @tutorProfile is not null and @conversationId is null
begin
    set @conversationId = '88888888-8888-8888-8888-888888888888';

    insert into conversations (Id, StudentUserId, TutorProfileId)
    values (@conversationId, @studentUser, @tutorProfile);
end;

if @conversationId is not null
   and not exists (select 1 from messages where ConversationId = @conversationId)
begin
    insert into messages (Id, ConversationId, SenderUserId, Body, CreatedAtUtc)
    values
    ('99999999-9999-9999-9999-999999999991', @conversationId, @studentUser, 'Assalam-o-alaikum, can we focus on projectile motion in the demo class?', dateadd(minute, -12, sysutcdatetime())),
    ('99999999-9999-9999-9999-999999999992', @conversationId, @tutorUser, 'Walaikum salam. Yes, I will prepare worked examples and a past-paper question for you.', dateadd(minute, -8, sysutcdatetime()));
end;
