using Enotes.Application.Common;
using Enotes.Domain.Common;
using MediatR;

namespace Enotes.Application.Features.User.DeleteUser;

public sealed class DeleteUserHandler(
    IUserRepository userRepository)
    : IRequestHandler<DeleteUserCommand, DeleteUserResponse>
{
    public async Task<DeleteUserResponse> Handle(
        DeleteUserCommand command,
        CancellationToken cancellationToken)
    {
        await userRepository.DeleteAsync(command.CdCom, command.CdUser, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);

        return new DeleteUserResponse(command.CdCom, command.CdUser, "User deleted successfully.");
    }
}
