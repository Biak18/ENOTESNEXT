using Enotes.Application.Common;
using MediatR;

namespace Enotes.Application.Features.UserMenu.GetUserMenus;

public sealed class GetUserMenusHandler(
    IUserMenuRepository userMenuRepository)
    : IRequestHandler<GetUserMenusQuery, IEnumerable<UserMenuDto>>
{
    public async Task<IEnumerable<UserMenuDto>> Handle(
        GetUserMenusQuery query,
        CancellationToken cancellationToken)
    {
        var assignments = await userMenuRepository.GetAllAsync(
            query.CdCompany,
            query.CdUser,
            cancellationToken);

        return assignments.Select(a => new UserMenuDto(
            a.CdCompany,
            a.CdUser,
            a.CdMenu,
            a.NmMenu,
            a.FgAction));
    }
}
