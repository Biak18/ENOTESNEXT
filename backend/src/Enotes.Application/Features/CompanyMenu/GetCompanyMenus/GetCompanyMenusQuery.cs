using MediatR;

namespace Enotes.Application.Features.CompanyMenu.GetCompanyMenus;

public sealed record GetCompanyMenusQuery(string CdCompany) : IRequest<IEnumerable<CompanyMenuDto>>;

public sealed record CompanyMenuDto(
    string CdCompany,
    string CdMenu,
    string? NmMenu,
    bool IsAssigned);
