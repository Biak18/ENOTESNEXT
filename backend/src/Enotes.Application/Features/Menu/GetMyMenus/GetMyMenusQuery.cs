using Enotes.Application.Common;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Enotes.Application.Features.Menu.GetMyMenus;

public sealed record GetMyMenusQuery(string? SearchTerm = null) : IRequest<IEnumerable<MenuTreeItemDto>>;

/// <summary>
/// Grant-aware menu tree for the navigation sidebar. Resolves the caller's
/// company/user/role from the JWT and delegates the layer rules (company
/// grant, user override, role grant) to ap_enotes_001_s.
/// </summary>
public sealed class GetMyMenusHandler(
    IMenuRepository menuRepository,
    IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<GetMyMenusQuery, IEnumerable<MenuTreeItemDto>>
{
    public async Task<IEnumerable<MenuTreeItemDto>> Handle(
        GetMyMenusQuery query,
        CancellationToken cancellationToken)
    {
        var user = httpContextAccessor.HttpContext?.User;

        var cdCompany = user?.FindFirst("cd_com")?.Value ?? string.Empty;
        var cdUser = user?.FindFirst("cd_user")?.Value ?? string.Empty;
        var fgRole = user?.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

        return await menuRepository.GetAuthorizedMenuTreeAsync(
            query.SearchTerm,
            cdCompany,
            cdUser,
            fgRole,
            cancellationToken);
    }
}
