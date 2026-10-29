using Enotes.Application.Common;
using Enotes.Domain.Common;
using MediatR;

namespace Enotes.Application.Features.Company.UpdateCompany;

public sealed class UpdateCompanyHandler(
    ICompanyRepository companyRepository)
    : IRequestHandler<UpdateCompanyCommand, UpdateCompanyResponse>
{
    public async Task<UpdateCompanyResponse> Handle(
        UpdateCompanyCommand command,
        CancellationToken cancellationToken)
    {
        var existing = await companyRepository.GetByIdAsync(command.CdCompany, cancellationToken)
            ?? throw new DomainException($"Company not found: {command.CdCompany}");

        existing.Update(
            command.NmCompany,
            command.NmShort,
            command.DcImageUrl,
            command.DcAddress1,
            command.DcAddress2,
            command.DcCity,
            command.DcState,
            command.DcPostalCode,
            command.DcCountry,
            command.NoPhone,
            command.NoFax,
            command.DcEmail,
            command.DcWebsite,
            command.NoTaxId,
            command.NoRegNo,
            command.FlActive);

        companyRepository.Update(existing);
        await companyRepository.SaveChangesAsync(cancellationToken);

        return new UpdateCompanyResponse(command.CdCompany, "Company updated successfully.");
    }
}
