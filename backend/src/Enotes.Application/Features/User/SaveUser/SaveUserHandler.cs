using Enotes.Application.Common;
using Enotes.Domain.Common;
using Enotes.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Enotes.Application.Features.User.SaveUser;

public sealed class SaveUserHandler(
    IUserRepository userRepository)
    : IRequestHandler<SaveUserCommand, SaveUserResponse>
{
    public async Task<SaveUserResponse> Handle(
        SaveUserCommand command,
        CancellationToken cancellationToken)
    {
        var savedCount = 0;
        var hasher = new PasswordHasher<string>();

        foreach (var item in command.Items)
        {
            switch (item.State?.ToUpperInvariant())
            {
                case "ADDED":
                case "INSERT":
                case "I":
                {
                    var hashedPassword = hasher.HashPassword(null!, item.DcPassword);

                    var user = SysUser.Create(
                        item.CdCom,
                        item.CdUser,
                        hashedPassword,
                        item.NmUser,
                        item.DtReg,
                        item.DcEmail,
                        item.DcAddress1,
                        item.DcAddress2,
                        item.NoTel,
                        item.FgRole);

                    user.Update(
                        item.NmUser,
                        item.DcEmail,
                        item.DcAddress1,
                        item.DcAddress2,
                        item.NoTel,
                        item.FgRole,
                        item.YnActive,
                        hashedPassword);

                    await userRepository.AddAsync(user, cancellationToken);
                    savedCount++;
                    break;
                }

                case "MODIFIED":
                case "UPDATE":
                case "U":
                {
                    var existing = await userRepository.GetByCompanyAndUserAsync(
                        item.CdCom,
                        item.CdUser,
                        cancellationToken)
                        ?? throw new DomainException($"User not found: {item.CdCom}/{item.CdUser}");

                    var hashedPassword = string.IsNullOrWhiteSpace(item.DcPassword)
                        ? existing.DcPassword
                        : hasher.HashPassword(null!, item.DcPassword);

                    existing.Update(
                        item.NmUser,
                        item.DcEmail,
                        item.DcAddress1,
                        item.DcAddress2,
                        item.NoTel,
                        item.FgRole,
                        item.YnActive,
                        hashedPassword);

                    userRepository.Update(existing);
                    savedCount++;
                    break;
                }

                case "DELETED":
                case "DELETE":
                case "D":
                {
                    await userRepository.DeleteAsync(item.CdCom, item.CdUser, cancellationToken);
                    savedCount++;
                    break;
                }
            }
        }

        await userRepository.SaveChangesAsync(cancellationToken);

        return new SaveUserResponse(savedCount);
    }
}
