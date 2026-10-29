using FluentValidation;

namespace Enotes.Application.Features.UserMenu.SaveUserMenu;

public sealed class SaveUserMenuValidator : AbstractValidator<SaveUserMenuCommand>
{
    public SaveUserMenuValidator()
    {
        RuleFor(x => x.CdCompany).NotEmpty().MaximumLength(50);
        RuleForEach(x => x.Items).ChildRules(items =>
        {
            items.RuleFor(x => x.CdUser).NotEmpty().MaximumLength(50);
            items.RuleFor(x => x.CdMenu).NotEmpty().MaximumLength(50);
            items.RuleFor(x => x.FgAction).MaximumLength(1);
        });
    }
}
