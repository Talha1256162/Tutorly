using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Tutorly.Api.Hubs;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Shared;

namespace Tutorly.Api.Controllers;

[ApiController]
[Route("api/messages")]
public sealed class MessagesController : ControllerBase
{
    private readonly IMessageRepository _messageRepository;
    private readonly IHubContext<ChatHub> _chatHub;

    public MessagesController(IMessageRepository messageRepository, IHubContext<ChatHub> chatHub)
    {
        _messageRepository = messageRepository;
        _chatHub = chatHub;
    }

    [Authorize]
    [HttpGet("conversations")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<Conversation>>>> Conversations(CancellationToken cancellationToken)
    {
        var result = await _messageRepository.GetConversationsAsync(GetUserId(), cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<Conversation>>.Ok(result, count: result.Count));
    }

    [Authorize(Roles = "student,parent,admin")]
    [HttpPost("with-tutor/{tutorId}")]
    public async Task<ActionResult<ApiResponse<Conversation>>> StartConversation(string tutorId, CancellationToken cancellationToken)
    {
        var result = await _messageRepository.GetOrCreateTutorConversationAsync(GetUserId(), tutorId, cancellationToken);
        return Ok(ApiResponse<Conversation>.Ok(result, "Conversation ready."));
    }

    [Authorize]
    [HttpPost("conversations/{conversationId:guid}/messages")]
    public async Task<ActionResult<ApiResponse<MessageItem>>> SendMessage(
        Guid conversationId,
        SendMessageRequest request,
        CancellationToken cancellationToken)
    {
        var body = request.Body?.Trim() ?? "";
        if (body.Length == 0)
        {
            return BadRequest(ApiResponse<MessageItem>.Fail(StatusCodes.Status400BadRequest, "Message cannot be empty."));
        }

        if (body.Length > 2000)
        {
            return BadRequest(ApiResponse<MessageItem>.Fail(StatusCodes.Status400BadRequest, "Message cannot exceed 2000 characters."));
        }

        var result = await _messageRepository.SendMessageAsync(GetUserId(), conversationId, body, cancellationToken);
        await _chatHub.Clients
            .Group(ChatHub.ConversationGroup(conversationId))
            .SendAsync(ChatHub.MessageReceivedEvent, conversationId.ToString(), result, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<MessageItem>.Created(result, "Message sent."));
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var userId) ? userId : Guid.Empty;
    }
}
