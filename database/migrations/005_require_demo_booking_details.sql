update demoBookings
set StudentName = 'Learner'
where StudentName is null or ltrim(rtrim(StudentName)) = '';

update demoBookings
set ParentPhone = 'Not provided'
where ParentPhone is null or ltrim(rtrim(ParentPhone)) = '';

update demoBookings
set LearningGoal = 'Not provided'
where LearningGoal is null or ltrim(rtrim(LearningGoal)) = '';

alter table demoBookings
alter column StudentName nvarchar(180) not null;

alter table demoBookings
alter column ParentPhone nvarchar(60) not null;

alter table demoBookings
alter column LearningGoal nvarchar(max) not null;
