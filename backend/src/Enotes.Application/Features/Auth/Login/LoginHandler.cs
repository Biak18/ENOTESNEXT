using Enotes.Application.Common;
using Enotes.Domain.Common;
using Enotes.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Identity.Core;

namespace Enotes.Application.Features.Auth.Login;

public sealed class LoginHandler(
    IUserRepository userRepository,
    ITokenService tokenService)
    : IRequestHandler<LoginCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(
        LoginCommand command,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByCompanyAndUserAsync(
            command.CdCom,
            command.CdUser,
            cancellationToken);

        if (user is null)
        {
            throw new DomainException($"User not found: company='{command.CdCom}', user='{command.CdUser}'.");
        }

        if (user.YnActive != "Y")
        {
            throw new DomainException($"User is disabled: company='{command.CdCom}', user='{command.CdUser}'.");
        }

        var hasher = new PasswordHasher<string>();
        var result = hasher.VerifyHashedPassword(
            null!,
            user.DcPassword,
            command.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            throw new DomainException($"Password mismatch for user='{command.CdUser}' in company='{command.CdCom}'.");
        }

        // SuccessRehashNeeded means password is correct but hash format needs updating.
        // Rehash and persist so future logins return Success.
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            var newHash = hasher.HashPassword(null!, command.Password);
            user.UpdatePassword(newHash);
            await userRepository.SaveChangesAsync(cancellationToken);
        }

        var token = tokenService.GenerateToken(
            user.CdCom,
            user.CdUser,
            user.NmUser,
            user.FgRole);

        return new LoginResponse(
            token,
            user.CdCom,
            user.CdUser,
            user.NmUser,
            user.FgRole ?? string.Empty);
    }
}
