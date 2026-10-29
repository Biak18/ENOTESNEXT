using FluentValidation;

namespace Enotes.Application.Features.Menu.UpdateMenu;

public sealed class UpdateMenuValidator : AbstractValidator<UpdateMenuCommand>
{
    public UpdateMenuValidator()
    {
        RuleFor(x => x.CdMenu).NotEmpty().MaximumLength(50);
        RuleFor(x => x.NmMenu).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FgType).MaximumLength(1);
        RuleFor(x => x.CdMenuParent).MaximumLength(50);
    }
}
