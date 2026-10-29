using FluentValidation;

namespace Enotes.Application.Features.UserMenu.DeleteUserMenu;

public sealed class DeleteUserMenuValidator : AbstractValidator<DeleteUserMenuCommand>
{
    public DeleteUserMenuValidator()
    {
        RuleFor(x => x.CdCompany).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CdUser).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CdMenu).NotEmpty().MaximumLength(50);
    }
}
