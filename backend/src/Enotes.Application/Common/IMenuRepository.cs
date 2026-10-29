using Enotes.Domain.Entities;
using System.Collections.Generic;

namespace Enotes.Application.Common;

public interface IMenuRepository
{
    Task<IEnumerable<SysMenu>> GetAllAsync(string? searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Flat sys_menu list used to resolve the parent/child hierarchy
    /// (cd_menu_parent) when cascading folder grants. Similar to GetAllAsync
    /// but as a lightweight projection with no search filter.
    /// </summary>
    Task<IReadOnlyList<MenuHierarchyItemDto>> GetMenuHierarchyAsync(
        CancellationToken cancellationToken = default);
    /// <summary>
    /// Grant-aware entry (ap_enotes_001_s) for the navigation sidebar tree:
    /// requests the caller's company/user/role from the JWT and applies the
    /// layer rules INSIDE the proc - company grant, user override (A/N),
    /// role grant; SYSTEM company and EN_SYS_MENU_REG_001 stay visible.
    /// </summary>
    Task<IEnumerable<MenuTreeItemDto>> GetAuthorizedMenuTreeAsync(
        string? searchTerm,
        string cdCompany,
        string cdUser,
        string fgRole,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<MenuTreeItemDto>> GetMenuTreeAsync(
        string? searchTerm,
        CancellationToken cancellationToken = default);

    Task<SysMenu?> GetByIdAsync(string cdMenu, CancellationToken cancellationToken = default);

    Task AddAsync(SysMenu menu, CancellationToken cancellationToken = default);

    void Update(SysMenu menu);

    Task DeleteAsync(string cdMenu, CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class MenuTreeItemDto
{
    public string CdMenu { get; set; } = string.Empty;
    public string NmMenu { get; set; } = string.Empty;
    public string? NmNetwindow { get; set; }
    public string? FgType { get; set; }
    public string? CdModule { get; set; }
    public string? NoPos { get; set; }
    public string? CdMenuParent { get; set; }
}

public sealed record MenuHierarchyItemDto(
    string CdMenu,
    string? FgType,
    string? CdMenuParent);

