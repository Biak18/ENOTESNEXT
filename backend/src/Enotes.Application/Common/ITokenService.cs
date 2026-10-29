namespace Enotes.Application.Common;

public interface ITokenService
{
    string GenerateToken(
        string cdCom,
        string cdUser,
        string nmUser,
        string? fgRole);
}
