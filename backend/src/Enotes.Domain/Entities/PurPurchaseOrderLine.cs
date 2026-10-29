using Enotes.Domain.Common;

namespace Enotes.Domain.Entities;

public sealed class PurPurchaseOrderLine
{
    public string CdCompany { get; private set; } = string.Empty;
    public string CdOrder { get; private set; } = string.Empty;
    public int NoLine { get; private set; }
    public string CdItem { get; private set; } = string.Empty;
    public string NmItem { get; private set; } = string.Empty;
    public string CdCategory { get; private set; } = string.Empty;
    public string CdLocation { get; private set; } = string.Empty;
    public string NmUnit { get; private set; } = string.Empty;
    public decimal QtOrder { get; private set; }
    public decimal AmUnitPrice { get; private set; }
    public decimal AmLine { get; private set; }

    private PurPurchaseOrderLine() { }

    internal static PurPurchaseOrderLine Create(
        string cdCompany,
        string cdOrder,
        int noLine,
        PurPurchaseOrderLineInput input)
    {
        var line = new PurPurchaseOrderLine
        {
            CdCompany = cdCompany,
            CdOrder = cdOrder,
            NoLine = noLine
        };
        line.Update(input);
        return line;
    }

    internal void Update(PurPurchaseOrderLineInput input)
    {
        if (string.IsNullOrWhiteSpace(input.ItemCode))
            throw new DomainException("Item code is required on every purchase line.");
        if (string.IsNullOrWhiteSpace(input.Description))
            throw new DomainException("Description is required on every purchase line.");
        if (string.IsNullOrWhiteSpace(input.Category))
            throw new DomainException("Category is required on every purchase line.");
        if (string.IsNullOrWhiteSpace(input.Location))
            throw new DomainException("Location is required on every purchase line.");
        if (string.IsNullOrWhiteSpace(input.Unit))
            throw new DomainException("Unit is required on every purchase line.");
        if (input.Quantity <= 0 || input.Quantity > 1_000_000m)
            throw new DomainException("Quantity must be greater than zero and not exceed 1,000,000.");
        if (input.UnitPrice < 0 || input.UnitPrice > 1_000_000_000m)
            throw new DomainException("Unit price must be non-negative and not exceed 1,000,000,000.");

        CdItem = input.ItemCode.Trim();
        NmItem = input.Description.Trim();
        CdCategory = input.Category.Trim();
        CdLocation = input.Location.Trim();
        NmUnit = input.Unit.Trim();
        QtOrder = input.Quantity;
        AmUnitPrice = input.UnitPrice;
        AmLine = decimal.Round(input.Quantity * input.UnitPrice, 2, MidpointRounding.AwayFromZero);
    }
}
