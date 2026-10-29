using MediatR;

namespace Enotes.Application.Features.RoleMenu.SaveRoleMenu;

public sealed record SaveRoleMenuCommand(
    List<RoleMenuItemDto> Items) : IRequest<SaveRoleMenuResponse>;

public sealed record RoleMenuItemDto(
    string CdMenu,
    string FgRole,
    bool IsAssigned);

public sealed record SaveRoleMenuResponse(
    int SavedCount);
