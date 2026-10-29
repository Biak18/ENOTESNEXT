using FluentValidation;

namespace Enotes.Application.Features.Company.DeleteCompany;

public sealed class DeleteCompanyValidator : AbstractValidator<DeleteCompanyCommand>
{
    public DeleteCompanyValidator()
    {
        RuleFor(x => x.CdCompany).NotEmpty().MaximumLength(50);
    }
}
