using System.Security.Claims;
using Enotes.Application.Features.Item.GetItems;
using Enotes.Application.Features.Item.SaveItems;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Enotes.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/EN_MAS_BAS_REG_001")]
[Produces("application/json")]
public sealed class EN_MAS_BAS_REG_001_Controller(ISender sender) : ControllerBase
{
    /// <summary>Searches item master data for the authenticated company.</summary>
    [HttpGet]
    [EndpointSummary("Search items")]
    [EndpointDescription("Returns item master rows scoped to the authenticated company.")]
    [ProducesResponseType(typeof(IReadOnlyList<ItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Get(
        [FromQuery] string? search,
        [FromQuery] short? fgType,
        CancellationToken cancellationToken)
    {
        var cdCompany = User.FindFirstValue("cd_com");
        if (string.IsNullOrWhiteSpace(cdCompany)) return Forbid();

        var items = await sender.Send(
            new GetItemsQuery(cdCompany, search, fgType),
            cancellationToken);
        return Ok(items);
    }

    /// <summary>Saves item inserts, updates, and deletes as one batch.</summary>
    [HttpPost("save")]
    [EndpointSummary("Save item changes")]
    [EndpointDescription("Applies item inserts, updates, and deletes as a single database batch.")]
    [ProducesResponseType(typeof(SaveItemsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Save(
        [FromBody] SaveItemsRequest request,
        CancellationToken cancellationToken)
    {
        var cdCompany = User.FindFirstValue("cd_com");
        if (string.IsNullOrWhiteSpace(cdCompany)) return Forbid();

        var result = await sender.Send(
            new SaveItemsCommand(cdCompany, request.Items),
            cancellationToken);
        return Ok(result);
    }
}
