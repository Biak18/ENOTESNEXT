using MediatR;

namespace Enotes.Application.Features.Company.UpdateCompany;

public sealed record UpdateCompanyCommand(
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
    bool FlActive) : IRequest<UpdateCompanyResponse>;

public sealed record UpdateCompanyResponse(
    string CdCompany,
    string Message);
