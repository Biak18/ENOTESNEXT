using Enotes.Application.Common;
using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Enotes.Infrastructure.Persistence;

public sealed class EfCompanyMenuRepository(AppDbContext dbContext) : ICompanyMenuRepository
{
    public async Task<IEnumerable<CompanyMenuAssignmentDto>> GetAllByCompanyAsync(
        string cdCompany,
        CancellationToken cancellationToken = default)
    {
        // Folder cascading happens on write, so a plain row-presence read is
        // enough: granted descendants have their own sys_companymenu rows.
        var assignedMenus = (await dbContext.CompanyMenus
            .Where(x => x.CdCompany == cdCompany)
            .Select(x => x.CdMenu)
            .ToListAsync(cancellationToken))
            .ToHashSet();

        var rows = await dbContext.Menus
            .Select(m => new CompanyMenuAssignmentDto(
                cdCompany,
                m.CdMenu,
                m.NmMenu,
                assignedMenus.Contains(m.CdMenu)))
            .ToListAsync(cancellationToken);

        return rows;
    }

    public async Task<IReadOnlyCollection<string>> GetAssignedMenuCodesAsync(
        string cdCompany,
        CancellationToken cancellationToken = default)
    {
        var codes = await dbContext.CompanyMenus
            .Where(x => x.CdCompany == cdCompany)
            .Select(x => x.CdMenu)
            .ToListAsync(cancellationToken);

        return codes;
    }

    public Task AddRangeAsync(
        string cdCompany,
        IEnumerable<string> cdMenus,
        CancellationToken cancellationToken = default)
    {
        foreach (var cdMenu in cdMenus)
        {
            dbContext.CompanyMenus.Add(SysCompanyMenu.Create(cdCompany, cdMenu));
        }

        return Task.CompletedTask;
    }

    public async Task<int> RemoveRangeAsync(
        string cdCompany,
        IEnumerable<string> cdMenus,
        CancellationToken cancellationToken = default)
    {
        var codes = cdMenus.ToList();
        if (codes.Count == 0) return 0;

        var removed = 0;

        // Rows added earlier in the same still-pending save: untrack them.
        // (EF removes them from the insert set instead of issuing a delete.)
        foreach (var added in dbContext.CompanyMenus.Local
                     .Where(x => x.CdCompany == cdCompany && codes.Contains(x.CdMenu))
                     .ToList())
        {
            dbContext.CompanyMenus.Remove(added);
            removed++;
        }

        // Rows persisted in the DB: delete them in a single query.
        var existing = await dbContext.CompanyMenus
            .Where(x => x.CdCompany == cdCompany && codes.Contains(x.CdMenu))
            .ToListAsync(cancellationToken);

        foreach (var entity in existing)
        {
            dbContext.CompanyMenus.Remove(entity);
            removed++;
        }

        return removed;
    }

    public async Task AssignAsync(
        string cdCompany,
        string cdMenu,
        CancellationToken cancellationToken = default)
    {
        // Idempotent: skip when the grant already exists (avoids a PK violation
        // when a menu is granted more than once).
        var exists = await dbContext.CompanyMenus.AnyAsync(
            x => x.CdCompany == cdCompany && x.CdMenu == cdMenu,
            cancellationToken);
        if (exists) return;

        dbContext.CompanyMenus.Add(SysCompanyMenu.Create(cdCompany, cdMenu));
    }

    public Task DeleteAsync(
        string cdCompany,
        string cdMenu,
        CancellationToken cancellationToken = default)
    {
        var entity = dbContext.CompanyMenus.FirstOrDefault(x => x.CdCompany == cdCompany && x.CdMenu == cdMenu);
        if (entity is not null)
        {
            dbContext.CompanyMenus.Remove(entity);
        }
        return Task.CompletedTask;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
