using FluentValidation;

namespace Enotes.Application.Features.Company.GetCompanies;

public sealed class GetCompaniesValidator : AbstractValidator<GetCompaniesQuery>
{
    public GetCompaniesValidator()
    {
        RuleFor(x => x.SearchTerm).MaximumLength(200);
    }
}
