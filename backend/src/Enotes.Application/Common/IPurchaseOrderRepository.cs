using Enotes.Domain.Entities;

namespace Enotes.Application.Common;

public interface IPurchaseOrderRepository
{
    Task<IEnumerable<PurPurchaseOrder>> SearchAsync(
        string cdCompany,
        string? searchTerm,
        CancellationToken cancellationToken = default);

    Task<PurPurchaseOrder?> GetAsync(
        string cdCompany,
        string cdOrder,
        CancellationToken cancellationToken = default);

    Task SaveAsync(PurPurchaseOrder order, CancellationToken cancellationToken = default);
}
