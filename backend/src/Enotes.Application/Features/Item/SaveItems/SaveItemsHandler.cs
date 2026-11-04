using Enotes.Application.Common;
using Enotes.Domain.Common;
using Enotes.Domain.Entities;
using MediatR;

namespace Enotes.Application.Features.Item.SaveItems;

public sealed class SaveItemsHandler(IItemRepository itemRepository)
    : IRequestHandler<SaveItemsCommand, SaveItemsResponse>
{
    public async Task<SaveItemsResponse> Handle(
        SaveItemsCommand command,
        CancellationToken cancellationToken)
    {
        var savedCount = 0;

        foreach (var row in command.Items)
        {
            switch (row.State.ToUpperInvariant())
            {
                case "I":
                {
                    if (await itemRepository.GetByIdAsync(
                            command.CdCompany, row.CdItem, cancellationToken) is not null)
                    {
                        throw new ConflictException(
                            $"Item code already exists: {row.CdItem}");
                    }

                    await EnsureActiveUomAsync(row.CdUom, cancellationToken);
                    itemRepository.Add(MasItem.Create(
                        command.CdCompany,
                        row.CdItem,
                        row.NmItem,
                        row.FgType,
                        row.CdCategory,
                        row.CdUom,
                        row.PrPx,
                        row.FlLot,
                        row.FlActive));
                    savedCount++;
                    break;
                }

                case "U":
                {
                    var item = await itemRepository.GetByIdAsync(
                        command.CdCompany, row.CdItem, cancellationToken)
                        ?? throw new KeyNotFoundException($"Item not found: {row.CdItem}");

                    await EnsureActiveUomAsync(row.CdUom, cancellationToken);
                    item.Update(
                        row.NmItem,
                        row.FgType,
                        row.CdCategory,
                        row.CdUom,
                        row.PrPx,
                        row.FlLot,
                        row.FlActive);
                    savedCount++;
                    break;
                }

                case "D":
                {
                    var item = await itemRepository.GetByIdAsync(
                        command.CdCompany, row.CdItem, cancellationToken)
                        ?? throw new KeyNotFoundException($"Item not found: {row.CdItem}");
                    itemRepository.Remove(item);
                    savedCount++;
                    break;
                }

                default:
                    throw new DomainException("Unsupported item save state.");
            }
        }

        await itemRepository.SaveChangesAsync(cancellationToken);
        return new SaveItemsResponse(savedCount);
    }

    private async Task EnsureActiveUomAsync(
        string cdUom,
        CancellationToken cancellationToken)
    {
        if (!await itemRepository.IsActiveUomAsync(cdUom, cancellationToken))
            throw new DomainException($"Unit of measure is missing or inactive: {cdUom}");
    }
}
