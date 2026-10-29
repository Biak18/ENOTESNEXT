using MediatR;

namespace Enotes.Application.Features.User.SaveUser;

public sealed record SaveUserCommand(
    List<UserItemDto> Items) : IRequest<SaveUserResponse>;

public sealed record UserItemDto(
    string CdCom,
    string CdUser,
    string NmUser,
    string DcPassword,
    string DtReg,
    string? DcEmail,
    string? DcAddress1,
    string? DcAddress2,
    string? NoTel,
    string YnActive,
    string? FgRole,
    string? State);

public sealed record SaveUserResponse(
    int SavedCount);
