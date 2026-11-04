using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Enotes.Application.Features.Item.SaveItems;

public sealed record SaveItemsCommand(
    string CdCompany,
    IReadOnlyList<ItemSaveRequest> Items) : IRequest<SaveItemsResponse>;

/// <summary>Batch payload used by the item register save operation.</summary>
public sealed record SaveItemsRequest(
    [param: Required] IReadOnlyList<ItemSaveRequest> Items);

/// <summary>One item row and its insert, update, or delete operation.</summary>
public sealed record ItemSaveRequest(
    string CdItem,
    string NmItem,
    short FgType,
    string? CdCategory,
    string CdUom,
    decimal? PrPx,
    bool FlLot,
    bool FlActive,
    [param: Required] string State);

/// <summary>Number of item rows saved by the batch operation.</summary>
public sealed record SaveItemsResponse(int SavedCount);
