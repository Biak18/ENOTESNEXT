using Enotes.Application.Common;
using Enotes.Domain.Common;
using MediatR;

namespace Enotes.Application.Features.UserMenu.DeleteUserMenu;

public sealed class DeleteUserMenuHandler(
    IUserMenuRepository userMenuRepository)
    : IRequestHandler<DeleteUserMenuCommand, DeleteUserMenuResponse>
{
    public async Task<DeleteUserMenuResponse> Handle(
        DeleteUserMenuCommand command,
        CancellationToken cancellationToken)
    {
        await userMenuRepository.DeleteAsync(command.CdCompany, command.CdUser, command.CdMenu, cancellationToken);
        await userMenuRepository.SaveChangesAsync(cancellationToken);

        return new DeleteUserMenuResponse(command.CdCompany, command.CdUser, command.CdMenu, "User menu override removed successfully.");
    }
}
