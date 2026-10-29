using Enotes.Application.Common;
using Enotes.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Enotes.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "Connection string 'DefaultConnection' not found.");

            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null);
            });
        });

        services.AddScoped<IUserRepository, EfUserRepository>();
        services.AddScoped<IMenuRepository, EfMenuRepository>();
        services.AddScoped<ICompanyRepository, EfCompanyRepository>();
        services.AddScoped<ICompanyMenuRepository, EfCompanyMenuRepository>();
        services.AddScoped<IRoleMenuRepository, EfRoleMenuRepository>();
        services.AddScoped<IUserMenuRepository, EfUserMenuRepository>();
        services.AddScoped<IPurchaseOrderRepository, EfPurchaseOrderRepository>();

        return services;
    }
}
