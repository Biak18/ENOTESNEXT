using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enotes.Infrastructure.Persistence.Configurations;

public sealed class MasItemConfiguration : IEntityTypeConfiguration<MasItem>
{
    public void Configure(EntityTypeBuilder<MasItem> builder)
    {
        builder.ToTable("mas_item", "public");
        builder.HasKey(item => new { item.CdCompany, item.CdItem });

        builder.Property(item => item.CdCompany)
            .HasColumnName("cd_company")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(item => item.CdItem)
            .HasColumnName("cd_item")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(item => item.NmItem)
            .HasColumnName("nm_item")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(item => item.FgType)
            .HasColumnName("fg_type")
            .HasDefaultValue((short)10)
            .IsRequired();

        builder.Property(item => item.CdCategory)
            .HasColumnName("cd_category")
            .HasMaxLength(30);

        builder.Property(item => item.CdUom)
            .HasColumnName("cd_uom")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(item => item.PrPx)
            .HasColumnName("pr_px")
            .HasPrecision(18, 6);

        builder.Property(item => item.AmCost)
            .HasColumnName("am_cost")
            .HasPrecision(18, 6)
            .ValueGeneratedOnAddOrUpdate();

        builder.Property(item => item.FlLot)
            .HasColumnName("fl_lot")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(item => item.FlActive)
            .HasColumnName("fl_active")
            .HasDefaultValue(true)
            .IsRequired();

        builder.HasOne<MasCompany>()
            .WithMany()
            .HasForeignKey(item => item.CdCompany)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<MasUom>()
            .WithMany()
            .HasForeignKey(item => item.CdUom)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
