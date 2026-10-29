using Enotes.Application.Common;
using MediatR;

namespace Enotes.Application.Features.Company.GetCompanies;

public sealed class GetCompaniesHandler(
    ICompanyRepository companyRepository)
    : IRequestHandler<GetCompaniesQuery, IEnumerable<CompanyDto>>
{
    public async Task<IEnumerable<CompanyDto>> Handle(
        GetCompaniesQuery query,
        CancellationToken cancellationToken)
    {
        var companies = await companyRepository.GetAllAsync(
            query.SearchTerm,
            cancellationToken);

        return companies.Select(c => new CompanyDto(
            c.CdCompany,
            c.NmCompany,
            c.NmShort,
            c.DcImageUrl,
            c.DcAddress1,
            c.DcAddress2,
            c.DcCity,
            c.DcState,
            c.DcPostalCode,
            c.DcCountry,
            c.NoPhone,
            c.NoFax,
            c.DcEmail,
            c.DcWebsite,
            c.NoTaxId,
            c.NoRegNo,
            c.FlActive,
            c.TmReg,
            c.TmAmd));
    }
}
