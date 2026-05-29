using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Tutorly.Application;
using Tutorly.Domain;

namespace Tutorly.Api.Hubs;

[Authorize]
public sealed class ChatHub : Hub
{
    public const string MessageReceivedEvent = "MessageReceived";

    private readonly IMessageRepository _messageRepository;

    public ChatHub(IMessageRepository messageRepository)
    {
        _messageRepository = messageRepository;
    }

    public static string ConversationGroup(Guid conversationId) => $"conversation:{conversationId}";

    public async Task JoinConversation(string conversationId)
    {
        var resolvedId = ParseConversationId(conversationId);
        var conversation = await _messageRepository.GetConversationAsync(GetUserId(), resolvedId, Context.ConnectionAborted);
        if (conversation is null)
        {
            throw new HubException("You cannot access this conversation.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, ConversationGroup(resolvedId), Context.ConnectionAborted);
    }

    public async Task<MessageItem> SendMessage(string conversationId, string body)
    {
        var resolvedId = ParseConversationId(conversationId);
        var messageText = body?.Trim() ?? "";
        if (messageText.Length == 0)
        {
            throw new HubException("Message cannot be empty.");
        }

        if (messageText.Length > 2000)
        {
            throw new HubException("Message cannot exceed 2000 characters.");
        }

        var message = await _messageRepository.SendMessageAsync(GetUserId(), resolvedId, messageText, Context.ConnectionAborted);
        await Clients.Group(ConversationGroup(resolvedId))
            .SendAsync(MessageReceivedEvent, resolvedId.ToString(), message, Context.ConnectionAborted);
        return message;
    }

    private Guid GetUserId()
    {
        var value = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? Context.User?.FindFirstValue("sub");
        return Guid.TryParse(value, out var userId)
            ? userId
            : throw new HubException("Authenticated user was not identified.");
    }

    private static Guid ParseConversationId(string conversationId)
    {
        return Guid.TryParse(conversationId, out var value)
            ? value
            : throw new HubException("Conversation identifier is invalid.");
    }
}
