using FluentValidation;

namespace Enotes.Application.Features.RoleMenu.DeleteRoleMenu;

public sealed class DeleteRoleMenuValidator : AbstractValidator<DeleteRoleMenuCommand>
{
    public DeleteRoleMenuValidator()
    {
        RuleFor(x => x.FgRole).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CdMenu).NotEmpty().MaximumLength(50);
    }
}
