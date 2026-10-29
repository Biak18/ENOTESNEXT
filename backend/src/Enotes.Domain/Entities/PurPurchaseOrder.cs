using Enotes.Domain.Common;

namespace Enotes.Domain.Entities;

public sealed class PurPurchaseOrder
{
    private readonly List<PurPurchaseOrderLine> _lines = [];

    public string CdCompany { get; private set; } = string.Empty;
    public string CdOrder { get; private set; } = string.Empty;
    public string NmSupplier { get; private set; } = string.Empty;
    public DateOnly DtOrder { get; private set; }
    public DateOnly? DtExpected { get; private set; }
    public string CdCurrency { get; private set; } = "USD";
    public string? DcReference { get; private set; }
    public string? DcNotes { get; private set; }
    public DateTime TmReg { get; private set; }
    public DateTime? TmAmd { get; private set; }
    public IReadOnlyCollection<PurPurchaseOrderLine> Lines => _lines;

    private PurPurchaseOrder() { }

    public static PurPurchaseOrder Create(
        string cdCompany,
        string cdOrder,
        string nmSupplier,
        DateOnly dtOrder,
        DateOnly? dtExpected,
        string cdCurrency,
        string? dcReference,
        string? dcNotes,
        IEnumerable<PurPurchaseOrderLineInput> lines)
    {
        var order = new PurPurchaseOrder { CdCompany = cdCompany.Trim(), CdOrder = cdOrder.Trim() };
        order.Update(nmSupplier, dtOrder, dtExpected, cdCurrency, dcReference, dcNotes, lines);
        order.TmReg = DateTime.UtcNow;
        return order;
    }

    public void Update(
        string nmSupplier,
        DateOnly dtOrder,
        DateOnly? dtExpected,
        string cdCurrency,
        string? dcReference,
        string? dcNotes,
        IEnumerable<PurPurchaseOrderLineInput> lines)
    {
        if (string.IsNullOrWhiteSpace(CdCompany))
            throw new DomainException("Company is required.");
        if (string.IsNullOrWhiteSpace(CdOrder))
            throw new DomainException("Purchase order number is required.");
        if (string.IsNullOrWhiteSpace(nmSupplier))
            throw new DomainException("Supplier is required.");
        if (string.IsNullOrWhiteSpace(cdCurrency))
            throw new DomainException("Currency is required.");
        if (dtExpected.HasValue && dtExpected.Value < dtOrder)
            throw new DomainException("Expected date cannot be earlier than the order date.");

        var inputs = lines.ToList();
        if (inputs.Count == 0)
            throw new DomainException("At least one purchase line is required.");

        NmSupplier = nmSupplier.Trim();
        DtOrder = dtOrder;
        DtExpected = dtExpected;
        CdCurrency = cdCurrency.Trim().ToUpperInvariant();
        DcReference = string.IsNullOrWhiteSpace(dcReference) ? null : dcReference.Trim();
        DcNotes = string.IsNullOrWhiteSpace(dcNotes) ? null : dcNotes.Trim();
        for (var i = 0; i < inputs.Count; i++)
        {
            var noLine = i + 1;
            var existing = _lines.FirstOrDefault(line => line.NoLine == noLine);
            if (existing is null)
                _lines.Add(PurPurchaseOrderLine.Create(CdCompany, CdOrder, noLine, inputs[i]));
            else
                existing.Update(inputs[i]);
        }
        _lines.RemoveAll(line => line.NoLine > inputs.Count);
        TmAmd = DateTime.UtcNow;
    }
}

public sealed record PurPurchaseOrderLineInput(
    string ItemCode,
    string Description,
    string Category,
    string Location,
    string Unit,
    decimal Quantity,
    decimal UnitPrice);
