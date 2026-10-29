using FluentValidation;

namespace Enotes.Application.Features.Menu.SaveMenu;

public sealed class SaveMenuValidator : AbstractValidator<SaveMenuCommand>
{
    public SaveMenuValidator()
    {
        RuleForEach(x => x.Items)
            .ChildRules(items =>
            {
                items.RuleFor(x => x.CdMenu).NotEmpty().MaximumLength(50);
                items.RuleFor(x => x.NmMenu).NotEmpty().MaximumLength(200);
                items.RuleFor(x => x.FgType).MaximumLength(1);
                items.RuleFor(x => x.CdMenuParent).MaximumLength(50);
            });
    }
}
