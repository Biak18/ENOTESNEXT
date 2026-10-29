using Enotes.Application.Common;
using Enotes.Domain.Common;
using Enotes.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Identity.Core;

namespace Enotes.Application.Features.Employees.CreateEmployee;

public sealed class CreateEmployeeHandler(
    IUserRepository userRepository)
    : IRequestHandler<CreateEmployeeCommand, CreateEmployeeResponse>
{
    public async Task<CreateEmployeeResponse> Handle(
        CreateEmployeeCommand command,
        CancellationToken cancellationToken)
    {
        var exists = await userRepository.ExistsAsync(
            command.CdCom,
            command.CdUser,
            cancellationToken);

        if (exists)
        {
            throw new DomainException("User already exists for this company.");
        }

        var hasher = new PasswordHasher<string>();
        var hashedPassword = hasher.HashPassword(null!, command.Password);

        var user = SysUser.Create(
            command.CdCom,
            command.CdUser,
            hashedPassword,
            command.NmUser,
            command.DtReg,
            command.DcEmail,
            command.DcAddress1,
            command.DcAddress2,
            command.NoTel,
            command.FgRole);

        await userRepository.AddAsync(user, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);

        return new CreateEmployeeResponse(
            user.CdCom,
            user.CdUser,
            user.NmUser);
    }
}
