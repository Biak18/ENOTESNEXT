using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enotes.Infrastructure.Persistence.Configurations;

public sealed class PurPurchaseOrderLineConfiguration : IEntityTypeConfiguration<PurPurchaseOrderLine>
{
    public void Configure(EntityTypeBuilder<PurPurchaseOrderLine> builder)
    {
        builder.ToTable("pur_purchase_order_line", "public");
        builder.HasKey(x => new { x.CdCompany, x.CdOrder, x.NoLine });

        builder.Property(x => x.CdCompany).HasColumnName("cd_company").HasMaxLength(50).IsRequired();
        builder.Property(x => x.CdOrder).HasColumnName("cd_order").HasMaxLength(50).IsRequired();
        builder.Property(x => x.NoLine).HasColumnName("no_line").IsRequired();
        builder.Property(x => x.CdItem).HasColumnName("cd_item").HasMaxLength(50).IsRequired();
        builder.Property(x => x.NmItem).HasColumnName("nm_item").HasMaxLength(200).IsRequired();
        builder.Property(x => x.CdCategory).HasColumnName("cd_category").HasMaxLength(100).IsRequired();
        builder.Property(x => x.CdLocation).HasColumnName("cd_location").HasMaxLength(100).IsRequired();
        builder.Property(x => x.NmUnit).HasColumnName("nm_unit").HasMaxLength(50).IsRequired();
        builder.Property(x => x.QtOrder).HasColumnName("qt_order").HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.AmUnitPrice).HasColumnName("am_unit_price").HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.AmLine).HasColumnName("am_line").HasPrecision(18, 2).IsRequired();
    }
}
