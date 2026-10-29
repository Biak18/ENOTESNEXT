using MediatR;

namespace Enotes.Application.Features.UserMenu.SaveUserMenu;

public sealed record SaveUserMenuCommand(
    string CdCompany,
    List<UserMenuItemDto> Items) : IRequest<SaveUserMenuResponse>;

public sealed record UserMenuItemDto(
    string CdUser,
    string CdMenu,
    string? FgAction, // "A" = Allow, "N" = Deny, null/empty = Remove override
    string? State);

public sealed record SaveUserMenuResponse(
    int SavedCount);
