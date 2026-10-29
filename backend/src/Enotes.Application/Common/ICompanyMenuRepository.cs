using Enotes.Domain.Entities;
using System.Collections.Generic;

namespace Enotes.Application.Common;

/// <summary>
/// sys_companymenu is a presence-grant layer: a row means the company was
/// granted the menu, and a folder row grants its whole subtree (see
/// MenuSubtree). Folder cascading happens on write, so reads stay simple.
/// </summary>
public interface ICompanyMenuRepository
{
    Task<IEnumerable<CompanyMenuAssignmentDto>> GetAllByCompanyAsync(
        string cdCompany,
        CancellationToken cancellationToken = default);

    /// <summary>Codes currently granted to the company (DB rows only).</summary>
    Task<IReadOnlyCollection<string>> GetAssignedMenuCodesAsync(
        string cdCompany,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Tracks inserts for every code in cdMenus. The caller dedupes against
    /// the DB (GetAssignedMenuCodesAsync) and earlier items in the same save.
    /// Nothing is persisted until SaveChangesAsync.
    /// </summary>
    Task AddRangeAsync(
        string cdCompany,
        IEnumerable<string> cdMenus,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes granted rows for the given codes (existing DB rows, plus any
    /// rows added earlier in the same still-pending save) and returns how
    /// many were actually removed.
    /// </summary>
    Task<int> RemoveRangeAsync(
        string cdCompany,
        IEnumerable<string> cdMenus,
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
