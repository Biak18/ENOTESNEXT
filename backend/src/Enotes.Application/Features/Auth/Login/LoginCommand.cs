using MediatR;

namespace Enotes.Application.Features.Auth.Login;

public sealed record LoginCommand(
    string CdCom,
    string CdUser,
    string Password) : IRequest<LoginResponse>;
