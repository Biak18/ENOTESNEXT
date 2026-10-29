using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enotes.Infrastructure.Persistence.Configurations;

public sealed class SysRoleMenuConfiguration : IEntityTypeConfiguration<SysRoleMenu>
{
    public void Configure(EntityTypeBuilder<SysRoleMenu> builder)
    {
        builder.ToTable("sys_rolemenu", "public");

        builder.HasKey(x => new { x.FgRole, x.CdMenu });

        builder.Property(x => x.FgRole)
            .HasColumnName("fg_role")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CdMenu)
            .HasColumnName("cd_menu")
            .HasMaxLength(50)
            .IsRequired();
    }
}
