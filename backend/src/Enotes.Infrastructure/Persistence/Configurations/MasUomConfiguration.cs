using Enotes.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enotes.Infrastructure.Persistence.Configurations;

public sealed class MasUomConfiguration : IEntityTypeConfiguration<MasUom>
{
    public void Configure(EntityTypeBuilder<MasUom> builder)
    {
        builder.ToTable("mas_uom", "public");
        builder.HasKey(unit => unit.CdUom);

        builder.Property(unit => unit.CdUom)
            .HasColumnName("cd_uom")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(unit => unit.FlActive)
            .HasColumnName("fl_active")
            .HasDefaultValue(true)
            .IsRequired();
    }
}
