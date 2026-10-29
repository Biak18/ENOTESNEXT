using MediatR;

namespace Enotes.Application.Features.CompanyMenu.DeleteCompanyMenu;

public sealed record DeleteCompanyMenuCommand(string CdCompany, string CdMenu) : IRequest<DeleteCompanyMenuResponse>;

public sealed record DeleteCompanyMenuResponse(string CdCompany, string CdMenu, string Message);
