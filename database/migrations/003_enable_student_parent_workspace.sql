set nocount on;
set xact_abort on;

declare @learnerUser uniqueidentifier = '12121212-1212-1212-1212-121212121212';
declare @passwordHash nvarchar(300) = (select top 1 PasswordHash from users where Email = 'zara@example.com');

if not exists (select 1 from users where Id = @learnerUser or Email = 'parent@example.com')
begin
    insert into users (Id, FullName, Phone, Email, PasswordHash, StatusCode, CreatedAtUtc)
    values (@learnerUser, 'Sara Ahmed', '+923001212121', 'parent@example.com', @passwordHash, 'active', sysutcdatetime());
end;

delete ur
from userRoles ur
inner join roles r on r.Id = ur.RoleId
where ur.UserId = @learnerUser
  and r.Code = 'parent';

if not exists
(
    select 1
    from userRoles ur
    inner join roles r on r.Id = ur.RoleId
    where ur.UserId = @learnerUser
      and r.Code = 'student'
)
begin
    insert into userRoles (UserId, RoleId)
    select @learnerUser, Id from roles where Code = 'student';
end;

if not exists (select 1 from studentProfiles where UserId = @learnerUser)
begin
    insert into studentProfiles (Id, UserId, City, PreferredLearningModeCode, CreatedAtUtc)
    values (newid(), @learnerUser, 'Lahore', 'online', sysutcdatetime());
end;
