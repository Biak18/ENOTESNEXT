using Enotes.Application.Common;
using Enotes.Domain.Common;
using Enotes.Domain.Entities;
using MediatR;

namespace Enotes.Application.Features.UserMenu.SaveUserMenu;

public sealed class SaveUserMenuHandler(
    IUserMenuRepository userMenuRepository)
    : IRequestHandler<SaveUserMenuCommand, SaveUserMenuResponse>
{
    public async Task<SaveUserMenuResponse> Handle(
        SaveUserMenuCommand command,
        CancellationToken cancellationToken)
    {
        var savedCount = 0;

        foreach (var item in command.Items)
        {
            var existing = await userMenuRepository.ExistsAsync(
                command.CdCompany,
                item.CdUser,
                item.CdMenu,
                cancellationToken);

            if (string.IsNullOrWhiteSpace(item.FgAction))
            {
                // Remove override
                if (existing)
                {
                    await userMenuRepository.DeleteAsync(
                        command.CdCompany,
                        item.CdUser,
                        item.CdMenu,
                        cancellationToken);
                    savedCount++;
                }
            }
            else
            {
                if (existing)
                {
                    await userMenuRepository.UpdateActionAsync(
                        command.CdCompany,
                        item.CdUser,
                        item.CdMenu,
                        item.FgAction,
                        cancellationToken);
                }
                else
                {
                    await userMenuRepository.AddAsync(
                        command.CdCompany,
                        item.CdUser,
                        item.CdMenu,
                        item.FgAction,
                        cancellationToken);
                }
                savedCount++;
            }
        }

        await userMenuRepository.SaveChangesAsync(cancellationToken);

        return new SaveUserMenuResponse(savedCount);
    }
}
