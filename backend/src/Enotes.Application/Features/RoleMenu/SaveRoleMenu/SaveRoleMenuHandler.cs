using Enotes.Application.Common;
using Enotes.Domain.Common;
using Enotes.Domain.Entities;
using MediatR;

namespace Enotes.Application.Features.RoleMenu.SaveRoleMenu;

public sealed class SaveRoleMenuHandler(
    IRoleMenuRepository roleMenuRepository)
    : IRequestHandler<SaveRoleMenuCommand, SaveRoleMenuResponse>
{
    public async Task<SaveRoleMenuResponse> Handle(
        SaveRoleMenuCommand command,
        CancellationToken cancellationToken)
    {
        var savedCount = 0;

        foreach (var item in command.Items)
        {
            if (item.IsAssigned)
            {
                var existing = await roleMenuRepository.ExistsAsync(
                    item.FgRole,
                    item.CdMenu,
                    cancellationToken);

                if (!existing)
                {
                    var roleMenu = SysRoleMenu.Create(item.FgRole, item.CdMenu);
                    await roleMenuRepository.AddAsync(roleMenu, cancellationToken);
                    savedCount++;
                }
            }
            else
            {
                var existing = await roleMenuRepository.ExistsAsync(
                    item.FgRole,
                    item.CdMenu,
                    cancellationToken);

                if (existing)
                {
                    await roleMenuRepository.DeleteAsync(item.FgRole, item.CdMenu, cancellationToken);
                    savedCount++;
                }
            }
        }

        await roleMenuRepository.SaveChangesAsync(cancellationToken);

        return new SaveRoleMenuResponse(savedCount);
    }
}
