using MediatR;

namespace Enotes.Application.Features.Company.GetCompanies;

public sealed record GetCompaniesQuery(string? SearchTerm) : IRequest<IEnumerable<CompanyDto>>;

public sealed record CompanyDto(
    string CdCompany,
    string NmCompany,
    string? NmShort,
    string? DcImageUrl,
    string? DcAddress1,
    string? DcAddress2,
    string? DcCity,
    string? DcState,
    string? DcPostalCode,
    string? DcCountry,
    string? NoPhone,
    string? NoFax,
    string? DcEmail,
    string? DcWebsite,
    string? NoTaxId,
    string? NoRegNo,
    bool FlActive,
    DateTime? TmReg,
    DateTime? TmAmd);
