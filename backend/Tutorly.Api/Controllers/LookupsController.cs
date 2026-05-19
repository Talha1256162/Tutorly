using Microsoft.AspNetCore.Mvc;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Shared;

namespace Tutorly.Api.Controllers;

[ApiController]
[Route("api/lookups")]
public sealed class LookupsController : ControllerBase
{
    private readonly ILookupRepository _lookupRepository;

    public LookupsController(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> Get(CancellationToken cancellationToken)
    {
        var lookups = await _lookupRepository.GetLookupMapAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyDictionary<string, IReadOnlyList<LookupValue>>>.Ok(lookups));
    }

    [HttpGet("platform-settings")]
    public async Task<ActionResult<ApiResponse<object>>> PlatformSettings(CancellationToken cancellationToken)
    {
        var settings = await _lookupRepository.GetPlatformSettingsAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<PlatformSetting>>.Ok(settings));
    }
}
