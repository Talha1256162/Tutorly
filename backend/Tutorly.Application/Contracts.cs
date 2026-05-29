using Tutorly.Domain;

namespace Tutorly.Application;

public interface ILookupRepository
{
    Task<IReadOnlyDictionary<string, IReadOnlyList<LookupValue>>> GetLookupMapAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<PlatformSetting>> GetPlatformSettingsAsync(CancellationToken cancellationToken);
}

public interface ITutorRepository
{
    Task<IReadOnlyList<TutorSummary>> SearchAsync(TutorSearchQuery query, CancellationToken cancellationToken);
    Task<TutorProfile?> GetProfileAsync(string tutorId, CancellationToken cancellationToken);
    Task<BookingOption?> GetBookingOptionsAsync(string tutorId, CancellationToken cancellationToken);
}

public interface IBookingRepository
{
    Task<BookingConfirmation> CreateDemoBookingAsync(BookingRequest request, Guid requestedByUserId, CancellationToken cancellationToken);
    Task<IReadOnlyList<BookingSummary>> GetStudentBookingsAsync(Guid userId, CancellationToken cancellationToken);
}

public interface ISavedTutorRepository
{
    Task<IReadOnlyList<TutorSummary>> GetSavedTutorsAsync(Guid userId, CancellationToken cancellationToken);
    Task SaveTutorAsync(Guid userId, string tutorId, CancellationToken cancellationToken);
    Task RemoveSavedTutorAsync(Guid userId, string tutorId, CancellationToken cancellationToken);
}

public interface IDashboardRepository
{
    Task<StudentDashboard> GetStudentDashboardAsync(Guid userId, CancellationToken cancellationToken);
    Task<TutorDashboard> GetTutorDashboardAsync(Guid userId, CancellationToken cancellationToken);
}

public interface IMessageRepository
{
    Task<IReadOnlyList<Conversation>> GetConversationsAsync(Guid userId, CancellationToken cancellationToken);
    Task<Conversation?> GetConversationAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken);
    Task<Conversation> GetOrCreateTutorConversationAsync(Guid studentUserId, string tutorId, CancellationToken cancellationToken);
    Task<MessageItem> SendMessageAsync(Guid userId, Guid conversationId, string body, CancellationToken cancellationToken);
}

public interface IAuthService
{
    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<AuthResult> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken);
}

public sealed record TutorSearchQuery(
    string? Search,
    string[] Subjects,
    string[] ClassLevels,
    string[] Cities,
    string[] Modes,
    string[] Genders,
    string[] Languages,
    decimal? MinFee,
    decimal? MaxFee,
    string? Sort);

public sealed record LoginRequest(string EmailOrPhone, string Password);

public sealed record RegisterRequest(
    string Role,
    string FullName,
    string Phone,
    string Email,
    string Password,
    string? City,
    string[] Subjects,
    string[] ClassLevels,
    string[] PreferredModes);

public sealed record RefreshTokenRequest(string RefreshToken);
