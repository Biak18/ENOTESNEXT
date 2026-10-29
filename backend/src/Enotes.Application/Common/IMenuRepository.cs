using Enotes.Domain.Entities;
using System.Collections.Generic;

namespace Enotes.Application.Common;

public interface IMenuRepository
{
    Task<IEnumerable<SysMenu>> GetAllAsync(string? searchTerm, CancellationToken cancellationToken = default);

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
