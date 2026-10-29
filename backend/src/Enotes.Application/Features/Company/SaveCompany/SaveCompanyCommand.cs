using MediatR;

namespace Enotes.Application.Features.Company.SaveCompany;

public sealed record SaveCompanyCommand(
    List<CompanyItemDto> Items) : IRequest<SaveCompanyResponse>;

public sealed record CompanyItemDto(
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
    string? State);

public sealed record SaveCompanyResponse(
    int SavedCount);
