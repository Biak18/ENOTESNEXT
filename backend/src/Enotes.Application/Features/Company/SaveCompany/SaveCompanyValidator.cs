using FluentValidation;

namespace Enotes.Application.Features.Company.SaveCompany;

public sealed class SaveCompanyValidator : AbstractValidator<SaveCompanyCommand>
{
    public SaveCompanyValidator()
    {
        RuleForEach(x => x.Items)
            .ChildRules(items =>
            {
                items.RuleFor(x => x.CdCompany).NotEmpty().MaximumLength(50);
                items.RuleFor(x => x.NmCompany).NotEmpty().MaximumLength(200);
                items.RuleFor(x => x.DcAddress1).MaximumLength(200);
                items.RuleFor(x => x.DcCity).MaximumLength(100);
                items.RuleFor(x => x.DcState).MaximumLength(100);
                items.RuleFor(x => x.DcCountry).MaximumLength(100);
                items.RuleFor(x => x.NoPhone).MaximumLength(50);
            });
    }
}
