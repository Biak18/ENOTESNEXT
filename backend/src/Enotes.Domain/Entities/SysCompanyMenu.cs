using Enotes.Domain.Common;

namespace Enotes.Domain.Entities;

public sealed class SysCompanyMenu
{
    public string CdCompany { get; private set; } = string.Empty;
    public string CdMenu { get; private set; } = string.Empty;
    public DateTime? TmReg { get; private set; }

    private SysCompanyMenu() { }

    public static SysCompanyMenu Create(string cdCompany, string cdMenu)
    {
        if (string.IsNullOrWhiteSpace(cdCompany))
            throw new DomainException("Company code is required.");

        if (string.IsNullOrWhiteSpace(cdMenu))
            throw new DomainException("Menu code is required.");

        return new SysCompanyMenu
        {
            CdCompany = cdCompany.Trim(),
            CdMenu = cdMenu.Trim(),
            TmReg = DateTime.UtcNow
        };
    }
}
