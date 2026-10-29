using FluentValidation;

namespace Enotes.Application.Features.User.UpdateUser;

public sealed class UpdateUserValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.CdCom).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CdUser).NotEmpty().MaximumLength(50);
        RuleFor(x => x.NmUser).NotEmpty().MaximumLength(200);
        RuleFor(x => x.YnActive).NotEmpty().MaximumLength(1);
        RuleFor(x => x.FgRole).MaximumLength(50);
    }
}
