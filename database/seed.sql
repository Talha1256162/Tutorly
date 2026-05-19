insert into roles (Code, Name)
values ('admin', 'Admin'), ('student', 'Student'), ('parent', 'Parent'), ('tutor', 'Tutor');

insert into lookupGroups (Code, Name)
values
('gender', 'Gender'),
('teaching_mode', 'Teaching Mode'),
('booking_status', 'Booking Status'),
('verification_status', 'Verification Status'),
('verification_type', 'Verification Type'),
('notification_type', 'Notification Type'),
('review_status', 'Review Status'),
('preferred_learning_mode', 'Preferred Learning Mode'),
('user_status', 'User Status'),
('city', 'City'),
('subject', 'Subject'),
('class_level', 'Class Level'),
('language', 'Language');

declare @gender int = (select Id from lookupGroups where Code = 'gender');
declare @mode int = (select Id from lookupGroups where Code = 'teaching_mode');
declare @booking int = (select Id from lookupGroups where Code = 'booking_status');
declare @verificationStatus int = (select Id from lookupGroups where Code = 'verification_status');
declare @verificationType int = (select Id from lookupGroups where Code = 'verification_type');
declare @notification int = (select Id from lookupGroups where Code = 'notification_type');
declare @review int = (select Id from lookupGroups where Code = 'review_status');
declare @learningMode int = (select Id from lookupGroups where Code = 'preferred_learning_mode');
declare @userStatus int = (select Id from lookupGroups where Code = 'user_status');
declare @city int = (select Id from lookupGroups where Code = 'city');
declare @subject int = (select Id from lookupGroups where Code = 'subject');
declare @class int = (select Id from lookupGroups where Code = 'class_level');
declare @language int = (select Id from lookupGroups where Code = 'language');

insert into lookupValues (LookupGroupId, Code, Name, SortOrder)
values
(@gender, 'female', 'Female', 1), (@gender, 'male', 'Male', 2), (@gender, 'any', 'Any', 3),
(@mode, 'online', 'Online', 1), (@mode, 'home', 'Home', 2), (@mode, 'both', 'Both', 3),
(@booking, 'pending', 'Pending', 1), (@booking, 'confirmed', 'Confirmed', 2), (@booking, 'completed', 'Completed', 3), (@booking, 'cancelled', 'Cancelled', 4),
(@verificationStatus, 'pending', 'Pending', 1), (@verificationStatus, 'verified', 'Verified', 2), (@verificationStatus, 'rejected', 'Rejected', 3),
(@verificationType, 'cnic', 'CNIC', 1), (@verificationType, 'education', 'Education', 2), (@verificationType, 'reference', 'Reference', 3),
(@notification, 'booking', 'Booking', 1), (@notification, 'message', 'Message', 2), (@notification, 'review', 'Review', 3),
(@review, 'pending', 'Pending', 1), (@review, 'approved', 'Approved', 2), (@review, 'rejected', 'Rejected', 3),
(@learningMode, 'online', 'Online', 1), (@learningMode, 'home', 'Home', 2), (@learningMode, 'both', 'Both', 3),
(@userStatus, 'active', 'Active', 1), (@userStatus, 'inactive', 'Inactive', 2), (@userStatus, 'suspended', 'Suspended', 3);

insert into lookupValues (LookupGroupId, Code, Name, SortOrder)
values
(@city, 'karachi', 'Karachi', 1), (@city, 'lahore', 'Lahore', 2), (@city, 'islamabad', 'Islamabad', 3),
(@city, 'rawalpindi', 'Rawalpindi', 4), (@city, 'faisalabad', 'Faisalabad', 5), (@city, 'multan', 'Multan', 6),
(@city, 'peshawar', 'Peshawar', 7), (@city, 'hyderabad', 'Hyderabad', 8), (@city, 'quetta', 'Quetta', 9), (@city, 'sialkot', 'Sialkot', 10);

insert into lookupValues (LookupGroupId, Code, Name, SortOrder)
values
(@subject, 'mathematics', 'Mathematics', 1), (@subject, 'physics', 'Physics', 2), (@subject, 'chemistry', 'Chemistry', 3),
(@subject, 'biology', 'Biology', 4), (@subject, 'english', 'English', 5), (@subject, 'computer-science', 'Computer Science', 6),
(@subject, 'o-levels', 'O Levels', 7), (@subject, 'a-levels', 'A Levels', 8), (@subject, 'ielts', 'IELTS', 9),
(@subject, 'quran', 'Quran', 10), (@subject, 'sat', 'SAT', 11), (@subject, 'mdcat', 'MDCAT', 12),
(@subject, 'ecat', 'ECAT', 13), (@subject, 'university-courses', 'University Courses', 14);

insert into lookupValues (LookupGroupId, Code, Name, SortOrder)
values
(@class, 'grade-1-5', 'Grade 1-5', 1), (@class, 'grade-6-8', 'Grade 6-8', 2),
(@class, 'grade-9-10-o-levels', 'Grade 9-10 / O Levels', 3), (@class, 'a-levels', 'A Levels', 4),
(@class, 'university', 'University', 5), (@class, 'test-prep', 'Test Prep', 6);

insert into lookupValues (LookupGroupId, Code, Name, SortOrder)
values (@language, 'english', 'English', 1), (@language, 'urdu', 'Urdu', 2), (@language, 'arabic', 'Arabic', 3);

insert into platformSettings ([Key], [Value], ValueType, Description)
values
('defaultPageSize', '12', 'number', 'Default API page size.'),
('tutorMatchingWeights', '{"subject":40,"city":20,"budget":20,"rating":20}', 'json', 'AI tutor matching weights.'),
('maxDemoBookingRequestsPerDay', '5', 'number', 'Maximum demo requests per student per day.'),
('profileCompletionMinimumPercentage', '80', 'number', 'Minimum completion for tutor discovery.'),
('reviewModerationEnabled', 'true', 'boolean', 'Require moderation before reviews are public.'),
('phoneVisibilityRules', '{"beforeBooking":"hidden","afterConfirmedDemo":"masked"}', 'json', 'Phone visibility policy.'),
('cancellationWindowHours', '2', 'number', 'Free cancellation window before demo.'),
('featuredTutorRules', '{"minRating":4.7,"verifiedOnly":true}', 'json', 'Featured tutor eligibility.');

declare @studentUser uniqueidentifier = '11111111-1111-1111-1111-111111111111';
declare @tutorA uniqueidentifier = '22222222-2222-2222-2222-222222222222';
declare @tutorB uniqueidentifier = '33333333-3333-3333-3333-333333333333';
declare @tutorC uniqueidentifier = '44444444-4444-4444-4444-444444444444';
declare @tutorD uniqueidentifier = '55555555-5555-5555-5555-555555555555';
declare @tutorE uniqueidentifier = '66666666-6666-6666-6666-666666666666';
declare @tutorF uniqueidentifier = '77777777-7777-7777-7777-777777777777';
declare @password nvarchar(300) = '$2a$12$8R62e45qkmue8cjkjCyU8eb4iP21G8ttdwKEdyMRlrJrXubcKk27i';

insert into users (Id, FullName, Phone, Email, PasswordHash, StatusCode)
values
(@studentUser, 'Zara Ahmed', '+923001111111', 'zara@example.com', @password, 'active'),
(@tutorA, 'Ayesha Malik', '+923002222222', 'ayesha@example.com', @password, 'active'),
(@tutorB, 'Hamza Raza', '+923003333333', 'hamza@example.com', @password, 'active'),
(@tutorC, 'Fatima Shah', '+923004444444', 'fatima@example.com', @password, 'active'),
(@tutorD, 'Umar Khan', '+923005555555', 'umar@example.com', @password, 'active'),
(@tutorE, 'Sana Iqbal', '+923006666666', 'sana@example.com', @password, 'active'),
(@tutorF, 'Bilal Ahmed', '+923007777777', 'bilal@example.com', @password, 'active');

insert into userRoles (UserId, RoleId)
select @studentUser, Id from roles where Code = 'student';
insert into userRoles (UserId, RoleId)
select @tutorA, Id from roles where Code = 'tutor';
insert into userRoles (UserId, RoleId)
select @tutorB, Id from roles where Code = 'tutor';
insert into userRoles (UserId, RoleId)
select @tutorC, Id from roles where Code = 'tutor';
insert into userRoles (UserId, RoleId)
select @tutorD, Id from roles where Code = 'tutor';
insert into userRoles (UserId, RoleId)
select @tutorE, Id from roles where Code = 'tutor';
insert into userRoles (UserId, RoleId)
select @tutorF, Id from roles where Code = 'tutor';

insert into studentProfiles (Id, UserId, City, PreferredLearningModeCode)
values (newid(), @studentUser, 'Lahore', 'online');

declare @lahore int = (select Id from lookupValues where Code = 'lahore');
declare @karachi int = (select Id from lookupValues where Code = 'karachi');
declare @islamabad int = (select Id from lookupValues where Code = 'islamabad');
declare @female int = (select Id from lookupValues where Code = 'female' and LookupGroupId = @gender);
declare @male int = (select Id from lookupValues where Code = 'male' and LookupGroupId = @gender);
declare @both int = (select Id from lookupValues where Code = 'both' and LookupGroupId = @mode);
declare @online int = (select Id from lookupValues where Code = 'online' and LookupGroupId = @mode);
declare @home int = (select Id from lookupValues where Code = 'home' and LookupGroupId = @mode);

declare @tpA uniqueidentifier = newid();
declare @tpB uniqueidentifier = newid();
declare @tpC uniqueidentifier = newid();
declare @tpD uniqueidentifier = newid();
declare @tpE uniqueidentifier = newid();
declare @tpF uniqueidentifier = newid();

insert into tutorProfiles
(Id, UserId, Slug, Initials, PhotoUrl, VerificationStatusCode, Rating, ReviewCount, CityLookupValueId, TeachingModeLookupValueId, GenderLookupValueId, ExperienceYears, FeeText, FeeAmount, NextSlot, ResponseTime, StudentsTaught, MatchPercentage, MatchReason, Tagline, About, TeachingStyle, Education, Achievements, Availability)
values
(@tpA, @tutorA, 'ayesha-malik', 'AM', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 'verified', 4.9, 184, @lahore, @both, @female, 8, 'PKR 18,000/month', 18000, 'Today, 6:00 PM', 'Replies in 12 min', 240, 98, 'Perfect fit for A Levels Math & Physics in Lahore', 'Cambridge A* in Math. I make hard problems feel obvious.', 'LUMS graduate with 8 years tutoring O/A Levels. Specializing in turning math anxiety into A grades through structured frameworks.', 'Structured examples, fast diagnosis, then guided practice.', 'BSc Mathematics, LUMS|Cambridge CIE Certified', '95% of students improved by 2+ grades|Top 1% on Lumora 2024', 'Mon 6 PM|Wed 6 PM|Sat 3 PM'),
(@tpB, @tutorB, 'hamza-raza', 'HR', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'verified', 4.8, 126, @karachi, @online, @male, 6, 'PKR 2,500/hour', 20000, 'Tomorrow, 4:30 PM', 'Replies in 20 min', 180, 95, 'MDCAT specialist, 92% admit rate', 'MDCAT Chemistry - frameworks not memorization.', 'AKU medical student turned tutor. I built the prep system I wish I had.', 'Concept maps first, then timed MCQ drills.', 'MBBS, Aga Khan University|MDCAT 2018 - 198/210', '92% MDCAT admit rate|Author of LumoraNotes', 'Tue 4:30 PM|Thu 7 PM|Sun 5 PM'),
(@tpC, @tutorC, 'fatima-shah', 'FS', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', 'verified', 5.0, 92, @islamabad, @both, @female, 5, 'PKR 12,000/month', 12000, 'Today, 8:00 PM', 'Replies in 8 min', 140, 93, 'IELTS 8.5 - band 7+ guarantee', 'IELTS Band 8.5. I get you to 7+ in 6 weeks.', 'Former British Council examiner. Honest, structured, results-driven.', 'Writing feedback, speaking drills, and band-score rubrics.', 'MA English Lit, QAU|Cambridge CELTA', 'Avg student gain: 1.5 bands|150+ IELTS success stories', 'Mon 8 PM|Fri 8 PM|Sun 2 PM'),
(@tpD, @tutorD, 'umar-khan', 'UK', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', 'verified', 4.7, 78, @lahore, @online, @male, 4, 'PKR 2,500/hour', 22000, 'Tomorrow, 7:00 PM', 'Replies in 15 min', 95, null, null, 'Ex-FAST. Code, calculus, and confidence.', 'FAST graduate helping students connect programming, calculus, and exam confidence.', 'Short examples, live coding, and practice sets after every session.', 'BS Computer Science, FAST|Teaching assistant for calculus', 'Built 40+ student portfolios|Top computer science tutor', 'Tue 7 PM|Thu 7 PM|Sat 5 PM'),
(@tpE, @tutorE, 'sana-iqbal', 'SI', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80', 'verified', 4.9, 210, @karachi, @both, @female, 10, 'PKR 8,000/month', 8000, 'Today, 5:00 PM', 'Replies in 5 min', 320, null, null, 'Tajweed, tarjuma, and tafseer with love.', 'A patient Quran and Islamiat tutor focused on tajweed, understanding, and consistency.', 'Gentle correction, daily recitation goals, and parent updates.', 'Alimah Program Graduate|Quran memorization certified', '320+ students taught|Parent favorite tutor', 'Mon 5 PM|Wed 5 PM|Sun 10 AM'),
(@tpF, @tutorF, 'bilal-ahmed', 'BA', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80', 'verified', 4.8, 64, @islamabad, @home, @male, 7, 'PKR 18,000/month', 18000, 'Wed, 6:30 PM', 'Replies in 25 min', 130, null, null, 'NUST gold medalist. Physics is a story, let me tell it.', 'NUST medalist with a practical approach to Physics and Mathematics for O/A Levels.', 'Visual intuition first, formulas second, then past-paper drills.', 'BSc Physics, NUST|Gold Medalist', 'NUST gold medalist|100+ A grade students', 'Wed 6:30 PM|Fri 6 PM|Sat 4 PM');

insert into tutorSubjects (TutorProfileId, SubjectLookupValueId)
select @tpA, Id from lookupValues where LookupGroupId = @subject and Code in ('mathematics', 'physics')
union all select @tpB, Id from lookupValues where LookupGroupId = @subject and Code in ('chemistry', 'biology')
union all select @tpC, Id from lookupValues where LookupGroupId = @subject and Code in ('english', 'ielts')
union all select @tpD, Id from lookupValues where LookupGroupId = @subject and Code in ('computer-science', 'mathematics')
union all select @tpE, Id from lookupValues where LookupGroupId = @subject and Code in ('quran')
union all select @tpF, Id from lookupValues where LookupGroupId = @subject and Code in ('physics', 'mathematics');

insert into tutorClassLevels (TutorProfileId, ClassLevelLookupValueId)
select @tpA, Id from lookupValues where LookupGroupId = @class and Code in ('grade-9-10-o-levels', 'a-levels')
union all select @tpB, Id from lookupValues where LookupGroupId = @class and Code in ('a-levels', 'test-prep')
union all select @tpC, Id from lookupValues where LookupGroupId = @class and Code in ('grade-9-10-o-levels', 'test-prep')
union all select @tpD, Id from lookupValues where LookupGroupId = @class and Code in ('a-levels', 'university')
union all select @tpE, Id from lookupValues where LookupGroupId = @class and Code in ('grade-1-5', 'grade-6-8')
union all select @tpF, Id from lookupValues where LookupGroupId = @class and Code in ('a-levels', 'test-prep');

insert into tutorLanguages (TutorProfileId, LanguageLookupValueId)
select x.TutorProfileId, lv.Id
from (values (@tpA), (@tpB), (@tpC), (@tpD), (@tpE), (@tpF)) x(TutorProfileId)
cross join lookupValues lv
where lv.LookupGroupId = @language and lv.Code in ('english', 'urdu');

insert into reviews (Id, TutorProfileId, StudentUserId, ReviewerName, Context, Rating, Quote, StatusCode)
values
(newid(), @tpA, @studentUser, 'Amna K.', 'Parent', 5, 'Best math teacher we have ever hired.', 'approved'),
(newid(), @tpB, @studentUser, 'Hassan R.', 'Student', 5, 'Got A* - would not have without him.', 'approved');

insert into savedTutors (StudentUserId, TutorProfileId)
values
(@studentUser, @tpA),
(@studentUser, @tpB),
(@studentUser, @tpC),
(@studentUser, @tpF);

insert into demoBookings
(Id, TutorProfileId, StudentUserId, BookingDate, BookingTime, TeachingModeCode, StudentName, ParentPhone, LearningGoal, StatusCode, CreatedByUserId)
values
(newid(), @tpA, @studentUser, convert(date, dateadd(day, 1, getdate())), '6:00 PM', 'Online', 'Zara Ahmed', '+923001111111', 'Focus on A Levels mechanics and exam timing.', 'confirmed', @studentUser),
(newid(), @tpC, @studentUser, convert(date, dateadd(day, 2, getdate())), '8:00 PM', 'Online', 'Zara Ahmed', '+923001111111', 'IELTS writing band improvement.', 'pending', @studentUser),
(newid(), @tpF, @studentUser, convert(date, dateadd(day, 5, getdate())), '6:30 PM', 'Home', 'Zara Ahmed', '+923001111111', 'Physics numericals and confidence building.', 'confirmed', @studentUser);
