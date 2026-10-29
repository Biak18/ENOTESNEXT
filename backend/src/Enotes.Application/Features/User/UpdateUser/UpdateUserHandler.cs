using Enotes.Application.Common;
using Enotes.Domain.Common;
using MediatR;

namespace Enotes.Application.Features.User.UpdateUser;

public sealed class UpdateUserHandler(
    IUserRepository userRepository)
    : IRequestHandler<UpdateUserCommand, UpdateUserResponse>
{
    public async Task<UpdateUserResponse> Handle(
        UpdateUserCommand command,
        CancellationToken cancellationToken)
    {
        var existing = await userRepository.GetByCompanyAndUserAsync(command.CdCom, command.CdUser, cancellationToken)
            ?? throw new DomainException($"User not found: {command.CdCom}/{command.CdUser}");

        existing.Update(
            command.NmUser,
            command.DcEmail,
            command.DcAddress1,
            command.DcAddress2,
            command.NoTel,
            command.FgRole,
            command.YnActive);

        userRepository.Update(existing);
        await userRepository.SaveChangesAsync(cancellationToken);

        return new UpdateUserResponse(command.CdCom, command.CdUser, "User updated successfully.");
    }
}
