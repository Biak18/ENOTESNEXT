using Enotes.Application.Common;
using Enotes.Domain.Common;
using MediatR;

namespace Enotes.Application.Features.Company.DeleteCompany;

public sealed class DeleteCompanyHandler(
    ICompanyRepository companyRepository)
    : IRequestHandler<DeleteCompanyCommand, DeleteCompanyResponse>
{
    public async Task<DeleteCompanyResponse> Handle(
        DeleteCompanyCommand command,
        CancellationToken cancellationToken)
    {
        await companyRepository.DeleteAsync(command.CdCompany, cancellationToken);
        await companyRepository.SaveChangesAsync(cancellationToken);

        return new DeleteCompanyResponse(command.CdCompany, "Company deleted successfully.");
    }
}
