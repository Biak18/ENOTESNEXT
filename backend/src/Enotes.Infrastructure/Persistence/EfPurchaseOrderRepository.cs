using Enotes.Application.Common;
using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Enotes.Infrastructure.Persistence;

public sealed class EfPurchaseOrderRepository(AppDbContext dbContext) : IPurchaseOrderRepository
{
    public async Task<IEnumerable<PurPurchaseOrder>> SearchAsync(
        string cdCompany,
        string? searchTerm,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.PurchaseOrders
            .Include(x => x.Lines)
            .Where(x => x.CdCompany == cdCompany)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim();
            query = query.Where(x =>
                x.CdOrder.Contains(term) ||
                x.NmSupplier.Contains(term) ||
                x.Lines.Any(line =>
                    line.CdItem.Contains(term) || line.NmItem.Contains(term)));
        }

        return await query
            .OrderByDescending(x => x.DtOrder)
            .ThenByDescending(x => x.CdOrder)
            .ToListAsync(cancellationToken);
    }

    public Task<PurPurchaseOrder?> GetAsync(
        string cdCompany,
        string cdOrder,
        CancellationToken cancellationToken = default)
    {
        return dbContext.PurchaseOrders
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(
                x => x.CdCompany == cdCompany && x.CdOrder == cdOrder,
                cancellationToken);
    }

    public Task SaveAsync(
        PurPurchaseOrder order,
        CancellationToken cancellationToken = default)
    {
        if (dbContext.Entry(order).State == EntityState.Detached)
            dbContext.PurchaseOrders.Add(order);

        return Task.CompletedTask;
    }
}
