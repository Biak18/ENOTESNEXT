using Enotes.Application.Common;
using Enotes.Domain.Entities;
using Dapper;
using Microsoft.EntityFrameworkCore;

namespace Enotes.Infrastructure.Persistence;

public sealed class EfMenuRepository(AppDbContext dbContext) : IMenuRepository
{
    static EfMenuRepository()
    {
        // Map snake_case DB columns (cd_menu) to PascalCase C# properties (CdMenu)
        Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
    }

    public Task<IEnumerable<SysMenu>> GetAllAsync(string? searchTerm, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Menus.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(x => x.NmMenu.Contains(searchTerm) || x.CdMenu.Contains(searchTerm));
        }

        return query.ToListAsync(cancellationToken)
            .ContinueWith(t => (IEnumerable<SysMenu>)t.Result, cancellationToken);
    }

    public async Task<IEnumerable<MenuTreeItemDto>> GetMenuTreeAsync(
        string? searchTerm,
        CancellationToken cancellationToken = default)
    {
        var connection = dbContext.Database.GetDbConnection();

        var parameters = new DynamicParameters();
        parameters.Add("p_nm_menu", searchTerm);

        var result = await connection.QueryAsync<MenuTreeItemDto>(
            "SELECT * FROM public.ap_cus_reg_001_s(@p_nm_menu)",
            parameters);

        return result;
    }

    public Task<SysMenu?> GetByIdAsync(string cdMenu, CancellationToken cancellationToken = default)
    {
        return dbContext.Menus.FirstOrDefaultAsync(x => x.CdMenu == cdMenu, cancellationToken);
    }

    public Task AddAsync(SysMenu menu, CancellationToken cancellationToken = default)
    {
        dbContext.Menus.Add(menu);
        return Task.CompletedTask;
    }

    public void Update(SysMenu menu)
    {
        dbContext.Menus.Update(menu);
    }

    public Task DeleteAsync(string cdMenu, CancellationToken cancellationToken = default)
    {
        var entity = dbContext.Menus.FirstOrDefault(x => x.CdMenu == cdMenu);
        if (entity is not null)
        {
            dbContext.Menus.Remove(entity);
        }
        return Task.CompletedTask;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
