using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enotes.Infrastructure.Persistence.Configurations;

public sealed class PurPurchaseOrderConfiguration : IEntityTypeConfiguration<PurPurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurPurchaseOrder> builder)
    {
        builder.ToTable("pur_purchase_order", "public");
        builder.HasKey(x => new { x.CdCompany, x.CdOrder });

        builder.Property(x => x.CdCompany).HasColumnName("cd_company").HasMaxLength(50).IsRequired();
        builder.Property(x => x.CdOrder).HasColumnName("cd_order").HasMaxLength(50).IsRequired();
        builder.Property(x => x.NmSupplier).HasColumnName("nm_supplier").HasMaxLength(200).IsRequired();
        builder.Property(x => x.DtOrder).HasColumnName("dt_order").HasColumnType("date").IsRequired();
        builder.Property(x => x.DtExpected).HasColumnName("dt_expected").HasColumnType("date");
        builder.Property(x => x.CdCurrency).HasColumnName("cd_currency").HasMaxLength(3).IsRequired();
        builder.Property(x => x.DcReference).HasColumnName("dc_reference").HasMaxLength(200);
        builder.Property(x => x.DcNotes).HasColumnName("dc_notes").HasColumnType("text");
        builder.Property(x => x.TmReg).HasColumnName("tm_reg").HasDefaultValueSql("CURRENT_TIMESTAMP")
            .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        builder.Property(x => x.TmAmd).HasColumnName("tm_amd")
            .HasConversion(v => v, v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        builder.HasMany(x => x.Lines)
            .WithOne()
            .HasForeignKey(x => new { x.CdCompany, x.CdOrder })
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(x => x.Lines).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
