using FluentValidation;

namespace Enotes.Application.Features.RoleMenu.GetRoleMenus;

public sealed class GetRoleMenusValidator : AbstractValidator<GetRoleMenusQuery>
{
    public GetRoleMenusValidator()
    {
        RuleFor(x => x.SearchTerm).MaximumLength(200);
    }
}
