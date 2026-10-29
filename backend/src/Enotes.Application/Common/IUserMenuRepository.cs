using Enotes.Domain.Entities;
using System.Collections.Generic;

namespace Enotes.Application.Common;

public interface IUserMenuRepository
{
    Task<IEnumerable<UserMenuAssignmentDto>> GetAllAsync(
        string cdCompany,
        string? cdUser,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        string cdCompany,
        string cdUser,
        string cdMenu,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        string cdCompany,
        string cdUser,
        string cdMenu,
        string fgAction,
        CancellationToken cancellationToken = default);

    Task UpdateActionAsync(
        string cdCompany,
        string cdUser,
        string cdMenu,
        string fgAction,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        string cdCompany,
        string cdUser,
        string cdMenu,
        CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed record UserMenuAssignmentDto(
    string CdCompany,
    string CdUser,
    string CdMenu,
    string? NmMenu,
    string? FgAction);
