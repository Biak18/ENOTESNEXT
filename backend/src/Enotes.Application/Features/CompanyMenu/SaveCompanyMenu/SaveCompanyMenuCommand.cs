using MediatR;

namespace Enotes.Application.Features.CompanyMenu.SaveCompanyMenu;

public sealed record SaveCompanyMenuCommand(
    string CdCompany,
    List<CompanyMenuItemDto> Items) : IRequest<SaveCompanyMenuResponse>;

public sealed record CompanyMenuItemDto(
    string CdMenu,
    bool IsAssigned);

public sealed record SaveCompanyMenuResponse(
    int SavedCount);
