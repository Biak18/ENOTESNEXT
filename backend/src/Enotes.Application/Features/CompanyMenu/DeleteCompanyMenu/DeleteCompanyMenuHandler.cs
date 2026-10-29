using Enotes.Application.Common;
using Enotes.Domain.Common;
using MediatR;

namespace Enotes.Application.Features.CompanyMenu.DeleteCompanyMenu;

public sealed class DeleteCompanyMenuHandler(
    ICompanyMenuRepository companyMenuRepository)
    : IRequestHandler<DeleteCompanyMenuCommand, DeleteCompanyMenuResponse>
{
    public async Task<DeleteCompanyMenuResponse> Handle(
        DeleteCompanyMenuCommand command,
        CancellationToken cancellationToken)
    {
        // Unassign single menu from company
        await companyMenuRepository.DeleteAsync(command.CdCompany, command.CdMenu, cancellationToken);
        await companyMenuRepository.SaveChangesAsync(cancellationToken);

        return new DeleteCompanyMenuResponse(command.CdCompany, command.CdMenu, "Company menu unassigned successfully.");
    }
}
