using Enotes.Application.Common;
using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Enotes.Infrastructure.Persistence;

public sealed class EfCompanyMenuRepository(AppDbContext dbContext) : ICompanyMenuRepository
{
    public Task<IEnumerable<CompanyMenuAssignmentDto>> GetAllByCompanyAsync(
        string cdCompany,
        CancellationToken cancellationToken = default)
    {
        var assignedMenus = dbContext.CompanyMenus
            .Where(x => x.CdCompany == cdCompany)
            .Select(x => x.CdMenu)
            .ToHashSet();

        var query = from m in dbContext.Menus
                    select new CompanyMenuAssignmentDto(
                        cdCompany,
                        m.CdMenu,
                        m.NmMenu,
                        assignedMenus.Contains(m.CdMenu));

        return query.ToListAsync(cancellationToken)
            .ContinueWith(t => (IEnumerable<CompanyMenuAssignmentDto>)t.Result, cancellationToken);
    }

    public Task UnassignAllAsync(
        string cdCompany,
        CancellationToken cancellationToken = default)
    {
        var entities = dbContext.CompanyMenus
            .Where(x => x.CdCompany == cdCompany)
            .ToList();

        foreach (var entity in entities)
        {
            dbContext.CompanyMenus.Remove(entity);
        }

        return Task.CompletedTask;
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
