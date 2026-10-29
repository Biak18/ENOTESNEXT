using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enotes.Infrastructure.Persistence.Configurations;

public sealed class MasCompanyConfiguration : IEntityTypeConfiguration<MasCompany>
{
    public void Configure(EntityTypeBuilder<MasCompany> builder)
    {
        builder.ToTable("mas_company", "public");

        builder.HasKey(x => x.CdCompany);

        builder.Property(x => x.CdCompany)
            .HasColumnName("cd_company")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.NmCompany)
            .HasColumnName("nm_company")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.NmShort)
            .HasColumnName("nm_short")
            .HasMaxLength(100);

        builder.Property(x => x.DcImageUrl)
            .HasColumnName("dc_image_url")
            .HasColumnType("text");

        builder.Property(x => x.DcAddress1)
            .HasColumnName("dc_address1")
            .HasMaxLength(200);

        builder.Property(x => x.DcAddress2)
            .HasColumnName("dc_address2")
            .HasMaxLength(200);

        builder.Property(x => x.DcCity)
            .HasColumnName("dc_city")
            .HasMaxLength(100);

        builder.Property(x => x.DcState)
            .HasColumnName("dc_state")
            .HasMaxLength(100);

        builder.Property(x => x.DcPostalCode)
            .HasColumnName("dc_postal_code")
            .HasMaxLength(20);

        builder.Property(x => x.DcCountry)
            .HasColumnName("dc_country")
            .HasMaxLength(100);

        builder.Property(x => x.NoPhone)
            .HasColumnName("no_phone")
            .HasMaxLength(50);

        builder.Property(x => x.NoFax)
            .HasColumnName("no_fax")
            .HasMaxLength(50);

        builder.Property(x => x.DcEmail)
            .HasColumnName("dc_email")
            .HasMaxLength(200);

        builder.Property(x => x.DcWebsite)
            .HasColumnName("dc_website")
            .HasMaxLength(200);

        builder.Property(x => x.NoTaxId)
            .HasColumnName("no_tax_id")
            .HasMaxLength(50);

        builder.Property(x => x.NoRegNo)
            .HasColumnName("no_reg_no")
            .HasMaxLength(50);

        builder.Property(x => x.TmReg)
            .HasColumnName("tm_reg")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .HasConversion(
                v => v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        builder.Property(x => x.TmAmd)
            .HasColumnName("tm_amd")
            .HasConversion(
                v => v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        builder.Property(x => x.FlActive)
            .HasColumnName("fl_active")
            .HasDefaultValue(true);
    }
}
