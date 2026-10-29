using FluentValidation;

namespace Enotes.Application.Features.User.DeleteUser;

public sealed class DeleteUserValidator : AbstractValidator<DeleteUserCommand>
{
    public DeleteUserValidator()
    {
        RuleFor(x => x.CdCom).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CdUser).NotEmpty().MaximumLength(50);
    }
}
