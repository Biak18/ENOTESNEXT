using FluentValidation;

namespace Enotes.Application.Features.User.GetUsers;

public sealed class GetUsersValidator : AbstractValidator<GetUsersQuery>
{
    public GetUsersValidator()
    {
        RuleFor(x => x.SearchTerm).MaximumLength(200);
    }
}
