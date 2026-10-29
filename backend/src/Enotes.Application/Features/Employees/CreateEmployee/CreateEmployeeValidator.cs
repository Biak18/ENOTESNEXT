using FluentValidation;

namespace Enotes.Application.Features.Employees.CreateEmployee;

public sealed class CreateEmployeeValidator : AbstractValidator<CreateEmployeeCommand>
{
    public CreateEmployeeValidator()
    {
        RuleFor(x => x.CdCom).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CdUser).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.NmUser).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DtReg).NotEmpty().MaximumLength(20);
        RuleFor(x => x.DcEmail).MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.DcEmail));
        RuleFor(x => x.FgRole).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.FgRole));
    }
}
