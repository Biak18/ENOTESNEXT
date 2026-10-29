using Enotes.Application.Common;
using MediatR;

namespace Enotes.Application.Features.RoleMenu.GetRoleMenus;

public sealed class GetRoleMenusHandler(
    IRoleMenuRepository roleMenuRepository)
    : IRequestHandler<GetRoleMenusQuery, IEnumerable<RoleMenuDto>>
{
    public async Task<IEnumerable<RoleMenuDto>> Handle(
        GetRoleMenusQuery query,
        CancellationToken cancellationToken)
    {
        var menus = await roleMenuRepository.GetAllWithRolesAsync(
            query.SearchTerm,
            cancellationToken);

        return menus.Select(m => new RoleMenuDto(
            m.CdMenu,
            m.NmMenu,
            m.FgType,
            m.CdModule,
            m.NoPos,
            m.CdMenuParent,
            m.Employee,
            m.TeamLead,
            m.Manager,
            m.Boss));
    }
}
