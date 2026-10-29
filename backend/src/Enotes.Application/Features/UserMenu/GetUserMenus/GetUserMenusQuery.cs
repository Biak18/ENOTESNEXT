using MediatR;

namespace Enotes.Application.Features.UserMenu.GetUserMenus;

public sealed record GetUserMenusQuery(string CdCompany, string? CdUser) : IRequest<IEnumerable<UserMenuDto>>;

public sealed record UserMenuDto(
    string CdCompany,
    string CdUser,
    string CdMenu,
    string? NmMenu,
    string? FgAction);
