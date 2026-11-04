using Enotes.Application.Common;
using MediatR;

namespace Enotes.Application.Features.Item.GetItems;

public sealed class GetItemsHandler(IItemRepository itemRepository)
    : IRequestHandler<GetItemsQuery, IReadOnlyList<ItemResponse>>
{
    public async Task<IReadOnlyList<ItemResponse>> Handle(
        GetItemsQuery query,
        CancellationToken cancellationToken)
    {
        var items = await itemRepository.SearchAsync(
            query.CdCompany,
            query.SearchTerm,
            query.FgType,
            cancellationToken);

        return items.Select(item => new ItemResponse(
            $"{item.CdCompany}:{item.CdItem}",
            item.CdCompany,
            item.CdItem,
            item.NmItem,
            item.FgType,
            item.CdCategory,
            item.CdUom,
            item.PrPx,
            item.AmCost,
            item.FlLot,
            item.FlActive)).ToArray();
    }
}
