using Enotes.Domain.Common;

namespace Enotes.Domain.Entities;

public sealed class SysUserMenu
{
    public string CdCompany { get; private set; } = string.Empty;
    public string CdUser { get; private set; } = string.Empty;
    public string CdMenu { get; private set; } = string.Empty;
    public string FgAction { get; private set; } = "A";
    public DateTime? TmReg { get; private set; }

    private SysUserMenu() { }

    public static SysUserMenu Create(
        string cdCompany,
        string cdUser,
        string cdMenu,
        string? fgAction = null)
    {
        if (string.IsNullOrWhiteSpace(cdCompany))
            throw new DomainException("Company code is required.");

        if (string.IsNullOrWhiteSpace(cdUser))
            throw new DomainException("User code is required.");

        if (string.IsNullOrWhiteSpace(cdMenu))
            throw new DomainException("Menu code is required.");

        return new SysUserMenu
        {
            CdCompany = cdCompany.Trim(),
            CdUser = cdUser.Trim(),
            CdMenu = cdMenu.Trim(),
            FgAction = string.IsNullOrWhiteSpace(fgAction) ? "A" : fgAction.Trim(),
            TmReg = DateTime.UtcNow
        };
    }
}
