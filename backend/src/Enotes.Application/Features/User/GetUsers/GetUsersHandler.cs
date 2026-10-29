using Enotes.Application.Common;
using MediatR;

namespace Enotes.Application.Features.User.GetUsers;

public sealed class GetUsersHandler(
    IUserRepository userRepository)
    : IRequestHandler<GetUsersQuery, IEnumerable<UserDto>>
{
    public async Task<IEnumerable<UserDto>> Handle(
        GetUsersQuery query,
        CancellationToken cancellationToken)
    {
        var users = await userRepository.GetAllAsync(
            query.SearchTerm,
            cancellationToken);

        return users.Select(u => new UserDto(
            u.CdCom,
            u.CdUser,
            u.NmUser,
            u.DcEmail,
            u.DcAddress1,
            u.DcAddress2,
            u.NoTel,
            u.YnActive,
            u.FgRole,
            u.DtReg));
    }
}
