using MediatR;

namespace Enotes.Application.Features.Menu.SaveMenu;

public sealed record SaveMenuCommand(
    List<MenuItemDto> Items) : IRequest<SaveMenuResponse>;

public sealed record MenuItemDto(
    string CdMenu,
    string NmMenu,
    string? NmNetwindow,
    string? FgType,
    string? CdModule,
    string? NoPos,
    string? CdMenuParent,
    string? State);

public sealed record SaveMenuResponse(
    int SavedCount);
