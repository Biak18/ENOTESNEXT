using FluentValidation;

namespace Enotes.Application.Features.UserMenu.GetUserMenus;

public sealed class GetUserMenusValidator : AbstractValidator<GetUserMenusQuery>
{
    public GetUserMenusValidator()
    {
        RuleFor(x => x.CdCompany).NotEmpty().MaximumLength(50);
    }
}
