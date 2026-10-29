using FluentValidation;

namespace Enotes.Application.Features.Auth.Login;

public sealed class LoginValidator : AbstractValidator<LoginCommand>
{
    public LoginValidator()
    {
        RuleFor(x => x.CdCom).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CdUser).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Password).NotEmpty();
    }
}
