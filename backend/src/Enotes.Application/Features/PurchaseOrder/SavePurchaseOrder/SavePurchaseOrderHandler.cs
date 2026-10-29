using Enotes.Application.Common;
using Enotes.Domain.Entities;
using MediatR;

namespace Enotes.Application.Features.PurchaseOrder.SavePurchaseOrder;

public sealed class SavePurchaseOrderHandler(IPurchaseOrderRepository repository)
    : IRequestHandler<SavePurchaseOrderCommand, SavePurchaseOrderResponse>
{
    public async Task<SavePurchaseOrderResponse> Handle(
        SavePurchaseOrderCommand command,
        CancellationToken cancellationToken)
    {
        var lineInputs = command.Lines.Select(line => new PurPurchaseOrderLineInput(
            line.CdItem,
            line.NmItem,
            line.CdCategory,
            line.CdLocation,
            line.NmUnit,
            line.QtOrder,
            line.AmUnitPrice));

        var order = await repository.GetAsync(
            command.CdCompany,
            command.CdOrder,
            cancellationToken);

        if (order is null)
        {
            order = PurPurchaseOrder.Create(
                command.CdCompany,
                command.CdOrder,
                command.NmSupplier,
                command.DtOrder,
                command.DtExpected,
                command.CdCurrency,
                command.DcReference,
                command.DcNotes,
                lineInputs);
        }
        else
        {
            order.Update(
                command.NmSupplier,
                command.DtOrder,
                command.DtExpected,
                command.CdCurrency,
                command.DcReference,
                command.DcNotes,
                lineInputs);
        }

        await repository.SaveAsync(order, cancellationToken);
        return new SavePurchaseOrderResponse(order.CdOrder, order.Lines.Count);
    }
}
