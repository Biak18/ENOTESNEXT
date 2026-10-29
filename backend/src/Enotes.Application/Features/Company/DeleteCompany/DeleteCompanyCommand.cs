using MediatR;

namespace Enotes.Application.Features.Company.DeleteCompany;

public sealed record DeleteCompanyCommand(string CdCompany) : IRequest<DeleteCompanyResponse>;

public sealed record DeleteCompanyResponse(string CdCompany, string Message);
