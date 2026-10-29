using MediatR;

namespace Enotes.Application.Features.User.DeleteUser;

public sealed record DeleteUserCommand(string CdCom, string CdUser) : IRequest<DeleteUserResponse>;

public sealed record DeleteUserResponse(string CdCom, string CdUser, string Message);
