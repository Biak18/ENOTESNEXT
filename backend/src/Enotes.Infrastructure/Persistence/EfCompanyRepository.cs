using Enotes.Application.Common;
using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Enotes.Infrastructure.Persistence;

public sealed class EfCompanyRepository(AppDbContext dbContext) : ICompanyRepository
{
    public Task<IEnumerable<MasCompany>> GetAllAsync(string? searchTerm, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Companies.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(x => x.NmCompany.Contains(searchTerm) || x.CdCompany.Contains(searchTerm));
        }

        return query.ToListAsync(cancellationToken)
            .ContinueWith(t => (IEnumerable<MasCompany>)t.Result, cancellationToken);
    }

    public Task<MasCompany?> GetByIdAsync(string cdCompany, CancellationToken cancellationToken = default)
    {
        return dbContext.Companies.FirstOrDefaultAsync(x => x.CdCompany == cdCompany, cancellationToken);
    }

    public Task AddAsync(MasCompany company, CancellationToken cancellationToken = default)
    {
        dbContext.Companies.Add(company);
        return Task.CompletedTask;
    }

    public void Update(MasCompany company)
    {
        dbContext.Companies.Update(company);
    }

    public Task DeleteAsync(string cdCompany, CancellationToken cancellationToken = default)
    {
        var entity = dbContext.Companies.FirstOrDefault(x => x.CdCompany == cdCompany);
        if (entity is not null)
        {
            dbContext.Companies.Remove(entity);
        }
        return Task.CompletedTask;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
