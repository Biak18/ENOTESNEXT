using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enotes.Infrastructure.Persistence.Configurations;

public sealed class SysUserConfiguration : IEntityTypeConfiguration<SysUser>
{
    public void Configure(EntityTypeBuilder<SysUser> builder)
    {
        builder.ToTable("sys_user", "public");

        builder.HasKey(x => new { x.CdCom, x.CdUser });

        builder.Property(x => x.CdCom)
            .HasColumnName("cd_com")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CdUser)
            .HasColumnName("cd_user")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.DcPassword)
            .HasColumnName("dc_password")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(x => x.NmUser)
            .HasColumnName("nm_user")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.DtReg)
            .HasColumnName("dt_reg")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.DcEmail)
            .HasColumnName("dc_email")
            .HasMaxLength(200);

        builder.Property(x => x.DcAddress1)
            .HasColumnName("dc_address1")
            .HasMaxLength(200);

        builder.Property(x => x.DcAddress2)
            .HasColumnName("dc_address2")
            .HasMaxLength(200);

        builder.Property(x => x.NoTel)
            .HasColumnName("no_tel")
            .HasMaxLength(50);

        builder.Property(x => x.YnActive)
            .HasColumnName("yn_active")
            .HasMaxLength(1)
            .HasDefaultValue("Y")
            .IsRequired();

        builder.Property(x => x.FgRole)
            .HasColumnName("fg_role")
            .HasMaxLength(50);

        builder.Property(x => x.TmReg)
            .HasColumnName("tm_reg")
            .HasConversion(
                v => v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        builder.Property(x => x.CdUserReg)
            .HasColumnName("cd_user_reg")
            .HasMaxLength(50);

        builder.Property(x => x.TmAmd)
            .HasColumnName("tm_amd")
            .HasConversion(
                v => v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        builder.Property(x => x.CdUserAmd)
            .HasColumnName("cd_user_amd")
            .HasMaxLength(50);
    }
}
