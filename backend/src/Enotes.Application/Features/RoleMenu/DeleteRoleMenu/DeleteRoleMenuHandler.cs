using Enotes.Application.Common;
using Enotes.Domain.Common;
using MediatR;

namespace Enotes.Application.Features.RoleMenu.DeleteRoleMenu;

public sealed class DeleteRoleMenuHandler(
    IRoleMenuRepository roleMenuRepository)
    : IRequestHandler<DeleteRoleMenuCommand, DeleteRoleMenuResponse>
{
    public async Task<DeleteRoleMenuResponse> Handle(
        DeleteRoleMenuCommand command,
        CancellationToken cancellationToken)
    {
        await roleMenuRepository.DeleteAsync(command.FgRole, command.CdMenu, cancellationToken);
        await roleMenuRepository.SaveChangesAsync(cancellationToken);

        return new DeleteRoleMenuResponse(command.FgRole, command.CdMenu, "Role menu unassigned successfully.");
    }
}
