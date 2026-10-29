namespace Enotes.Application.Features.Auth.Login;

public sealed record LoginResponse(
    string Token,
    string CdCom,
    string CdUser,
    string NmUser,
    string FgRole);
