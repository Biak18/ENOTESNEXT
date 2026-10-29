using Enotes.Domain.Entities;
using System.Collections.Generic;

namespace Enotes.Application.Common;

public interface ICompanyMenuRepository
{
    Task<IEnumerable<CompanyMenuAssignmentDto>> GetAllByCompanyAsync(
        string cdCompany,
        CancellationToken cancellationToken = default);

    Task UnassignAllAsync(
        string cdCompany,
        CancellationToken cancellationToken = default);

    Task AssignAsync(
        string cdCompany,
        string cdMenu,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        string cdCompany,
        string cdMenu,
        CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed record CompanyMenuAssignmentDto(
    string CdCompany,
    string CdMenu,
    string? NmMenu,
    bool IsAssigned);
