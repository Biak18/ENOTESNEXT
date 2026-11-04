using Enotes.Domain.Common;

namespace Enotes.Domain.Entities;

public sealed class MasItem
{
    public string CdCompany { get; private set; } = string.Empty;
    public string CdItem { get; private set; } = string.Empty;
    public string NmItem { get; private set; } = string.Empty;
    public short FgType { get; private set; }
    public string? CdCategory { get; private set; }
    public string CdUom { get; private set; } = string.Empty;
    public decimal? PrPx { get; private set; }
    public decimal? AmCost { get; private set; }
    public bool FlLot { get; private set; }
    public bool FlActive { get; private set; } = true;

    private MasItem() { }

    public static MasItem Create(
        string cdCompany,
        string cdItem,
        string nmItem,
        short fgType,
        string? cdCategory,
        string cdUom,
        decimal? prPx,
        bool flLot,
        bool flActive)
    {
        ValidateItem(cdItem, nmItem, fgType, cdUom, prPx);

        if (string.IsNullOrWhiteSpace(cdCompany))
            throw new DomainException("Company code is required.");

        if (cdCompany.Trim().Length > 10)
            throw new DomainException("Company code cannot exceed 10 characters.");

        return new MasItem
        {
            CdCompany = cdCompany.Trim(),
            CdItem = cdItem.Trim(),
            NmItem = nmItem.Trim(),
            FgType = fgType,
            CdCategory = NormalizeCategory(cdCategory),
            CdUom = cdUom.Trim(),
            PrPx = prPx,
            FlLot = flLot,
            FlActive = flActive
        };
    }

    public void Update(
        string nmItem,
        short fgType,
        string? cdCategory,
        string cdUom,
        decimal? prPx,
        bool flLot,
        bool flActive)
    {
        ValidateItem(CdItem, nmItem, fgType, cdUom, prPx);

        NmItem = nmItem.Trim();
        FgType = fgType;
        CdCategory = NormalizeCategory(cdCategory);
        CdUom = cdUom.Trim();
        PrPx = prPx;
        FlLot = flLot;
        FlActive = flActive;
    }

    private static void ValidateItem(
        string cdItem,
        string nmItem,
        short fgType,
        string cdUom,
        decimal? prPx)
    {
        if (string.IsNullOrWhiteSpace(cdItem))
            throw new DomainException("Item code is required.");
        if (cdItem.Trim().Length > 30)
            throw new DomainException("Item code cannot exceed 30 characters.");
        if (string.IsNullOrWhiteSpace(nmItem))
            throw new DomainException("Item name is required.");
        if (nmItem.Trim().Length > 200)
            throw new DomainException("Item name cannot exceed 200 characters.");
        if (fgType is not (10 or 20 or 30))
            throw new DomainException("Item type must be 10, 20, or 30.");
        if (string.IsNullOrWhiteSpace(cdUom))
            throw new DomainException("Unit of measure is required.");
        if (cdUom.Trim().Length > 10)
            throw new DomainException("Unit of measure code cannot exceed 10 characters.");
        if (prPx is < 0 or > 999_999_999_999.999999m ||
            prPx.HasValue && prPx.Value % 0.000001m != 0)
        {
            throw new DomainException(
                "Price must be non-negative and have no more than 6 decimal places.");
        }
    }

    private static string? NormalizeCategory(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var category = value.Trim();
        if (category.Length > 30)
            throw new DomainException("Category cannot exceed 30 characters.");
        return category;
    }
}
