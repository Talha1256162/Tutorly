namespace Tutorly.Domain;

public sealed record LookupGroup(int Id, string Code, string Name, bool IsSystem, bool IsActive);

public sealed record LookupValue(
    int Id,
    int LookupGroupId,
    string GroupCode,
    string Code,
    string Name,
    int SortOrder,
    bool IsActive);

public sealed record PlatformSetting(string Key, string Value, string ValueType, string Description);

public sealed record TutorSummary(
    string Id,
    string Name,
    string PhotoUrl,
    string Initials,
    bool Verified,
    decimal Rating,
    int Reviews,
    string City,
    string[] Subjects,
    string[] ClassLevels,
    int ExperienceYears,
    string FeeText,
    decimal FeeAmount,
    string TeachingMode,
    string[] Languages,
    string NextSlot,
    string Gender,
    string ResponseTime,
    int StudentsTaught,
    int? MatchPercentage,
    string? MatchReason,
    string Tagline);

public sealed record TutorProfile(
    TutorSummary Summary,
    string About,
    string TeachingStyle,
    string[] Education,
    string[] Achievements,
    string[] Availability,
    ReviewSummary[] Reviews);

public sealed record ReviewSummary(string ReviewerName, string Context, decimal Rating, string Quote, DateTime CreatedAt);

public sealed record BookingOption(
    string TutorId,
    string TutorName,
    string TutorPhotoUrl,
    string[] Subjects,
    DateOption[] Dates,
    string[] TimeSlots,
    string[] Modes,
    string[] SafetyNotes);

public sealed record DateOption(string Label, int Day, string IsoDate);

public sealed record BookingRequest(
    string TutorId,
    string SelectedDate,
    string SelectedTime,
    string Mode,
    string StudentName,
    string ParentPhone,
    string LearningGoal);

public sealed record BookingConfirmation(Guid BookingId, string Status, string Message);

public sealed record BookingSummary(
    Guid Id,
    string TutorId,
    string TutorName,
    string TutorPhotoUrl,
    string[] Subjects,
    string BookingDate,
    string BookingTime,
    string TeachingMode,
    string Status,
    string LearningGoal,
    DateTime CreatedAtUtc);

public sealed record StatCard(string Label, string Value, string Caption, string Icon, string? Tone = null);

public sealed record StudentDashboard(
    string WelcomeName,
    string Headline,
    string Subheadline,
    StatCard[] Stats,
    TutorSummary[] RecommendedTutors,
    ProgressMetric[] Progress,
    UpcomingDemo[] UpcomingDemos,
    MessagePreview[] Messages,
    ActivityItem[] RecentActivity);

public sealed record TutorDashboard(
    string TutorName,
    string Headline,
    string Subheadline,
    int ProfileStrength,
    StatCard[] Stats,
    EarningsMetric Earnings,
    StudentRequest[] StudentRequests,
    SubjectPerformance[] SubjectPerformance,
    AvailabilityDay[] Availability,
    ReviewSummary[] RecentReviews,
    ResponseRate ResponseRate);

public sealed record ProgressMetric(string Label, int Percentage);
public sealed record UpcomingDemo(string TutorName, string TutorPhotoUrl, string Subject, string StartsAt, string ActionLabel);
public sealed record MessagePreview(string PersonName, string PhotoUrl, string Preview, string Time);
public sealed record ActivityItem(string Text, string TimeAgo, string Tone);
public sealed record EarningsMetric(string[] Labels, int[] Values, string TotalText);
public sealed record StudentRequest(string Initial, string StudentName, string Detail, string ReceivedAt);
public sealed record SubjectPerformance(string Subject, decimal Rating, int RetentionPercentage);
public sealed record AvailabilityDay(string Day, bool[] Slots);
public sealed record ResponseRate(int Percentage, string AverageReply, string Rank, string Delta);

public sealed record Conversation(
    string Id,
    string PersonName,
    string PhotoUrl,
    bool Verified,
    string Status,
    string LastMessage,
    string LastMessageTime,
    MessageItem[] Messages);

public sealed record MessageItem(string Id, string Sender, string Body, string Time, bool IsMine);

public sealed record AuthResult(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAtUtc,
    UserSession User);

public sealed record UserSession(Guid UserId, string FullName, string EmailOrPhone, string Role);
