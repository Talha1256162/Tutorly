create table lookupGroups
(
    Id int identity(1,1) not null constraint PK_lookupGroups primary key,
    Code nvarchar(80) not null constraint UQ_lookupGroups_Code unique,
    Name nvarchar(160) not null,
    IsSystem bit not null constraint DF_lookupGroups_IsSystem default 1,
    IsActive bit not null constraint DF_lookupGroups_IsActive default 1,
    CreatedAtUtc datetime2 not null constraint DF_lookupGroups_CreatedAtUtc default sysutcdatetime()
);

create table lookupValues
(
    Id int identity(1,1) not null constraint PK_lookupValues primary key,
    LookupGroupId int not null constraint FK_lookupValues_lookupGroups references lookupGroups(Id),
    Code nvarchar(80) not null,
    Name nvarchar(160) not null,
    SortOrder int not null constraint DF_lookupValues_SortOrder default 0,
    IsActive bit not null constraint DF_lookupValues_IsActive default 1,
    CreatedAtUtc datetime2 not null constraint DF_lookupValues_CreatedAtUtc default sysutcdatetime(),
    constraint UQ_lookupValues_Group_Code unique (LookupGroupId, Code)
);

create table platformSettings
(
    Id int identity(1,1) not null constraint PK_platformSettings primary key,
    [Key] nvarchar(120) not null constraint UQ_platformSettings_Key unique,
    [Value] nvarchar(max) not null,
    ValueType nvarchar(40) not null,
    Description nvarchar(400) not null,
    IsActive bit not null constraint DF_platformSettings_IsActive default 1,
    UpdatedAtUtc datetime2 null
);

create table roles
(
    Id int identity(1,1) not null constraint PK_roles primary key,
    Code nvarchar(80) not null constraint UQ_roles_Code unique,
    Name nvarchar(120) not null,
    IsSystem bit not null constraint DF_roles_IsSystem default 1
);

create table permissions
(
    Id int identity(1,1) not null constraint PK_permissions primary key,
    Code nvarchar(120) not null constraint UQ_permissions_Code unique,
    Name nvarchar(160) not null
);

create table rolePermissions
(
    RoleId int not null constraint FK_rolePermissions_roles references roles(Id),
    PermissionId int not null constraint FK_rolePermissions_permissions references permissions(Id),
    constraint PK_rolePermissions primary key (RoleId, PermissionId)
);

create table users
(
    Id uniqueidentifier not null constraint PK_users primary key,
    FullName nvarchar(180) not null,
    Phone nvarchar(40) null,
    Email nvarchar(180) null,
    PasswordHash nvarchar(300) not null,
    StatusCode nvarchar(80) not null,
    CreatedAtUtc datetime2 not null constraint DF_users_CreatedAtUtc default sysutcdatetime(),
    UpdatedAtUtc datetime2 null,
    constraint UQ_users_Email unique (Email),
    constraint UQ_users_Phone unique (Phone)
);

create table userRoles
(
    UserId uniqueidentifier not null constraint FK_userRoles_users references users(Id),
    RoleId int not null constraint FK_userRoles_roles references roles(Id),
    constraint PK_userRoles primary key (UserId, RoleId)
);

create table refreshTokens
(
    Id uniqueidentifier not null constraint PK_refreshTokens primary key,
    UserId uniqueidentifier not null constraint FK_refreshTokens_users references users(Id),
    TokenHash char(64) not null,
    ExpiresAtUtc datetime2 not null,
    RevokedAtUtc datetime2 null,
    CreatedAtUtc datetime2 not null constraint DF_refreshTokens_CreatedAtUtc default sysutcdatetime()
);

create table fileUploads
(
    Id uniqueidentifier not null constraint PK_fileUploads primary key,
    OwnerUserId uniqueidentifier null constraint FK_fileUploads_users references users(Id),
    PublicUrl nvarchar(600) not null,
    StorageKey nvarchar(300) not null,
    ContentType nvarchar(120) not null,
    SizeBytes bigint not null,
    CreatedAtUtc datetime2 not null constraint DF_fileUploads_CreatedAtUtc default sysutcdatetime()
);

create table studentProfiles
(
    Id uniqueidentifier not null constraint PK_studentProfiles primary key,
    UserId uniqueidentifier not null constraint FK_studentProfiles_users references users(Id),
    City nvarchar(120) null,
    PreferredLearningModeCode nvarchar(80) null,
    CreatedAtUtc datetime2 not null constraint DF_studentProfiles_CreatedAtUtc default sysutcdatetime()
);

create table tutorProfiles
(
    Id uniqueidentifier not null constraint PK_tutorProfiles primary key,
    UserId uniqueidentifier not null constraint FK_tutorProfiles_users references users(Id),
    Slug nvarchar(180) not null constraint UQ_tutorProfiles_Slug unique,
    Initials nvarchar(12) not null,
    PhotoUrl nvarchar(600) null,
    PhotoFileId uniqueidentifier null constraint FK_tutorProfiles_fileUploads references fileUploads(Id),
    VerificationStatusCode nvarchar(80) not null,
    Rating decimal(3,2) not null constraint DF_tutorProfiles_Rating default 0,
    ReviewCount int not null constraint DF_tutorProfiles_ReviewCount default 0,
    CityLookupValueId int null constraint FK_tutorProfiles_city_lookupValues references lookupValues(Id),
    TeachingModeLookupValueId int null constraint FK_tutorProfiles_mode_lookupValues references lookupValues(Id),
    GenderLookupValueId int null constraint FK_tutorProfiles_gender_lookupValues references lookupValues(Id),
    ExperienceYears int not null constraint DF_tutorProfiles_ExperienceYears default 0,
    FeeText nvarchar(120) not null,
    FeeAmount decimal(18,2) not null,
    NextSlot nvarchar(120) not null,
    ResponseTime nvarchar(120) not null,
    StudentsTaught int not null constraint DF_tutorProfiles_StudentsTaught default 0,
    MatchPercentage int null,
    MatchReason nvarchar(300) null,
    Tagline nvarchar(300) not null,
    About nvarchar(max) not null,
    TeachingStyle nvarchar(max) null,
    Education nvarchar(max) null,
    Achievements nvarchar(max) null,
    Availability nvarchar(max) null,
    CreatedAtUtc datetime2 not null constraint DF_tutorProfiles_CreatedAtUtc default sysutcdatetime(),
    UpdatedAtUtc datetime2 null
);

create table tutorSubjects
(
    TutorProfileId uniqueidentifier not null constraint FK_tutorSubjects_tutorProfiles references tutorProfiles(Id),
    SubjectLookupValueId int not null constraint FK_tutorSubjects_lookupValues references lookupValues(Id),
    constraint PK_tutorSubjects primary key (TutorProfileId, SubjectLookupValueId)
);

create table tutorClassLevels
(
    TutorProfileId uniqueidentifier not null constraint FK_tutorClassLevels_tutorProfiles references tutorProfiles(Id),
    ClassLevelLookupValueId int not null constraint FK_tutorClassLevels_lookupValues references lookupValues(Id),
    constraint PK_tutorClassLevels primary key (TutorProfileId, ClassLevelLookupValueId)
);

create table tutorLanguages
(
    TutorProfileId uniqueidentifier not null constraint FK_tutorLanguages_tutorProfiles references tutorProfiles(Id),
    LanguageLookupValueId int not null constraint FK_tutorLanguages_lookupValues references lookupValues(Id),
    constraint PK_tutorLanguages primary key (TutorProfileId, LanguageLookupValueId)
);

create table tutorAvailability
(
    Id uniqueidentifier not null constraint PK_tutorAvailability primary key,
    TutorProfileId uniqueidentifier not null constraint FK_tutorAvailability_tutorProfiles references tutorProfiles(Id),
    DayOfWeek tinyint not null,
    StartTime time not null,
    EndTime time not null,
    TeachingModeCode nvarchar(80) not null,
    IsActive bit not null constraint DF_tutorAvailability_IsActive default 1
);

create table demoBookings
(
    Id uniqueidentifier not null constraint PK_demoBookings primary key,
    TutorProfileId uniqueidentifier not null constraint FK_demoBookings_tutorProfiles references tutorProfiles(Id),
    StudentUserId uniqueidentifier not null constraint FK_demoBookings_users references users(Id),
    BookingDate date not null,
    BookingTime nvarchar(40) not null,
    TeachingModeCode nvarchar(80) not null,
    StudentName nvarchar(180) not null,
    ParentPhone nvarchar(60) not null,
    LearningGoal nvarchar(max) not null,
    StatusCode nvarchar(80) not null,
    CreatedAtUtc datetime2 not null constraint DF_demoBookings_CreatedAtUtc default sysutcdatetime(),
    CreatedByUserId uniqueidentifier not null
);

create table savedTutors
(
    StudentUserId uniqueidentifier not null constraint FK_savedTutors_users references users(Id),
    TutorProfileId uniqueidentifier not null constraint FK_savedTutors_tutorProfiles references tutorProfiles(Id),
    CreatedAtUtc datetime2 not null constraint DF_savedTutors_CreatedAtUtc default sysutcdatetime(),
    constraint PK_savedTutors primary key (StudentUserId, TutorProfileId)
);

create table reviews
(
    Id uniqueidentifier not null constraint PK_reviews primary key,
    TutorProfileId uniqueidentifier not null constraint FK_reviews_tutorProfiles references tutorProfiles(Id),
    StudentUserId uniqueidentifier null constraint FK_reviews_users references users(Id),
    ReviewerName nvarchar(160) not null,
    Context nvarchar(160) not null,
    Rating decimal(3,2) not null,
    Quote nvarchar(800) not null,
    StatusCode nvarchar(80) not null,
    CreatedAt datetime2 not null constraint DF_reviews_CreatedAt default sysutcdatetime()
);

create table conversations
(
    Id uniqueidentifier not null constraint PK_conversations primary key,
    StudentUserId uniqueidentifier not null constraint FK_conversations_student_users references users(Id),
    TutorProfileId uniqueidentifier not null constraint FK_conversations_tutorProfiles references tutorProfiles(Id),
    CreatedAtUtc datetime2 not null constraint DF_conversations_CreatedAtUtc default sysutcdatetime()
);

create table messages
(
    Id uniqueidentifier not null constraint PK_messages primary key,
    ConversationId uniqueidentifier not null constraint FK_messages_conversations references conversations(Id),
    SenderUserId uniqueidentifier not null constraint FK_messages_users references users(Id),
    Body nvarchar(max) not null,
    CreatedAtUtc datetime2 not null constraint DF_messages_CreatedAtUtc default sysutcdatetime(),
    ReadAtUtc datetime2 null
);

create table tutorVerifications
(
    Id uniqueidentifier not null constraint PK_tutorVerifications primary key,
    TutorProfileId uniqueidentifier not null constraint FK_tutorVerifications_tutorProfiles references tutorProfiles(Id),
    VerificationTypeCode nvarchar(80) not null,
    StatusCode nvarchar(80) not null,
    ReviewedByUserId uniqueidentifier null constraint FK_tutorVerifications_users references users(Id),
    CreatedAtUtc datetime2 not null constraint DF_tutorVerifications_CreatedAtUtc default sysutcdatetime()
);

create table notifications
(
    Id uniqueidentifier not null constraint PK_notifications primary key,
    UserId uniqueidentifier not null constraint FK_notifications_users references users(Id),
    NotificationTypeCode nvarchar(80) not null,
    Title nvarchar(180) not null,
    Body nvarchar(800) not null,
    ReadAtUtc datetime2 null,
    CreatedAtUtc datetime2 not null constraint DF_notifications_CreatedAtUtc default sysutcdatetime()
);

create table adminDashboardSnapshots
(
    Id uniqueidentifier not null constraint PK_adminDashboardSnapshots primary key,
    SnapshotDate date not null,
    MetricsJson nvarchar(max) not null,
    CreatedAtUtc datetime2 not null constraint DF_adminDashboardSnapshots_CreatedAtUtc default sysutcdatetime()
);

create table auditLogs
(
    Id uniqueidentifier not null constraint PK_auditLogs primary key,
    ActorUserId uniqueidentifier null,
    Action nvarchar(160) not null,
    EntityName nvarchar(160) not null,
    EntityId nvarchar(120) null,
    OldValuesJson nvarchar(max) null,
    NewValuesJson nvarchar(max) null,
    IpAddress nvarchar(80) null,
    UserAgent nvarchar(400) null,
    CreatedAtUtc datetime2 not null constraint DF_auditLogs_CreatedAtUtc default sysutcdatetime()
);

create index IX_lookupValues_Group on lookupValues(LookupGroupId, IsActive, SortOrder);
create index IX_users_Status on users(StatusCode);
create index IX_tutorProfiles_Search on tutorProfiles(VerificationStatusCode, Rating desc, FeeAmount);
create index IX_demoBookings_Tutor_Date on demoBookings(TutorProfileId, BookingDate);
create index IX_demoBookings_Student_Date on demoBookings(StudentUserId, BookingDate);
create unique index UX_conversations_Student_Tutor on conversations(StudentUserId, TutorProfileId);
create index IX_messages_Conversation_Created on messages(ConversationId, CreatedAtUtc);
create index IX_auditLogs_Entity on auditLogs(EntityName, EntityId, CreatedAtUtc);
