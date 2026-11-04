using Enotes.Domain.Entities;

namespace Enotes.Application.Common;

public interface IItemRepository
{
    Task<IReadOnlyList<MasItem>> SearchAsync(
        string cdCompany,
        string? searchTerm,
        short? fgType,
        CancellationToken cancellationToken = default);

    Task<MasItem?> GetByIdAsync(
        string cdCompany,
        string cdItem,
        CancellationToken cancellationToken = default);

    Task<bool> IsActiveUomAsync(
        string cdUom,
        CancellationToken cancellationToken = default);

    void Add(MasItem item);

    void Remove(MasItem item);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
