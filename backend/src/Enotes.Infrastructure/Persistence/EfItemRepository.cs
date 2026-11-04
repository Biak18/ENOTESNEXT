using Enotes.Application.Common;
using Enotes.Domain.Common;
using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Enotes.Infrastructure.Persistence;

public sealed class EfItemRepository(AppDbContext dbContext) : IItemRepository
{
    public async Task<IReadOnlyList<MasItem>> SearchAsync(
        string cdCompany,
        string? searchTerm,
        short? fgType,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Items
            .AsNoTracking()
            .Where(item => item.CdCompany == cdCompany);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(item =>
                item.CdItem.ToLower().Contains(term) ||
                item.NmItem.ToLower().Contains(term) ||
                item.CdUom.ToLower().Contains(term) ||
                (item.CdCategory != null && item.CdCategory.ToLower().Contains(term)));
        }

        if (fgType.HasValue)
            query = query.Where(item => item.FgType == fgType.Value);

        return await query
            .OrderBy(item => item.CdItem)
            .ToListAsync(cancellationToken);
    }

    public Task<MasItem?> GetByIdAsync(
        string cdCompany,
        string cdItem,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Items.FirstOrDefaultAsync(
            item => item.CdCompany == cdCompany && item.CdItem == cdItem,
            cancellationToken);
    }

    public Task<bool> IsActiveUomAsync(
        string cdUom,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Units.AnyAsync(
            unit => unit.CdUom == cdUom.Trim() && unit.FlActive,
            cancellationToken);
    }

    public void Add(MasItem item) => dbContext.Items.Add(item);

    public void Remove(MasItem item) => dbContext.Items.Remove(item);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (
            exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation,
                ConstraintName: "mas_item_pkey"
            })
        {
            throw new ConflictException("An item with this code already exists.");
        }
        catch (DbUpdateException exception) when (
            exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.ForeignKeyViolation
            })
        {
            throw new ConflictException(
                "The item cannot be deleted while referenced, or a reference is no longer valid.");
        }
    }
}
