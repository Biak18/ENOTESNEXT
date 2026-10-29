using FluentValidation;

namespace Enotes.Application.Features.CompanyMenu.GetCompanyMenus;

public sealed class GetCompanyMenusValidator : AbstractValidator<GetCompanyMenusQuery>
{
    public GetCompanyMenusValidator()
    {
        RuleFor(x => x.CdCompany).NotEmpty().MaximumLength(50);
    }
}
