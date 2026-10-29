using Enotes.Application.Common;
using MediatR;

namespace Enotes.Application.Features.PurchaseOrder.GetPurchaseOrders;

public sealed class GetPurchaseOrdersHandler(IPurchaseOrderRepository repository)
    : IRequestHandler<GetPurchaseOrdersQuery, IEnumerable<PurchaseOrderDto>>
{
    public async Task<IEnumerable<PurchaseOrderDto>> Handle(
        GetPurchaseOrdersQuery query,
        CancellationToken cancellationToken)
    {
        var orders = await repository.SearchAsync(
            query.CdCompany,
            query.SearchTerm,
            cancellationToken);

        return orders.Select(order => new PurchaseOrderDto(
            order.CdOrder,
            order.NmSupplier,
            order.DtOrder,
            order.DtExpected,
            order.CdCurrency,
            order.DcReference,
            order.DcNotes,
            order.TmReg,
            order.TmAmd,
            order.Lines.OrderBy(line => line.NoLine).Select(line => new PurchaseOrderLineDto(
                line.CdItem,
                line.NmItem,
                line.CdCategory,
                line.CdLocation,
                line.NmUnit,
                line.QtOrder,
                line.AmUnitPrice,
                line.AmLine)).ToList()));
    }
}
