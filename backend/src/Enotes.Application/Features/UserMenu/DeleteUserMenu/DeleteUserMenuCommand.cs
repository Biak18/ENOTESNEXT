using MediatR;

namespace Enotes.Application.Features.UserMenu.DeleteUserMenu;

public sealed record DeleteUserMenuCommand(string CdCompany, string CdUser, string CdMenu) : IRequest<DeleteUserMenuResponse>;

public sealed record DeleteUserMenuResponse(string CdCompany, string CdUser, string CdMenu, string Message);
