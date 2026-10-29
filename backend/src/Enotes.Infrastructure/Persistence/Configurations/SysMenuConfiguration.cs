using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enotes.Infrastructure.Persistence.Configurations;

public sealed class SysMenuConfiguration : IEntityTypeConfiguration<SysMenu>
{
    public void Configure(EntityTypeBuilder<SysMenu> builder)
    {
        builder.ToTable("sys_menu", "public");

        builder.HasKey(x => x.CdMenu);

        builder.Property(x => x.CdMenu)
            .HasColumnName("cd_menu")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.NmMenu)
            .HasColumnName("nm_menu")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.NmNetwindow)
            .HasColumnName("nm_netwindow")
            .HasMaxLength(200);

        builder.Property(x => x.FgType)
            .HasColumnName("fg_type")
            .HasMaxLength(1);

        builder.Property(x => x.CdModule)
            .HasColumnName("cd_module")
            .HasMaxLength(50);

        builder.Property(x => x.NoPos)
            .HasColumnName("no_pos")
            .HasMaxLength(50);

        builder.Property(x => x.CdMenuParent)
            .HasColumnName("cd_menu_parent")
            .HasMaxLength(50);
    }
}
