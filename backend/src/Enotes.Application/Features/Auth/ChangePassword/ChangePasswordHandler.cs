using Enotes.Application.Common;
using Enotes.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace Enotes.Application.Features.Auth.ChangePassword;

public sealed class ChangePasswordHandler(
    IUserRepository userRepository,
    IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<ChangePasswordCommand, ChangePasswordResponse>
{
    public async Task<ChangePasswordResponse> Handle(
        ChangePasswordCommand command,
        CancellationToken cancellationToken)
    {
        var userContext = httpContextAccessor.HttpContext?.User;
        if (userContext?.Identity is not { IsAuthenticated: true })
        {
            throw new DomainException("User not authenticated.");
        }

        var cdCom = userContext.FindFirst("cd_com")?.Value
            ?? throw new DomainException("Company context missing.");
        var cdUser = userContext.FindFirst("cd_user")?.Value
            ?? throw new DomainException("User context missing.");

        var user = await userRepository.GetByCompanyAndUserAsync(
            cdCom,
            cdUser,
            cancellationToken)
            ?? throw new DomainException("User not found.");

        var hasher = new PasswordHasher<string>();
        var result = hasher.VerifyHashedPassword(
            null!,
            user.DcPassword,
            command.OldPassword);

        if (result == PasswordVerificationResult.Failed)
        {
            throw new DomainException("Old password is incorrect.");
        }

        user.UpdatePassword(command.NewPassword);
        await userRepository.SaveChangesAsync(cancellationToken);

        return new ChangePasswordResponse(
            user.CdUser,
            "Password changed successfully.");
    }
}
