using Enotes.Domain.Common;

namespace Enotes.Domain.Entities;

public sealed class SysMenu
{
    public string CdMenu { get; private set; } = string.Empty;
    public string NmMenu { get; private set; } = string.Empty;
    public string? NmNetwindow { get; private set; }
    public string? FgType { get; private set; }
    public string? CdModule { get; private set; }
    public string? NoPos { get; private set; }
    public string? CdMenuParent { get; private set; }

    private SysMenu() { }

    public static SysMenu Create(
        string cdMenu,
        string nmMenu,
        string? nmNetwindow = null,
        string? cdModule = null,
        string? noPos = null,
        string? cdMenuParent = null)
    {
        if (string.IsNullOrWhiteSpace(cdMenu))
            throw new DomainException("Menu code is required.");

        if (string.IsNullOrWhiteSpace(nmMenu))
            throw new DomainException("Menu name is required.");

        return new SysMenu
        {
            CdMenu = cdMenu.Trim(),
            NmMenu = nmMenu.Trim(),
            NmNetwindow = nmNetwindow?.Trim(),
            CdModule = cdModule?.Trim(),
            NoPos = noPos?.Trim(),
            CdMenuParent = cdMenuParent?.Trim()
        };
    }

    public void Update(
        string nmMenu,
        string? nmNetwindow = null,
        string? fgType = null,
        string? cdModule = null,
        string? noPos = null,
        string? cdMenuParent = null)
    {
        if (string.IsNullOrWhiteSpace(nmMenu))
            throw new DomainException("Menu name is required.");

        NmMenu = nmMenu.Trim();
        NmNetwindow = nmNetwindow?.Trim();
        FgType = fgType?.Trim();
        CdModule = cdModule?.Trim();
        NoPos = noPos?.Trim();
        CdMenuParent = cdMenuParent?.Trim();
    }
}
