using FluentValidation;

namespace Enotes.Application.Features.PurchaseOrder.SavePurchaseOrder;

public sealed class SavePurchaseOrderValidator : AbstractValidator<SavePurchaseOrderCommand>
{
    public SavePurchaseOrderValidator()
    {
        RuleFor(x => x.CdCompany).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CdOrder).NotEmpty().MaximumLength(50);
        RuleFor(x => x.NmSupplier).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DtOrder).NotEmpty();
        RuleFor(x => x.DtExpected)
            .Must((command, expected) => !expected.HasValue || expected.Value >= command.DtOrder)
            .WithMessage("Expected date cannot be earlier than the order date.");
        RuleFor(x => x.CdCurrency).NotEmpty().Length(3);
        RuleFor(x => x.DcReference).MaximumLength(200);
        RuleFor(x => x.Lines).NotEmpty().Must(lines => lines.Count <= 1000)
            .WithMessage("A purchase order must contain between 1 and 1,000 lines.");
        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(x => x.CdItem).NotEmpty().MaximumLength(50);
            line.RuleFor(x => x.NmItem).NotEmpty().MaximumLength(200);
            line.RuleFor(x => x.CdCategory).NotEmpty().MaximumLength(100);
            line.RuleFor(x => x.CdLocation).NotEmpty().MaximumLength(100);
            line.RuleFor(x => x.NmUnit).NotEmpty().MaximumLength(50);
            line.RuleFor(x => x.QtOrder).GreaterThan(0).LessThanOrEqualTo(1_000_000m);
            line.RuleFor(x => x.AmUnitPrice).GreaterThanOrEqualTo(0).LessThanOrEqualTo(1_000_000_000m);
        });
    }
}
