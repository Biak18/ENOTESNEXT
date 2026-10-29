using Enotes.Application.Common;
using Enotes.Domain.Common;
using MediatR;

namespace Enotes.Application.Features.Menu.DeleteMenu;

public sealed class DeleteMenuHandler(
    IMenuRepository menuRepository)
    : IRequestHandler<DeleteMenuCommand, DeleteMenuResponse>
{
    public async Task<DeleteMenuResponse> Handle(
        DeleteMenuCommand command,
        CancellationToken cancellationToken)
    {
        await menuRepository.DeleteAsync(command.CdMenu, cancellationToken);
        await menuRepository.SaveChangesAsync(cancellationToken);

        return new DeleteMenuResponse(command.CdMenu, "Menu deleted successfully.");
    }
}
