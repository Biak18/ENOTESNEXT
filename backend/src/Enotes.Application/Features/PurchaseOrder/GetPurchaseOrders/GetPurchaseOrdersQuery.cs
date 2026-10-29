using MediatR;

namespace Enotes.Application.Features.PurchaseOrder.GetPurchaseOrders;

public sealed record GetPurchaseOrdersQuery(
    string CdCompany,
    string? SearchTerm) : IRequest<IEnumerable<PurchaseOrderDto>>;

public sealed record PurchaseOrderDto(
    string CdOrder,
    string NmSupplier,
    DateOnly DtOrder,
    DateOnly? DtExpected,
    string CdCurrency,
    string? DcReference,
    string? DcNotes,
    DateTime TmReg,
    DateTime? TmAmd,
    IReadOnlyList<PurchaseOrderLineDto> Lines);

public sealed record PurchaseOrderLineDto(
    string CdItem,
    string NmItem,
    string CdCategory,
    string CdLocation,
    string NmUnit,
    decimal QtOrder,
    decimal AmUnitPrice,
    decimal AmLine);
