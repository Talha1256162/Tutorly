using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Shared;

namespace Tutorly.Api.Controllers;

[ApiController]
[Route("api/messages")]
public sealed class MessagesController : ControllerBase
{
    private readonly IMessageRepository _messageRepository;

    public MessagesController(IMessageRepository messageRepository)
    {
        _messageRepository = messageRepository;
    }

    [Authorize]
    [HttpGet("conversations")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<Conversation>>>> Conversations(CancellationToken cancellationToken)
    {
        var result = await _messageRepository.GetConversationsAsync(GetUserId(), cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<Conversation>>.Ok(result, count: result.Count));
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var userId) ? userId : Guid.Empty;
    }
}
