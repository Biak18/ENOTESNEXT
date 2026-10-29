using Enotes.Domain.Entities;

namespace Enotes.Application.Common;

public interface ICompanyRepository
{
    Task<IEnumerable<MasCompany>> GetAllAsync(string? searchTerm, CancellationToken cancellationToken = default);

    Task<MasCompany?> GetByIdAsync(string cdCompany, CancellationToken cancellationToken = default);

    Task AddAsync(MasCompany company, CancellationToken cancellationToken = default);

    void Update(MasCompany company);

    Task DeleteAsync(string cdCompany, CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
