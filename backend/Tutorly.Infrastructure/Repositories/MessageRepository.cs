using Tutorly.Application;
using Tutorly.Domain;

namespace Tutorly.Infrastructure.Repositories;

public sealed class MessageRepository : IMessageRepository
{
    private readonly ITutorRepository _tutorRepository;

    public MessageRepository(ITutorRepository tutorRepository)
    {
        _tutorRepository = tutorRepository;
    }

    public async Task<IReadOnlyList<Conversation>> GetConversationsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var tutors = (await _tutorRepository.SearchAsync(new TutorSearchQuery(null, Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), null, null, "top-rated"), cancellationToken))
            .Take(6)
            .ToArray();

        return tutors.Select((tutor, index) => new Conversation(
            tutor.Id,
            tutor.Name,
            tutor.PhotoUrl,
            tutor.Verified,
            "Online · usually replies in 12 min",
            "See you at the demo!",
            $"5:4{index}p",
            index == 0
                ? new[]
                {
                    new MessageItem("1", "tutor", "Walaikum salam Zara! Looking forward to our demo today.", "5:42 PM", false),
                    new MessageItem("2", "me", "Sir actually I'm a bit anxious about projectile motion. Can we focus there?", "5:44 PM", true),
                    new MessageItem("3", "tutor", "Absolutely. I'll bring 3 worked examples. We'll have it cracked in 20 min.", "5:45 PM", false),
                    new MessageItem("4", "tutor", "Also - can you share the past paper you tried? I'd like to see where you got stuck.", "5:45 PM", false),
                    new MessageItem("5", "me", "Sending now", "5:48 PM", true)
                }
                : Array.Empty<MessageItem>())).ToArray();
    }
}
