using FluentValidation;

namespace Enotes.Application.Features.Menu.DeleteMenu;

public sealed class DeleteMenuValidator : AbstractValidator<DeleteMenuCommand>
{
    public DeleteMenuValidator()
    {
        RuleFor(x => x.CdMenu).NotEmpty().MaximumLength(50);
    }
}
