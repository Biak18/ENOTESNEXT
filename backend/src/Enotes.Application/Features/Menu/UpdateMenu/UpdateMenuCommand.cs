using MediatR;

namespace Enotes.Application.Features.Menu.UpdateMenu;

public sealed record UpdateMenuCommand(
    string CdMenu,
    string NmMenu,
    string? NmNetwindow,
    string? FgType,
    string? CdModule,
    string? NoPos,
    string? CdMenuParent) : IRequest<UpdateMenuResponse>;

public sealed record UpdateMenuResponse(
    string CdMenu,
    string Message);
