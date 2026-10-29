using FluentValidation;

namespace Enotes.Application.Features.Menu.GetMenus;

public sealed class GetMenusValidator : AbstractValidator<GetMenusQuery>
{
    public GetMenusValidator()
    {
        RuleFor(x => x.SearchTerm).MaximumLength(200);
    }
}
