using MediatR;

namespace Enotes.Application.Features.PurchaseOrder.SavePurchaseOrder;

public sealed record SavePurchaseOrderCommand(
    string CdCompany,
    string CdOrder,
    string NmSupplier,
    DateOnly DtOrder,
    DateOnly? DtExpected,
    string CdCurrency,
    string? DcReference,
    string? DcNotes,
    List<PurchaseOrderLineInputDto> Lines) : IRequest<SavePurchaseOrderResponse>;

public sealed record PurchaseOrderLineInputDto(
    string CdItem,
    string NmItem,
    string CdCategory,
    string CdLocation,
    string NmUnit,
    decimal QtOrder,
    decimal AmUnitPrice);

public sealed record SavePurchaseOrderResponse(
    string CdOrder,
    int SavedLineCount);

public sealed record SavePurchaseOrderRequest(
    string CdOrder,
    string NmSupplier,
    DateOnly DtOrder,
    DateOnly? DtExpected,
    string CdCurrency,
    string? DcReference,
    string? DcNotes,
    List<PurchaseOrderLineInputDto> Lines);
