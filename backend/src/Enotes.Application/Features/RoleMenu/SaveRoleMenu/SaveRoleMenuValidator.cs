using FluentValidation;

namespace Enotes.Application.Features.RoleMenu.SaveRoleMenu;

public sealed class SaveRoleMenuValidator : AbstractValidator<SaveRoleMenuCommand>
{
    public SaveRoleMenuValidator()
    {
        RuleForEach(x => x.Items).ChildRules(items =>
        {
            items.RuleFor(x => x.CdMenu).NotEmpty().MaximumLength(50);
            items.RuleFor(x => x.FgRole).NotEmpty().MaximumLength(50);
        });
    }
}
