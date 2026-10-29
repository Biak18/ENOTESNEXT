using FluentValidation;

namespace Enotes.Application.Features.Auth.ChangePassword;

public sealed class ChangePasswordValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.OldPassword).NotEmpty();
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(6)
            .NotEqual(x => x.OldPassword)
            .WithMessage("New password must be different from old password.");
    }
}
