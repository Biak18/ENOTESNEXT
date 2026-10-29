using FluentValidation;

namespace Enotes.Application.Features.User.SaveUser;

public sealed class SaveUserValidator : AbstractValidator<SaveUserCommand>
{
    public SaveUserValidator()
    {
        RuleForEach(x => x.Items)
            .ChildRules(items =>
            {
                items.RuleFor(x => x.CdCom).NotEmpty().MaximumLength(50);
                items.RuleFor(x => x.CdUser).NotEmpty().MaximumLength(50);
                items.RuleFor(x => x.NmUser).NotEmpty().MaximumLength(200);
                items.RuleFor(x => x.DtReg).NotEmpty().MaximumLength(20);
                items.RuleFor(x => x.YnActive).NotEmpty().MaximumLength(1);
                items.RuleFor(x => x.FgRole).MaximumLength(50);
                items.RuleFor(x => x.DcEmail).MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.DcEmail));
                items.RuleFor(x => x.DcAddress1).MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.DcAddress1));
                items.RuleFor(x => x.DcAddress2).MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.DcAddress2));
                items.RuleFor(x => x.NoTel).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.NoTel));

                // Password required only for new users, not for updates
                items.RuleFor(x => x.DcPassword)
                    .NotEmpty()
                    .When(x => x.State?.ToUpperInvariant() == "ADDED" ||
                               x.State?.ToUpperInvariant() == "INSERT" ||
                               x.State?.ToUpperInvariant() == "I");
            });
    }
}
