using Enotes.Domain.Entities;

namespace Enotes.Application.Common;

public interface IUserRepository
{
    Task<IEnumerable<SysUser>> GetAllAsync(
        string? searchTerm,
        CancellationToken cancellationToken = default);

    Task<SysUser?> GetByCompanyAndUserAsync(
        string cdCom,
        string cdUser,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        string cdCom,
        string cdUser,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        SysUser user,
        CancellationToken cancellationToken = default);

    void Update(SysUser user);

    Task DeleteAsync(
        string cdCom,
        string cdUser,
        CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
