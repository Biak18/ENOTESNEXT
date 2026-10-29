using MediatR;

namespace Enotes.Application.Features.Auth.ChangePassword;

public sealed record ChangePasswordCommand(
    string OldPassword,
    string NewPassword) : IRequest<ChangePasswordResponse>;
