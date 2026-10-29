using Enotes.Application.Common;
using Enotes.Domain.Common;
using MediatR;

namespace Enotes.Application.Features.CompanyMenu.SaveCompanyMenu;

public sealed class SaveCompanyMenuHandler(
    ICompanyMenuRepository companyMenuRepository)
    : IRequestHandler<SaveCompanyMenuCommand, SaveCompanyMenuResponse>
{
    public async Task<SaveCompanyMenuResponse> Handle(
        SaveCompanyMenuCommand command,
        CancellationToken cancellationToken)
    {
        // First, unassign all menus for this company
        await companyMenuRepository.UnassignAllAsync(command.CdCompany, cancellationToken);

        var savedCount = 0;

        // Then assign only the menus marked as assigned
        foreach (var item in command.Items.Where(x => x.IsAssigned))
        {
            await companyMenuRepository.AssignAsync(
                command.CdCompany,
                item.CdMenu,
                cancellationToken);
            savedCount++;
        }

        await companyMenuRepository.SaveChangesAsync(cancellationToken);

        return new SaveCompanyMenuResponse(savedCount);
    }
}
