using FluentValidation;

namespace Enotes.Application.Features.Item.SaveItems;

public sealed class SaveItemsValidator : AbstractValidator<SaveItemsCommand>
{
    public SaveItemsValidator()
    {
        RuleFor(command => command.CdCompany)
            .NotEmpty()
            .MaximumLength(10);

        RuleFor(command => command.Items)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .NotEmpty()
            .Must(items => items.Count <= 1000)
            .WithMessage("A save request can contain no more than 1,000 items.")
            .Must(items => items.Select(item => item.CdItem)
                .Distinct(StringComparer.Ordinal).Count() == items.Count)
            .WithMessage("An item code can appear only once in a save request.");

        RuleForEach(command => command.Items).ChildRules(item =>
        {
            item.RuleFor(row => row.CdItem)
                .NotEmpty()
                .MaximumLength(30);
            item.RuleFor(row => row.NmItem)
                .NotEmpty()
                .MaximumLength(200)
                .When(row => !IsDelete(row.State));
            item.RuleFor(row => row.FgType)
                .Must(type => type is 10 or 20 or 30)
                .WithMessage("Item type must be 10, 20, or 30.")
                .When(row => !IsDelete(row.State));
            item.RuleFor(row => row.CdCategory).MaximumLength(30);
            item.RuleFor(row => row.CdUom)
                .NotEmpty()
                .MaximumLength(10)
                .When(row => !IsDelete(row.State));
            item.RuleFor(row => row.PrPx)
                .Must(price => price is null ||
                    price.Value >= 0 &&
                    price.Value <= 999_999_999_999.999999m &&
                    price.Value % 0.000001m == 0)
                .WithMessage("Price must be non-negative and have no more than 6 decimal places.")
                .When(row => !IsDelete(row.State));
            item.RuleFor(row => row.State)
                .Must(IsSupportedState)
                .WithMessage("State must be I (insert), U (update), or D (delete).");
        });
    }

    private static bool IsDelete(string state) =>
        string.Equals(state, "D", StringComparison.OrdinalIgnoreCase);

    private static bool IsSupportedState(string state) =>
        state is not null &&
        (state.Equals("I", StringComparison.OrdinalIgnoreCase) ||
         state.Equals("U", StringComparison.OrdinalIgnoreCase) ||
         state.Equals("D", StringComparison.OrdinalIgnoreCase));
}
