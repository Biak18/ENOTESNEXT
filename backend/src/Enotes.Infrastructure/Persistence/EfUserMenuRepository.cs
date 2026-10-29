using Enotes.Application.Common;
using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Enotes.Infrastructure.Persistence;

public sealed class EfUserMenuRepository(AppDbContext dbContext) : IUserMenuRepository
{
    public Task<IEnumerable<UserMenuAssignmentDto>> GetAllAsync(
        string cdCompany,
        string? cdUser,
        CancellationToken cancellationToken = default)
    {
        var query = from um in dbContext.UserMenus
                    join m in dbContext.Menus on um.CdMenu equals m.CdMenu into menuGroup
                    from m in menuGroup.DefaultIfEmpty()
                    where um.CdCompany == cdCompany
                    && (string.IsNullOrEmpty(cdUser) || um.CdUser == cdUser)
                    select new UserMenuAssignmentDto(
                        um.CdCompany,
                        um.CdUser,
                        um.CdMenu,
                        m.NmMenu,
                        um.FgAction);

        return query.ToListAsync(cancellationToken)
            .ContinueWith(t => (IEnumerable<UserMenuAssignmentDto>)t.Result, cancellationToken);
    }

    public Task<bool> ExistsAsync(
        string cdCompany,
        string cdUser,
        string cdMenu,
        CancellationToken cancellationToken = default)
    {
        return dbContext.UserMenus
            .AnyAsync(x => x.CdCompany == cdCompany && x.CdUser == cdUser && x.CdMenu == cdMenu, cancellationToken);
    }

    public Task AddAsync(
        string cdCompany,
        string cdUser,
        string cdMenu,
        string fgAction,
        CancellationToken cancellationToken = default)
    {
        var entity = SysUserMenu.Create(cdCompany, cdUser, cdMenu, fgAction);
        dbContext.UserMenus.Add(entity);
        return Task.CompletedTask;
    }

    public Task UpdateActionAsync(
        string cdCompany,
        string cdUser,
        string cdMenu,
        string fgAction,
        CancellationToken cancellationToken = default)
    {
        var entity = dbContext.UserMenus
            .FirstOrDefault(x => x.CdCompany == cdCompany && x.CdUser == cdUser && x.CdMenu == cdMenu);

        if (entity is not null)
        {
            // SysUserMenu doesn't have a public setter for FgAction, so remove and re-add
            dbContext.UserMenus.Remove(entity);
            var updated = SysUserMenu.Create(cdCompany, cdUser, cdMenu, fgAction);
            dbContext.UserMenus.Add(updated);
        }

        return Task.CompletedTask;
    }

    public Task DeleteAsync(
        string cdCompany,
        string cdUser,
        string cdMenu,
        CancellationToken cancellationToken = default)
    {
        var entity = dbContext.UserMenus.FirstOrDefault(x => x.CdCompany == cdCompany && x.CdUser == cdUser && x.CdMenu == cdMenu);
        if (entity is not null)
        {
            dbContext.UserMenus.Remove(entity);
        }
        return Task.CompletedTask;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
