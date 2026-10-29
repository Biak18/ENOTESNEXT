using Enotes.Application.Common;
using Enotes.Domain.Common;
using Enotes.Domain.Entities;
using MediatR;

namespace Enotes.Application.Features.Menu.UpdateMenu;

public sealed class UpdateMenuHandler(
    IMenuRepository menuRepository)
    : IRequestHandler<UpdateMenuCommand, UpdateMenuResponse>
{
    public async Task<UpdateMenuResponse> Handle(
        UpdateMenuCommand command,
        CancellationToken cancellationToken)
    {
        var existing = await menuRepository.GetByIdAsync(command.CdMenu, cancellationToken)
            ?? throw new DomainException($"Menu not found: {command.CdMenu}");

        existing.Update(
            command.NmMenu,
            command.NmNetwindow,
            command.FgType,
            command.CdModule,
            command.NoPos,
            command.CdMenuParent);

        menuRepository.Update(existing);
        await menuRepository.SaveChangesAsync(cancellationToken);

        return new UpdateMenuResponse(command.CdMenu, "Menu updated successfully.");
    }
}
