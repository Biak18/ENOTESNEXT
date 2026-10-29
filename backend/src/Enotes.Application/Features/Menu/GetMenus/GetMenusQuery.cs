using MediatR;

namespace Enotes.Application.Features.Menu.GetMenus;

public sealed record GetMenusQuery(string? SearchTerm) : IRequest<IEnumerable<MenuDto>>;

public sealed record MenuDto(
    string CdMenu,
    string NmMenu,
    string? NmNetwindow,
    string? FgType,
    string? CdModule,
    string? NoPos,
    string? CdMenuParent);
