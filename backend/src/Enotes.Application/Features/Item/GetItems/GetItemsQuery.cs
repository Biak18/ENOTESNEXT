using MediatR;

namespace Enotes.Application.Features.Item.GetItems;

public sealed record GetItemsQuery(
    string CdCompany,
    string? SearchTerm,
    short? FgType) : IRequest<IReadOnlyList<ItemResponse>>;

/// <summary>Item master record returned to the authenticated company.</summary>
public sealed record ItemResponse(
    string Id,
    string CdCompany,
    string CdItem,
    string NmItem,
    short FgType,
    string? CdCategory,
    string CdUom,
    decimal? PrPx,
    decimal? AmCost,
    bool FlLot,
    bool FlActive);
