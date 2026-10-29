using Enotes.Application.Common;
using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Enotes.Infrastructure.Persistence;

public sealed class EfRoleMenuRepository(AppDbContext dbContext) : IRoleMenuRepository
{
    public Task<IEnumerable<RoleMenuWithRolesDto>> GetAllWithRolesAsync(
        string? searchTerm,
        CancellationToken cancellationToken = default)
    {
        var query = from m in dbContext.Menus
                    join r in dbContext.RoleMenus on m.CdMenu equals r.CdMenu into roleGroup
                    from r in roleGroup.DefaultIfEmpty()
                    group new { m, r } by new
                    {
                        m.CdMenu,
                        m.NmMenu,
                        m.FgType,
                        m.CdModule,
                        m.NoPos,
                        m.CdMenuParent
                    } into g
                    select new RoleMenuWithRolesDto(
                        g.Key.CdMenu,
                        g.Key.NmMenu,
                        g.Key.FgType,
                        g.Key.CdModule,
                        g.Key.NoPos,
                        g.Key.CdMenuParent,
                        g.Any(x => x.r != null && x.r.FgRole == "0"),
                        g.Any(x => x.r != null && x.r.FgRole == "1"),
                        g.Any(x => x.r != null && x.r.FgRole == "2"),
                        g.Any(x => x.r != null && x.r.FgRole == "3"));

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(x => x.NmMenu.Contains(searchTerm) || x.CdMenu.Contains(searchTerm));
        }

        return query.ToListAsync(cancellationToken)
            .ContinueWith(t => (IEnumerable<RoleMenuWithRolesDto>)t.Result, cancellationToken);
    }

    public Task<bool> ExistsAsync(
        string fgRole,
        string cdMenu,
        CancellationToken cancellationToken = default)
    {
        return dbContext.RoleMenus
            .AnyAsync(x => x.FgRole == fgRole && x.CdMenu == cdMenu, cancellationToken);
    }

    public Task AddAsync(
        SysRoleMenu roleMenu,
        CancellationToken cancellationToken = default)
    {
        dbContext.RoleMenus.Add(roleMenu);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(
        string fgRole,
        string cdMenu,
        CancellationToken cancellationToken = default)
    {
        var entity = dbContext.RoleMenus.FirstOrDefault(x => x.FgRole == fgRole && x.CdMenu == cdMenu);
        if (entity is not null)
        {
            dbContext.RoleMenus.Remove(entity);
        }
        return Task.CompletedTask;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
