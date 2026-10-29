using System.Security.Claims;
using Enotes.Application.Features.PurchaseOrder.GetPurchaseOrders;
using Enotes.Application.Features.PurchaseOrder.SavePurchaseOrder;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Enotes.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public sealed class PurchaseOrdersController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(string? search, CancellationToken cancellationToken)
    {
        var cdCompany = User.FindFirstValue("cd_com");
        if (string.IsNullOrWhiteSpace(cdCompany)) return Forbid();

        var result = await sender.Send(
            new GetPurchaseOrdersQuery(cdCompany, search),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("{cdOrder}")]
    public async Task<IActionResult> GetById(string cdOrder, CancellationToken cancellationToken)
    {
        var cdCompany = User.FindFirstValue("cd_com");
        if (string.IsNullOrWhiteSpace(cdCompany)) return Forbid();

        var result = await sender.Send(
            new GetPurchaseOrdersQuery(cdCompany, cdOrder),
            cancellationToken);
        var order = result.FirstOrDefault(x => x.CdOrder == cdOrder);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpPut("{cdOrder}")]
    public async Task<IActionResult> Save(
        string cdOrder,
        [FromBody] SavePurchaseOrderRequest request,
        CancellationToken cancellationToken)
    {
        var cdCompany = User.FindFirstValue("cd_com");
        if (string.IsNullOrWhiteSpace(cdCompany)) return Forbid();
        if (!string.Equals(cdOrder, request.CdOrder, StringComparison.Ordinal))
            return BadRequest("Purchase order number mismatch.");

        var result = await sender.Send(
            new SavePurchaseOrderCommand(
                cdCompany,
                request.CdOrder,
                request.NmSupplier,
                request.DtOrder,
                request.DtExpected,
                request.CdCurrency,
                request.DcReference,
                request.DcNotes,
                request.Lines),
            cancellationToken);
        return Ok(result);
    }
}
