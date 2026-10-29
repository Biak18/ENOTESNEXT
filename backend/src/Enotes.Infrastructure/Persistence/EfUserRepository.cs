using Enotes.Application.Common;
using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Enotes.Infrastructure.Persistence;

public sealed class EfUserRepository(AppDbContext dbContext) : IUserRepository
{
    public Task<IEnumerable<SysUser>> GetAllAsync(
        string? searchTerm,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(x => x.NmUser.Contains(searchTerm) || x.CdUser.Contains(searchTerm) || x.CdCom.Contains(searchTerm));
        }

        return query.ToListAsync(cancellationToken)
            .ContinueWith(t => (IEnumerable<SysUser>)t.Result, cancellationToken);
    }

    public Task<SysUser?> GetByCompanyAndUserAsync(
        string cdCom,
        string cdUser,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Users
            .FirstOrDefaultAsync(x => x.CdCom == cdCom && x.CdUser == cdUser, cancellationToken);
    }

    public Task<bool> ExistsAsync(
        string cdCom,
        string cdUser,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Users
            .AnyAsync(x => x.CdCom == cdCom && x.CdUser == cdUser, cancellationToken);
    }

    public Task AddAsync(
        SysUser user,
        CancellationToken cancellationToken = default)
    {
        dbContext.Users.Add(user);
        return Task.CompletedTask;
    }

    public void Update(SysUser user)
    {
        dbContext.Users.Update(user);
    }

    public Task DeleteAsync(
        string cdCom,
        string cdUser,
        CancellationToken cancellationToken = default)
    {
        var entity = dbContext.Users.FirstOrDefault(x => x.CdCom == cdCom && x.CdUser == cdUser);
        if (entity is not null)
        {
            dbContext.Users.Remove(entity);
        }
        return Task.CompletedTask;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
