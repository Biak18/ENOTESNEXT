using Enotes.Application.Common;
using MediatR;

namespace Enotes.Application.Features.CompanyMenu.GetCompanyMenus;

public sealed class GetCompanyMenusHandler(
    ICompanyMenuRepository companyMenuRepository)
    : IRequestHandler<GetCompanyMenusQuery, IEnumerable<CompanyMenuDto>>
{
    public async Task<IEnumerable<CompanyMenuDto>> Handle(
        GetCompanyMenusQuery query,
        CancellationToken cancellationToken)
    {
        var assignments = await companyMenuRepository.GetAllByCompanyAsync(
            query.CdCompany,
            cancellationToken);

        return assignments.Select(a => new CompanyMenuDto(
            a.CdCompany,
            a.CdMenu,
            a.NmMenu,
            a.IsAssigned));
    }
}
