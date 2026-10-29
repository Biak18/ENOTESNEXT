using FluentValidation;

namespace Enotes.Application.Features.Company.UpdateCompany;

public sealed class UpdateCompanyValidator : AbstractValidator<UpdateCompanyCommand>
{
    public UpdateCompanyValidator()
    {
        RuleFor(x => x.CdCompany).NotEmpty().MaximumLength(50);
        RuleFor(x => x.NmCompany).NotEmpty().MaximumLength(200);
    }
}
