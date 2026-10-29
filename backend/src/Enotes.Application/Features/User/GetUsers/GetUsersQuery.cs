using MediatR;

namespace Enotes.Application.Features.User.GetUsers;

public sealed record GetUsersQuery(string? SearchTerm) : IRequest<IEnumerable<UserDto>>;

public sealed record UserDto(
    string CdCom,
    string CdUser,
    string NmUser,
    string? DcEmail,
    string? DcAddress1,
    string? DcAddress2,
    string? NoTel,
    string YnActive,
    string? FgRole,
    string DtReg);
