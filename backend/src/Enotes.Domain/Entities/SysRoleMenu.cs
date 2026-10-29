using Enotes.Domain.Common;

namespace Enotes.Domain.Entities;

public sealed class SysRoleMenu
{
    public string FgRole { get; private set; } = string.Empty;
    public string CdMenu { get; private set; } = string.Empty;

    private SysRoleMenu() { }

    public static SysRoleMenu Create(string fgRole, string cdMenu)
    {
        if (string.IsNullOrWhiteSpace(fgRole))
            throw new DomainException("Role code is required.");

        if (string.IsNullOrWhiteSpace(cdMenu))
            throw new DomainException("Menu code is required.");

        return new SysRoleMenu
        {
            FgRole = fgRole.Trim(),
            CdMenu = cdMenu.Trim()
        };
    }
}
