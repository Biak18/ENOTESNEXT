using MediatR;

namespace Enotes.Application.Features.RoleMenu.DeleteRoleMenu;

public sealed record DeleteRoleMenuCommand(string FgRole, string CdMenu) : IRequest<DeleteRoleMenuResponse>;

public sealed record DeleteRoleMenuResponse(string FgRole, string CdMenu, string Message);
