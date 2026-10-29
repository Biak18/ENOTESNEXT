using FluentValidation;

namespace Enotes.Application.Features.CompanyMenu.SaveCompanyMenu;

public sealed class SaveCompanyMenuValidator : AbstractValidator<SaveCompanyMenuCommand>
{
    public SaveCompanyMenuValidator()
    {
        RuleFor(x => x.CdCompany).NotEmpty().MaximumLength(50);
        RuleForEach(x => x.Items).ChildRules(items =>
        {
            items.RuleFor(x => x.CdMenu).NotEmpty().MaximumLength(50);
        });
    }
}
