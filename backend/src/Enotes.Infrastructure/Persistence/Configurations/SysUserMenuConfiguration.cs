using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enotes.Infrastructure.Persistence.Configurations;

public sealed class SysUserMenuConfiguration : IEntityTypeConfiguration<SysUserMenu>
{
    public void Configure(EntityTypeBuilder<SysUserMenu> builder)
    {
        builder.ToTable("sys_usermenu", "public");

        builder.HasKey(x => new { x.CdCompany, x.CdUser, x.CdMenu });

        builder.Property(x => x.CdCompany)
            .HasColumnName("cd_company")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CdUser)
            .HasColumnName("cd_user")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CdMenu)
            .HasColumnName("cd_menu")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.FgAction)
            .HasColumnName("fg_action")
            .HasMaxLength(1)
            .HasDefaultValue("A")
            .IsRequired();

        builder.Property(x => x.TmReg)
            .HasColumnName("tm_reg")
            .HasDefaultValueSql("now()")
            .HasConversion(
                v => v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);
    }
}
