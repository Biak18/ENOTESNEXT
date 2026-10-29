using Enotes.Application.Common;
using Enotes.Domain.Common;
using Enotes.Domain.Entities;
using MediatR;

namespace Enotes.Application.Features.Company.SaveCompany;

public sealed class SaveCompanyHandler(
    ICompanyRepository companyRepository)
    : IRequestHandler<SaveCompanyCommand, SaveCompanyResponse>
{
    public async Task<SaveCompanyResponse> Handle(
        SaveCompanyCommand command,
        CancellationToken cancellationToken)
    {
        var savedCount = 0;

        foreach (var item in command.Items)
        {
            switch (item.State?.ToUpperInvariant())
            {
                case "ADDED":
                case "INSERT":
                case "I":
                {
                    var company = MasCompany.Create(
                        item.CdCompany,
                        item.NmCompany,
                        item.NmShort);

                    company.Update(
                        item.NmCompany,
                        item.NmShort,
                        item.DcImageUrl,
                        item.DcAddress1,
                        item.DcAddress2,
                        item.DcCity,
                        item.DcState,
                        item.DcPostalCode,
                        item.DcCountry,
                        item.NoPhone,
                        item.NoFax,
                        item.DcEmail,
                        item.DcWebsite,
                        item.NoTaxId,
                        item.NoRegNo,
                        item.FlActive);

                    await companyRepository.AddAsync(company, cancellationToken);
                    savedCount++;
                    break;
                }

                case "MODIFIED":
                case "UPDATE":
                case "U":
                {
                    var existing = await companyRepository.GetByIdAsync(
                        item.CdCompany,
                        cancellationToken)
                        ?? throw new DomainException($"Company not found: {item.CdCompany}");

                    existing.Update(
                        item.NmCompany,
                        item.NmShort,
                        item.DcImageUrl,
                        item.DcAddress1,
                        item.DcAddress2,
                        item.DcCity,
                        item.DcState,
                        item.DcPostalCode,
                        item.DcCountry,
                        item.NoPhone,
                        item.NoFax,
                        item.DcEmail,
                        item.DcWebsite,
                        item.NoTaxId,
                        item.NoRegNo,
                        item.FlActive);

                    companyRepository.Update(existing);
                    savedCount++;
                    break;
                }

                case "DELETED":
                case "DELETE":
                case "D":
                {
                    await companyRepository.DeleteAsync(item.CdCompany, cancellationToken);
                    savedCount++;
                    break;
                }
            }
        }

        await companyRepository.SaveChangesAsync(cancellationToken);

        return new SaveCompanyResponse(savedCount);
    }
}
