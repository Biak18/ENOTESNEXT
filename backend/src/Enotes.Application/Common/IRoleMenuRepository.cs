using Enotes.Domain.Entities;
using System.Collections.Generic;

namespace Enotes.Application.Common;

/// <summary>
/// sys_rolemenu is a presence-grant layer: a row means the role was granted
/// the menu, and a folder row grants its whole subtree (see MenuSubtree).
/// Folder cascading happens on write, so reads stay simple.
/// </summary>
public interface IRoleMenuRepository
{
    Task<IEnumerable<RoleMenuWithRolesDto>> GetAllWithRolesAsync(
        string? searchTerm,
        CancellationToken cancellationToken = default);

    /// <summary>Codes currently granted to the role (DB rows only).</summary>
    Task<IReadOnlyCollection<string>> GetAssignedMenuCodesAsync(
        string fgRole,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Tracks inserts for every code in cdMenus. The caller dedupes against
    /// the DB (GetAssignedMenuCodesAsync) and earlier items in the same save.
    /// Nothing is persisted until SaveChangesAsync.
    /// </summary>
    Task AddRangeAsync(
        string fgRole,
        IEnumerable<string> cdMenus,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes granted rows for the given codes (existing DB rows, plus any
    /// rows added earlier in the same still-pending save) and returns how
    /// many were actually removed.
    /// </summary>
    Task<int> RemoveRangeAsync(
        string fgRole,
        IEnumerable<string> cdMenus,
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
