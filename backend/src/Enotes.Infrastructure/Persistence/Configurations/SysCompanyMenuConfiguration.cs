using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enotes.Infrastructure.Persistence.Configurations;

public sealed class SysCompanyMenuConfiguration : IEntityTypeConfiguration<SysCompanyMenu>
{
    public void Configure(EntityTypeBuilder<SysCompanyMenu> builder)
    {
        builder.ToTable("sys_companymenu", "public");

        builder.HasKey(x => new { x.CdCompany, x.CdMenu });

        builder.Property(x => x.CdCompany)
            .HasColumnName("cd_company")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CdMenu)
            .HasColumnName("cd_menu")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.TmReg)
            .HasColumnName("tm_reg")
            .HasDefaultValueSql("now()")
            .HasConversion(
                v => v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);
    }
}
