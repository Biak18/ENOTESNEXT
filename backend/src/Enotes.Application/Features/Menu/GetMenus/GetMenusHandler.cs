using Enotes.Application.Common;
using MediatR;

namespace Enotes.Application.Features.Menu.GetMenus;

public sealed class GetMenusHandler(
    IMenuRepository menuRepository)
    : IRequestHandler<GetMenusQuery, IEnumerable<MenuDto>>
{
    public async Task<IEnumerable<MenuDto>> Handle(
        GetMenusQuery query,
        CancellationToken cancellationToken)
    {
        var menuItems = await menuRepository.GetMenuTreeAsync(
            query.SearchTerm,
            cancellationToken);

        return menuItems.Select(m => new MenuDto(
            m.CdMenu,
            m.NmMenu,
            m.NmNetwindow,
            m.FgType,
            m.CdModule,
            m.NoPos,
            m.CdMenuParent));
    }
}
