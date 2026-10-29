using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Enotes.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<MasCompany> Companies { get; set; }
    public DbSet<SysMenu> Menus { get; set; }
    public DbSet<SysUser> Users { get; set; }
    public DbSet<SysRoleMenu> RoleMenus { get; set; }
    public DbSet<SysUserMenu> UserMenus { get; set; }
    public DbSet<SysCompanyMenu> CompanyMenus { get; set; }
    public DbSet<PurPurchaseOrder> PurchaseOrders { get; set; }

    public override Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(AppDbContext).Assembly);
    }
}
