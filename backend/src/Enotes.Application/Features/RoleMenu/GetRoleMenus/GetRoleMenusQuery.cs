using MediatR;

namespace Enotes.Application.Features.RoleMenu.GetRoleMenus;

public sealed record GetRoleMenusQuery(string? SearchTerm) : IRequest<IEnumerable<RoleMenuDto>>;

public sealed record RoleMenuDto(
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
