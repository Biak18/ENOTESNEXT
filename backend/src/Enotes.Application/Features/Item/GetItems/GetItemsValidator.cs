using FluentValidation;

namespace Enotes.Application.Features.Item.GetItems;

public sealed class GetItemsValidator : AbstractValidator<GetItemsQuery>
{
    public GetItemsValidator()
    {
        RuleFor(query => query.CdCompany).NotEmpty().MaximumLength(10);
        RuleFor(query => query.SearchTerm).MaximumLength(200);
        RuleFor(query => query.FgType)
            .Must(type => type is null or 10 or 20 or 30)
            .WithMessage("Item type must be 10, 20, or 30.");
    }
}
