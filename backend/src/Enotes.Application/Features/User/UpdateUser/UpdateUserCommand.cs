using MediatR;

namespace Enotes.Application.Features.User.UpdateUser;

public sealed record UpdateUserCommand(
    string CdCom,
    string CdUser,
    string NmUser,
    string? DcEmail,
    string? DcAddress1,
    string? DcAddress2,
    string? NoTel,
    string YnActive,
    string? FgRole) : IRequest<UpdateUserResponse>;

public sealed record UpdateUserResponse(
    string CdCom,
    string CdUser,
    string Message);
