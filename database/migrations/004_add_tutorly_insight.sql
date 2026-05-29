set nocount on;
set xact_abort on;

if col_length('studentProfiles', 'ChildName') is null
begin
    alter table studentProfiles add ChildName nvarchar(180) null;
end;

if col_length('studentProfiles', 'CurrentClass') is null
begin
    alter table studentProfiles add CurrentClass int null;
end;

if col_length('studentProfiles', 'Area') is null
begin
    alter table studentProfiles add Area nvarchar(160) null;
end;

if col_length('studentProfiles', 'BoardCode') is null
begin
    alter table studentProfiles add BoardCode nvarchar(80) null;
end;

if not exists (select 1 from sys.tables where name = 'insightDiagnosticQuestions')
begin
    create table insightDiagnosticQuestions
    (
        Id uniqueidentifier not null constraint PK_insightDiagnosticQuestions primary key,
        Code nvarchar(120) not null constraint UQ_insightDiagnosticQuestions_Code unique,
        SubjectCode nvarchar(40) not null,
        SubjectName nvarchar(80) not null,
        ClassLevel int not null,
        TopicCode nvarchar(80) not null,
        TopicName nvarchar(120) not null,
        DifficultyCode nvarchar(40) not null,
        QuestionText nvarchar(1000) not null,
        CorrectOptionCode nvarchar(10) not null,
        Explanation nvarchar(1000) not null,
        Marks int not null constraint DF_insightDiagnosticQuestions_Marks default 1,
        SortOrder int not null constraint DF_insightDiagnosticQuestions_SortOrder default 0,
        IsActive bit not null constraint DF_insightDiagnosticQuestions_IsActive default 1,
        CreatedAtUtc datetime2 not null constraint DF_insightDiagnosticQuestions_CreatedAtUtc default sysutcdatetime()
    );
end;

if not exists (select 1 from sys.tables where name = 'insightDiagnosticOptions')
begin
    create table insightDiagnosticOptions
    (
        Id uniqueidentifier not null constraint PK_insightDiagnosticOptions primary key,
        QuestionId uniqueidentifier not null constraint FK_insightDiagnosticOptions_Questions references insightDiagnosticQuestions(Id),
        OptionCode nvarchar(10) not null,
        OptionText nvarchar(500) not null,
        SortOrder int not null,
        constraint UQ_insightDiagnosticOptions_Question_Option unique (QuestionId, OptionCode)
    );
end;

if not exists (select 1 from sys.tables where name = 'insightDiagnosticAttempts')
begin
    create table insightDiagnosticAttempts
    (
        Id uniqueidentifier not null constraint PK_insightDiagnosticAttempts primary key,
        ChildProfileId uniqueidentifier not null constraint FK_insightDiagnosticAttempts_studentProfiles references studentProfiles(Id),
        ParentUserId uniqueidentifier not null constraint FK_insightDiagnosticAttempts_users references users(Id),
        CurrentClass int not null,
        SubjectCodes nvarchar(300) not null,
        StatusCode nvarchar(40) not null,
        StartedAtUtc datetime2 not null constraint DF_insightDiagnosticAttempts_StartedAtUtc default sysutcdatetime(),
        CompletedAtUtc datetime2 null,
        OverallLearningScore decimal(5,2) null,
        EstimatedActualLevel int null,
        RecommendedTutorType nvarchar(240) null
    );
end;

if not exists (select 1 from sys.tables where name = 'insightDiagnosticAttemptAnswers')
begin
    create table insightDiagnosticAttemptAnswers
    (
        Id uniqueidentifier not null constraint PK_insightDiagnosticAttemptAnswers primary key,
        AttemptId uniqueidentifier not null constraint FK_insightDiagnosticAttemptAnswers_Attempts references insightDiagnosticAttempts(Id),
        QuestionId uniqueidentifier not null constraint FK_insightDiagnosticAttemptAnswers_Questions references insightDiagnosticQuestions(Id),
        SelectedOptionCode nvarchar(10) not null,
        IsCorrect bit not null,
        MarksAwarded int not null,
        AnsweredAtUtc datetime2 not null constraint DF_insightDiagnosticAttemptAnswers_AnsweredAtUtc default sysutcdatetime(),
        constraint UQ_insightDiagnosticAttemptAnswers_Attempt_Question unique (AttemptId, QuestionId)
    );
end;

if not exists (select 1 from sys.tables where name = 'insightLearningGapReports')
begin
    create table insightLearningGapReports
    (
        Id uniqueidentifier not null constraint PK_insightLearningGapReports primary key,
        DiagnosticAttemptId uniqueidentifier not null constraint FK_insightLearningGapReports_Attempts references insightDiagnosticAttempts(Id),
        ChildProfileId uniqueidentifier not null constraint FK_insightLearningGapReports_studentProfiles references studentProfiles(Id),
        ParentUserId uniqueidentifier not null constraint FK_insightLearningGapReports_users references users(Id),
        CurrentClass int not null,
        EstimatedActualLevel int not null,
        OverallLearningScore decimal(5,2) not null,
        RecommendedTutorType nvarchar(240) not null,
        ThirtyDayPlan nvarchar(max) not null,
        ParentExplanation nvarchar(max) not null,
        CreatedAtUtc datetime2 not null constraint DF_insightLearningGapReports_CreatedAtUtc default sysutcdatetime(),
        constraint UQ_insightLearningGapReports_Attempt unique (DiagnosticAttemptId)
    );
end;

if not exists (select 1 from sys.tables where name = 'insightLearningGapReportSubjects')
begin
    create table insightLearningGapReportSubjects
    (
        Id uniqueidentifier not null constraint PK_insightLearningGapReportSubjects primary key,
        ReportId uniqueidentifier not null constraint FK_insightLearningGapReportSubjects_Reports references insightLearningGapReports(Id),
        SubjectCode nvarchar(40) not null,
        SubjectName nvarchar(80) not null,
        Score decimal(5,2) not null,
        EstimatedLevel int not null
    );
end;

if not exists (select 1 from sys.tables where name = 'insightLearningGapReportTopics')
begin
    create table insightLearningGapReportTopics
    (
        Id uniqueidentifier not null constraint PK_insightLearningGapReportTopics primary key,
        ReportId uniqueidentifier not null constraint FK_insightLearningGapReportTopics_Reports references insightLearningGapReports(Id),
        SubjectCode nvarchar(40) not null,
        TopicCode nvarchar(80) not null,
        TopicName nvarchar(120) not null,
        StrengthCode nvarchar(20) not null,
        Score decimal(5,2) not null
    );
end;

if not exists (select 1 from sys.tables where name = 'tutorQualityMetrics')
begin
    create table tutorQualityMetrics
    (
        TutorProfileId uniqueidentifier not null constraint PK_tutorQualityMetrics primary key constraint FK_tutorQualityMetrics_tutorProfiles references tutorProfiles(Id),
        QualityScore decimal(5,2) not null,
        AverageImprovementPercent decimal(5,2) null,
        AttendanceRate decimal(5,2) null,
        ComplaintRate decimal(5,2) null,
        TrialSuccessRate decimal(5,2) null,
        ParentFeedbackScore decimal(3,2) null,
        IsCnicVerified bit not null constraint DF_tutorQualityMetrics_IsCnicVerified default 0,
        IsQualificationVerified bit not null constraint DF_tutorQualityMetrics_IsQualificationVerified default 0,
        LastCalculatedAt datetime2 not null constraint DF_tutorQualityMetrics_LastCalculatedAt default sysutcdatetime()
    );
end;

if not exists (select 1 from sys.tables where name = 'studentProgressReports')
begin
    create table studentProgressReports
    (
        Id uniqueidentifier not null constraint PK_studentProgressReports primary key,
        ChildProfileId uniqueidentifier not null constraint FK_studentProgressReports_studentProfiles references studentProfiles(Id),
        TutorProfileId uniqueidentifier null constraint FK_studentProgressReports_tutorProfiles references tutorProfiles(Id),
        BookingId uniqueidentifier null constraint FK_studentProgressReports_demoBookings references demoBookings(Id),
        ReportMonth date not null,
        BeforeScore decimal(5,2) not null,
        AfterScore decimal(5,2) not null,
        TutorAttendanceCount int not null constraint DF_studentProgressReports_TutorAttendanceCount default 0,
        ParentFeedback nvarchar(600) null,
        RecommendationCode nvarchar(40) not null,
        CreatedAtUtc datetime2 not null constraint DF_studentProgressReports_CreatedAtUtc default sysutcdatetime()
    );
end;

if not exists (select 1 from sys.tables where name = 'studentProgressReportSubjects')
begin
    create table studentProgressReportSubjects
    (
        Id uniqueidentifier not null constraint PK_studentProgressReportSubjects primary key,
        ProgressReportId uniqueidentifier not null constraint FK_studentProgressReportSubjects_Reports references studentProgressReports(Id),
        SubjectCode nvarchar(40) not null,
        SubjectName nvarchar(80) not null,
        BeforeScore decimal(5,2) not null,
        AfterScore decimal(5,2) not null,
        ImprovementPercent decimal(5,2) not null
    );
end;

if not exists (select 1 from sys.tables where name = 'studentProgressReportTopics')
begin
    create table studentProgressReportTopics
    (
        Id uniqueidentifier not null constraint PK_studentProgressReportTopics primary key,
        ProgressReportId uniqueidentifier not null constraint FK_studentProgressReportTopics_Reports references studentProgressReports(Id),
        SubjectCode nvarchar(40) not null,
        TopicCode nvarchar(80) not null,
        TopicName nvarchar(120) not null,
        StatusCode nvarchar(40) not null
    );
end;

if not exists (select 1 from sys.indexes where name = 'IX_insightDiagnosticQuestions_Class_Subject' and object_id = object_id('insightDiagnosticQuestions'))
begin
    create index IX_insightDiagnosticQuestions_Class_Subject on insightDiagnosticQuestions(ClassLevel, SubjectCode, IsActive, SortOrder);
end;

if not exists (select 1 from sys.indexes where name = 'IX_insightDiagnosticAttempts_Parent_Status' and object_id = object_id('insightDiagnosticAttempts'))
begin
    create index IX_insightDiagnosticAttempts_Parent_Status on insightDiagnosticAttempts(ParentUserId, StatusCode, StartedAtUtc desc);
end;

if not exists (select 1 from sys.indexes where name = 'IX_insightLearningGapReports_Parent' and object_id = object_id('insightLearningGapReports'))
begin
    create index IX_insightLearningGapReports_Parent on insightLearningGapReports(ParentUserId, CreatedAtUtc desc);
end;

go

declare @subjectGroup int = (select Id from lookupGroups where Code = 'subject');
declare @classGroup int = (select Id from lookupGroups where Code = 'class_level');

if @subjectGroup is not null and not exists (select 1 from lookupValues where LookupGroupId = @subjectGroup and Code = 'urdu')
begin
    insert into lookupValues (LookupGroupId, Code, Name, SortOrder)
    values (@subjectGroup, 'urdu', 'Urdu', 15);
end;

declare @passwordHash nvarchar(300) = (select top 1 PasswordHash from users where PasswordHash is not null);
declare @ayeshaUser uniqueidentifier = '13131313-1313-1313-1313-131313131313';
declare @hamzaProfile uniqueidentifier = '14141414-1414-1414-1414-141414141414';

if @passwordHash is not null and not exists (select 1 from users where Id = @ayeshaUser or Email = 'ayesha.insight@example.com')
begin
    insert into users (Id, FullName, Phone, Email, PasswordHash, StatusCode, CreatedAtUtc)
    values (@ayeshaUser, 'Ayesha Khan', '+923001313131', 'ayesha.insight@example.com', @passwordHash, 'active', sysutcdatetime());
end;

if exists (select 1 from users where Id = @ayeshaUser)
   and not exists (select 1 from userRoles where UserId = @ayeshaUser)
begin
    insert into userRoles (UserId, RoleId)
    select @ayeshaUser, Id from roles where Code = 'student';
end;

if exists (select 1 from users where Id = @ayeshaUser)
   and not exists (select 1 from studentProfiles where Id = @hamzaProfile)
begin
    insert into studentProfiles (Id, UserId, City, PreferredLearningModeCode, ChildName, CurrentClass, Area, BoardCode, CreatedAtUtc)
    values (@hamzaProfile, @ayeshaUser, 'Karachi', 'both', 'Hamza', 5, 'Gulshan-e-Iqbal', 'matric', sysutcdatetime());
end;

update studentProfiles
set ChildName = coalesce(ChildName, case when UserId = @ayeshaUser then 'Hamza' else 'Learner' end),
    CurrentClass = coalesce(CurrentClass, case when UserId = @ayeshaUser then 5 else 6 end),
    Area = coalesce(Area, case when UserId = @ayeshaUser then 'Gulshan-e-Iqbal' else City end),
    BoardCode = coalesce(BoardCode, 'matric')
where ChildName is null or CurrentClass is null or Area is null or BoardCode is null;

declare @questions table
(
    Code nvarchar(120) not null,
    SubjectCode nvarchar(40) not null,
    SubjectName nvarchar(80) not null,
    ClassLevel int not null,
    TopicCode nvarchar(80) not null,
    TopicName nvarchar(120) not null,
    DifficultyCode nvarchar(40) not null,
    QuestionText nvarchar(1000) not null,
    CorrectOptionCode nvarchar(10) not null,
    Explanation nvarchar(1000) not null,
    Marks int not null,
    SortOrder int not null,
    A nvarchar(500) not null,
    B nvarchar(500) not null,
    C nvarchar(500) not null,
    D nvarchar(500) not null
);

insert into @questions
values
('math-c1-addition', 'math', 'Math', 1, 'addition', 'Addition', 'easy', 'Hamza has 4 pencils and buys 3 more. How many pencils does he have?', 'B', '4 + 3 = 7.', 1, 101, '6', '7', '8', '9'),
('math-c1-subtraction', 'math', 'Math', 1, 'subtraction', 'Subtraction', 'easy', 'Ayesha has 9 apples and gives away 2. How many apples are left?', 'C', '9 - 2 = 7.', 1, 102, '5', '6', '7', '8'),
('english-c1-vocabulary', 'english', 'English', 1, 'vocabulary', 'Vocabulary', 'easy', 'Choose the word that means the opposite of hot.', 'A', 'Cold is the opposite of hot.', 1, 103, 'Cold', 'Warm', 'Big', 'Fast'),
('english-c1-sentence', 'english', 'English', 1, 'sentence-structure', 'Sentence structure', 'easy', 'Choose the complete sentence.', 'D', 'A complete sentence has a subject and action.', 1, 104, 'Running fast', 'The red', 'In school', 'Hamza reads a book.'),
('urdu-c1-reading', 'urdu', 'Urdu', 1, 'reading', 'Reading', 'easy', 'Which word names a person?', 'B', 'Ustad names a person.', 1, 105, 'Kitab', 'Ustad', 'Kursi', 'Darwaza'),
('urdu-c1-vocabulary', 'urdu', 'Urdu', 1, 'vocabulary', 'Vocabulary', 'easy', 'Choose the meaning of dost.', 'A', 'Dost means friend.', 1, 106, 'Friend', 'School', 'Pencil', 'House'),
('math-c2-multiplication', 'math', 'Math', 2, 'multiplication', 'Multiplication', 'easy', 'What is 3 groups of 4?', 'C', '3 x 4 = 12.', 1, 201, '7', '10', '12', '14'),
('math-c2-word-problems', 'math', 'Math', 2, 'word-problems', 'Word problems', 'medium', 'There are 5 bags with 2 balls in each bag. How many balls are there?', 'C', '5 x 2 = 10.', 1, 202, '7', '8', '10', '12'),
('english-c2-grammar', 'english', 'English', 2, 'grammar', 'Grammar', 'easy', 'Choose the correct verb: She ___ to school.', 'A', 'She goes is correct for present tense.', 1, 203, 'goes', 'go', 'going', 'gone'),
('english-c2-reading', 'english', 'English', 2, 'reading-comprehension', 'Reading comprehension', 'medium', 'Sara watered the plant because it was dry. Why did Sara water it?', 'D', 'The plant was dry.', 1, 204, 'It was raining', 'It was small', 'It was new', 'It was dry'),
('urdu-c2-grammar', 'urdu', 'Urdu', 2, 'grammar', 'Grammar', 'easy', 'Choose the plural meaning of kitab.', 'B', 'Kitaben means books.', 1, 205, 'Kitab', 'Kitaben', 'Qalam', 'Dars'),
('urdu-c2-comprehension', 'urdu', 'Urdu', 2, 'comprehension', 'Comprehension', 'medium', 'Ali school gaya kyun ke us ka test tha. Why did Ali go to school?', 'C', 'He had a test.', 1, 206, 'To play', 'To eat', 'For a test', 'For shopping'),
('math-c3-division', 'math', 'Math', 3, 'division', 'Division', 'medium', 'Share 24 candies equally among 6 children. How many candies does each child get?', 'B', '24 divided by 6 = 4.', 1, 301, '3', '4', '5', '6'),
('math-c3-fractions', 'math', 'Math', 3, 'fractions', 'Fractions', 'medium', 'Which fraction means one out of four equal parts?', 'A', 'One out of four is 1/4.', 1, 302, '1/4', '1/3', '2/4', '4/1'),
('english-c3-vocabulary', 'english', 'English', 3, 'vocabulary', 'Vocabulary', 'medium', 'Choose the best meaning of brave.', 'C', 'Brave means showing courage.', 1, 303, 'Tired', 'Late', 'Courageous', 'Quiet'),
('english-c3-grammar', 'english', 'English', 3, 'grammar', 'Grammar', 'medium', 'Choose the correct past tense: Hamza ___ his homework.', 'D', 'Did is the simple past form.', 1, 304, 'do', 'does', 'doing', 'did'),
('urdu-c3-reading', 'urdu', 'Urdu', 3, 'reading', 'Reading', 'medium', 'Which word is closest to ilm?', 'A', 'Ilm means knowledge.', 1, 305, 'Knowledge', 'Road', 'Water', 'Window'),
('urdu-c3-vocabulary', 'urdu', 'Urdu', 3, 'vocabulary', 'Vocabulary', 'medium', 'Choose the opposite of roshni.', 'B', 'Andhera is the opposite of roshni.', 1, 306, 'Subah', 'Andhera', 'Kitab', 'Mehnat'),
('math-c4-multiplication', 'math', 'Math', 4, 'multiplication', 'Multiplication', 'medium', 'What is 16 x 7?', 'C', '16 x 7 = 112.', 1, 401, '96', '104', '112', '126'),
('math-c4-word-problems', 'math', 'Math', 4, 'word-problems', 'Word problems', 'medium', 'A tutor teaches 4 classes a day for 6 days. How many classes is that?', 'A', '4 x 6 = 24.', 1, 402, '24', '26', '28', '30'),
('english-c4-reading', 'english', 'English', 4, 'reading-comprehension', 'Reading comprehension', 'medium', 'The bus was late, so Maria missed assembly. What caused Maria to miss assembly?', 'D', 'The bus being late caused the problem.', 1, 403, 'She was sick', 'She forgot', 'It rained', 'The bus was late'),
('english-c4-sentence', 'english', 'English', 4, 'sentence-structure', 'Sentence structure', 'medium', 'Choose the sentence with correct punctuation.', 'B', 'The sentence needs a question mark.', 1, 404, 'Where is your book.', 'Where is your book?', 'Where is, your book', 'Where is your book!'),
('urdu-c4-comprehension', 'urdu', 'Urdu', 4, 'comprehension', 'Comprehension', 'medium', 'If a passage says the child studies daily, what habit is shown?', 'C', 'Studying daily shows consistency.', 1, 405, 'Laziness', 'Anger', 'Consistency', 'Noise'),
('urdu-c4-grammar', 'urdu', 'Urdu', 4, 'grammar', 'Grammar', 'medium', 'Choose the correct sentence meaning: Main school ja raha hoon.', 'A', 'The sentence means I am going to school.', 1, 406, 'I am going to school', 'I went to school', 'I will leave school', 'I saw a school'),
('math-c5-division', 'math', 'Math', 5, 'division', 'Division', 'medium', 'Divide 156 by 12.', 'B', '156 divided by 12 = 13.', 1, 501, '12', '13', '14', '15'),
('math-c5-fractions', 'math', 'Math', 5, 'fractions', 'Fractions', 'medium', 'What is 1/2 + 1/4?', 'C', '1/2 is 2/4, so 2/4 + 1/4 = 3/4.', 1, 502, '1/6', '2/6', '3/4', '1/8'),
('math-c5-word-problems', 'math', 'Math', 5, 'word-problems', 'Word problems', 'medium', 'A book costs PKR 240. Hamza buys 3 books and pays PKR 1000. How much change should he get?', 'D', '3 x 240 = 720, and 1000 - 720 = 280.', 1, 503, '220', '240', '260', '280'),
('english-c5-reading', 'english', 'English', 5, 'reading-comprehension', 'Reading comprehension', 'medium', 'A paragraph says Bilal practiced daily and improved his score. What is the main idea?', 'A', 'The main idea is that regular practice helped him improve.', 1, 504, 'Regular practice improves results', 'Tests are always easy', 'Bilal stopped studying', 'Scores do not change'),
('english-c5-grammar', 'english', 'English', 5, 'grammar', 'Grammar', 'medium', 'Choose the correct sentence.', 'B', 'Has finished agrees with the singular subject.', 1, 505, 'She have finished her work.', 'She has finished her work.', 'She finishing her work.', 'She finish her work.'),
('urdu-c5-comprehension', 'urdu', 'Urdu', 5, 'comprehension', 'Comprehension', 'medium', 'If a story shows a child helping his neighbour, which value is shown?', 'C', 'Helping a neighbour shows kindness.', 1, 506, 'Fear', 'Pride', 'Kindness', 'Confusion'),
('urdu-c5-grammar', 'urdu', 'Urdu', 5, 'grammar', 'Grammar', 'medium', 'Choose the best meaning of jumla.', 'D', 'Jumla means sentence.', 1, 507, 'Word', 'Page', 'Book', 'Sentence'),
('math-c6-fractions', 'math', 'Math', 6, 'fractions', 'Fractions', 'medium', 'Simplify 6/9.', 'B', 'Divide numerator and denominator by 3 to get 2/3.', 1, 601, '1/3', '2/3', '3/2', '6/3'),
('math-c6-word-problems', 'math', 'Math', 6, 'word-problems', 'Word problems', 'hard', 'A class scored 72, 80, and 88 in three tests. What is the average?', 'C', 'The average is (72 + 80 + 88) / 3 = 80.', 1, 602, '78', '79', '80', '82'),
('english-c6-sentence', 'english', 'English', 6, 'sentence-structure', 'Sentence structure', 'medium', 'Choose the sentence with the clearest structure.', 'A', 'This sentence has a clear subject, verb, and object.', 1, 603, 'The student solved the problem carefully.', 'Carefully the problem student.', 'Solved carefully student problem.', 'The problem carefully.'),
('english-c6-vocabulary', 'english', 'English', 6, 'vocabulary', 'Vocabulary', 'medium', 'Choose the closest meaning of analyze.', 'D', 'Analyze means examine carefully.', 1, 604, 'Ignore', 'Repeat', 'Decorate', 'Examine carefully'),
('urdu-c6-reading', 'urdu', 'Urdu', 6, 'reading', 'Reading', 'medium', 'Choose the closest meaning of tehqeeq.', 'A', 'Tehqeeq means research or investigation.', 1, 605, 'Research', 'Rest', 'Noise', 'Mistake'),
('urdu-c6-comprehension', 'urdu', 'Urdu', 6, 'comprehension', 'Comprehension', 'medium', 'A passage compares two cities. What skill is needed to answer correctly?', 'B', 'Comparison means finding similarities and differences.', 1, 606, 'Memorizing only', 'Comparing details', 'Counting words', 'Copying sentences'),
('math-c7-division', 'math', 'Math', 7, 'division', 'Division', 'hard', 'What is 3.6 divided by 0.6?', 'B', '3.6 / 0.6 = 6.', 1, 701, '5', '6', '7', '8'),
('math-c7-fractions', 'math', 'Math', 7, 'fractions', 'Fractions', 'hard', 'What is 2/3 of 42?', 'C', '42 divided by 3 is 14, and 14 x 2 = 28.', 1, 702, '21', '24', '28', '32'),
('english-c7-reading', 'english', 'English', 7, 'reading-comprehension', 'Reading comprehension', 'hard', 'If an author gives reasons and evidence, what is the author doing?', 'A', 'Reasons and evidence support an argument.', 1, 703, 'Supporting an argument', 'Listing random words', 'Ending a story', 'Changing the topic'),
('english-c7-grammar', 'english', 'English', 7, 'grammar', 'Grammar', 'hard', 'Choose the correct conditional sentence.', 'D', 'If he studies, he will improve is correct.', 1, 704, 'If he study, he improve.', 'If he studied, he improves.', 'If he studying, he will improve.', 'If he studies, he will improve.'),
('urdu-c7-vocabulary', 'urdu', 'Urdu', 7, 'vocabulary', 'Vocabulary', 'hard', 'Choose the closest meaning of tanqeed.', 'B', 'Tanqeed means criticism or review.', 1, 705, 'Celebration', 'Criticism', 'Journey', 'Silence'),
('urdu-c7-grammar', 'urdu', 'Urdu', 7, 'grammar', 'Grammar', 'hard', 'Which skill helps identify fail, mafool, and action in a sentence?', 'C', 'Sentence grammar identifies subject, object, and verb.', 1, 706, 'Spelling only', 'Handwriting', 'Sentence grammar', 'Drawing'),
('math-c8-word-problems', 'math', 'Math', 8, 'word-problems', 'Word problems', 'hard', 'A tutor fee is PKR 18000 after a 10% discount. What was the original fee?', 'B', '18000 is 90% of the original fee, so original fee is 20000.', 1, 801, '19000', '20000', '21000', '22000'),
('math-c8-fractions', 'math', 'Math', 8, 'fractions', 'Fractions', 'hard', 'Convert 0.375 to a fraction in simplest form.', 'A', '0.375 = 375/1000 = 3/8.', 1, 802, '3/8', '5/8', '1/3', '7/10'),
('english-c8-reading', 'english', 'English', 8, 'reading-comprehension', 'Reading comprehension', 'hard', 'A passage hints that a character is nervous without saying it directly. What skill is being tested?', 'C', 'This tests inference.', 1, 803, 'Alphabet order', 'Punctuation only', 'Inference', 'Rhyming'),
('english-c8-sentence', 'english', 'English', 8, 'sentence-structure', 'Sentence structure', 'hard', 'Choose the best thesis statement.', 'D', 'A thesis states a clear claim that can be supported.', 1, 804, 'Many things happen.', 'Schools exist.', 'This essay is about topics.', 'Regular practice improves exam performance.'),
('urdu-c8-comprehension', 'urdu', 'Urdu', 8, 'comprehension', 'Comprehension', 'hard', 'If a passage implies a lesson without saying it directly, what should the student identify?', 'A', 'The hidden lesson is the theme.', 1, 805, 'Theme', 'Page number', 'Font size', 'Writer age'),
('urdu-c8-vocabulary', 'urdu', 'Urdu', 8, 'vocabulary', 'Vocabulary', 'hard', 'Choose the closest meaning of istedlal.', 'B', 'Istedlal means reasoning.', 1, 806, 'Guessing', 'Reasoning', 'Sleeping', 'Copying');

insert into insightDiagnosticQuestions
(
    Id, Code, SubjectCode, SubjectName, ClassLevel, TopicCode, TopicName, DifficultyCode,
    QuestionText, CorrectOptionCode, Explanation, Marks, SortOrder
)
select newid(), q.Code, q.SubjectCode, q.SubjectName, q.ClassLevel, q.TopicCode, q.TopicName, q.DifficultyCode,
       q.QuestionText, q.CorrectOptionCode, q.Explanation, q.Marks, q.SortOrder
from @questions q
where not exists (select 1 from insightDiagnosticQuestions existing where existing.Code = q.Code);

insert into insightDiagnosticOptions (Id, QuestionId, OptionCode, OptionText, SortOrder)
select newid(), dq.Id, options.OptionCode, options.OptionText, options.SortOrder
from @questions q
inner join insightDiagnosticQuestions dq on dq.Code = q.Code
cross apply
(
    values
    ('A', q.A, 1),
    ('B', q.B, 2),
    ('C', q.C, 3),
    ('D', q.D, 4)
) options(OptionCode, OptionText, SortOrder)
where not exists
(
    select 1
    from insightDiagnosticOptions existing
    where existing.QuestionId = dq.Id and existing.OptionCode = options.OptionCode
);

insert into tutorQualityMetrics
(
    TutorProfileId, QualityScore, AverageImprovementPercent, AttendanceRate, ComplaintRate,
    TrialSuccessRate, ParentFeedbackScore, IsCnicVerified, IsQualificationVerified, LastCalculatedAt
)
select
    tp.Id,
    cast(case tp.Slug
        when 'bilal-ahmed' then 94
        when 'ayesha-malik' then 96
        when 'fatima-shah' then 93
        when 'hamza-raza' then 91
        else 86
    end as decimal(5,2)),
    cast(case tp.Slug
        when 'bilal-ahmed' then 32
        when 'ayesha-malik' then 29
        when 'fatima-shah' then 24
        when 'hamza-raza' then 27
        else 18
    end as decimal(5,2)),
    cast(case when tp.VerificationStatusCode = 'verified' then 96 else 82 end as decimal(5,2)),
    cast(case tp.Slug when 'bilal-ahmed' then 1.5 when 'ayesha-malik' then 1.2 else 2.8 end as decimal(5,2)),
    cast(case tp.Slug when 'bilal-ahmed' then 78 when 'ayesha-malik' then 81 else 70 end as decimal(5,2)),
    cast(case when tp.Rating > 0 then tp.Rating else 4.2 end as decimal(3,2)),
    cast(case when tp.VerificationStatusCode = 'verified' then 1 else 0 end as bit),
    cast(case when tp.VerificationStatusCode = 'verified' then 1 else 0 end as bit),
    sysutcdatetime()
from tutorProfiles tp
where not exists (select 1 from tutorQualityMetrics tqm where tqm.TutorProfileId = tp.Id);

declare @bilalProfile uniqueidentifier = (select top 1 Id from tutorProfiles where Slug = 'bilal-ahmed');
declare @progressId uniqueidentifier = '15151515-1515-1515-1515-151515151515';
declare @karachiValue int = (select top 1 Id from lookupValues where Code = 'karachi');
declare @mathValue int = (select top 1 Id from lookupValues where Code = 'mathematics' and LookupGroupId = @subjectGroup);
declare @englishValue int = (select top 1 Id from lookupValues where Code = 'english' and LookupGroupId = @subjectGroup);
declare @urduValue int = (select top 1 Id from lookupValues where Code = 'urdu' and LookupGroupId = @subjectGroup);
declare @grade15Value int = (select top 1 Id from lookupValues where Code = 'grade-1-5' and LookupGroupId = @classGroup);
declare @grade68Value int = (select top 1 Id from lookupValues where Code = 'grade-6-8' and LookupGroupId = @classGroup);

if @bilalProfile is not null and @karachiValue is not null
begin
    update tutorProfiles
    set CityLookupValueId = @karachiValue,
        MatchReason = 'Tutorly Insight fit for Class 5 Math, English, and Urdu gaps',
        MatchPercentage = coalesce(MatchPercentage, 97)
    where Id = @bilalProfile;
end;

if @bilalProfile is not null
begin
    insert into tutorSubjects (TutorProfileId, SubjectLookupValueId)
    select @bilalProfile, subjectId
    from (values (@mathValue), (@englishValue), (@urduValue)) subjects(subjectId)
    where subjectId is not null
      and not exists
      (
          select 1
          from tutorSubjects existing
          where existing.TutorProfileId = @bilalProfile
            and existing.SubjectLookupValueId = subjectId
      );

    insert into tutorClassLevels (TutorProfileId, ClassLevelLookupValueId)
    select @bilalProfile, classId
    from (values (@grade15Value), (@grade68Value)) classes(classId)
    where classId is not null
      and not exists
      (
          select 1
          from tutorClassLevels existing
          where existing.TutorProfileId = @bilalProfile
            and existing.ClassLevelLookupValueId = classId
      );
end;

if @bilalProfile is not null and exists (select 1 from studentProfiles where Id = @hamzaProfile)
   and not exists (select 1 from studentProgressReports where Id = @progressId)
begin
    insert into studentProgressReports
    (
        Id, ChildProfileId, TutorProfileId, ReportMonth, BeforeScore, AfterScore,
        TutorAttendanceCount, ParentFeedback, RecommendationCode, CreatedAtUtc
    )
    values
    (
        @progressId, @hamzaProfile, @bilalProfile, datefromparts(year(getdate()), month(getdate()), 1),
        48, 64, 10, 'Hamza is more confident with division and fraction practice.', 'Continue', sysutcdatetime()
    );

    insert into studentProgressReportSubjects
    (Id, ProgressReportId, SubjectCode, SubjectName, BeforeScore, AfterScore, ImprovementPercent)
    values
    (newid(), @progressId, 'math', 'Math', 42, 61, 19),
    (newid(), @progressId, 'english', 'English', 55, 68, 13);

    insert into studentProgressReportTopics
    (Id, ProgressReportId, SubjectCode, TopicCode, TopicName, StatusCode)
    values
    (newid(), @progressId, 'math', 'division', 'Division', 'completed'),
    (newid(), @progressId, 'math', 'fractions', 'Fractions', 'still-weak'),
    (newid(), @progressId, 'english', 'reading-comprehension', 'Reading comprehension', 'completed'),
    (newid(), @progressId, 'english', 'grammar', 'Grammar', 'still-weak');
end;
