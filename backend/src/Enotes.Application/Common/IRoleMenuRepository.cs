using Enotes.Domain.Entities;
using System.Collections.Generic;

namespace Enotes.Application.Common;

public interface IRoleMenuRepository
{
    Task<IEnumerable<RoleMenuWithRolesDto>> GetAllWithRolesAsync(
        string? searchTerm,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        string fgRole,
        string cdMenu,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        SysRoleMenu roleMenu,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        string fgRole,
        string cdMenu,
        CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed record RoleMenuWithRolesDto(
    string CdMenu,
    string NmMenu,
    string? FgType,
    string? CdModule,
    string? NoPos,
    string? CdMenuParent,
    bool Employee,
    bool TeamLead,
    bool Manager,
    bool Boss);
