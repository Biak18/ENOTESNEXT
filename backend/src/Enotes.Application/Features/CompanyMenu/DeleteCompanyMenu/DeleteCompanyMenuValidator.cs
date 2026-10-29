using FluentValidation;

namespace Enotes.Application.Features.CompanyMenu.DeleteCompanyMenu;

public sealed class DeleteCompanyMenuValidator : AbstractValidator<DeleteCompanyMenuCommand>
{
    public DeleteCompanyMenuValidator()
    {
        RuleFor(x => x.CdCompany).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CdMenu).NotEmpty().MaximumLength(50);
    }
}
