using Enotes.Domain.Common;

namespace Enotes.Domain.Entities;

public sealed class SysUser
{
    public string CdCom { get; private set; } = string.Empty;
    public string CdUser { get; private set; } = string.Empty;
    public string DcPassword { get; private set; } = string.Empty;
    public string NmUser { get; private set; } = string.Empty;
    public string DtReg { get; private set; } = string.Empty;
    public string? DcEmail { get; private set; }
    public string? DcAddress1 { get; private set; }
    public string? DcAddress2 { get; private set; }
    public string? NoTel { get; private set; }
    public string YnActive { get; private set; } = "Y";
    public string? FgRole { get; private set; }
    public DateTime? TmReg { get; private set; }
    public string? CdUserReg { get; private set; }
    public DateTime? TmAmd { get; private set; }
    public string? CdUserAmd { get; private set; }

    private SysUser() { }

    public static SysUser Create(
        string cdCom,
        string cdUser,
        string dcPassword,
        string nmUser,
        string dtReg,
        string? dcEmail = null,
        string? dcAddress1 = null,
        string? dcAddress2 = null,
        string? noTel = null,
        string? fgRole = null)
    {
        if (string.IsNullOrWhiteSpace(cdCom))
            throw new DomainException("Company code is required.");

        if (string.IsNullOrWhiteSpace(cdUser))
            throw new DomainException("User code is required.");

        if (string.IsNullOrWhiteSpace(dcPassword))
            throw new DomainException("Password is required.");

        if (string.IsNullOrWhiteSpace(nmUser))
            throw new DomainException("User name is required.");

        return new SysUser
        {
            CdCom = cdCom.Trim(),
            CdUser = cdUser.Trim(),
            DcPassword = dcPassword,
            NmUser = nmUser.Trim(),
            DtReg = dtReg.Trim(),
            YnActive = "Y",
            DcEmail = dcEmail?.Trim(),
            DcAddress1 = dcAddress1?.Trim(),
            DcAddress2 = dcAddress2?.Trim(),
            NoTel = noTel?.Trim(),
            FgRole = fgRole?.Trim()
        };
    }

    public void UpdatePassword(string newPassword)
    {
        if (string.IsNullOrWhiteSpace(newPassword))
            throw new DomainException("Password cannot be empty.");

        DcPassword = newPassword;
        TmAmd = DateTime.UtcNow;
    }

    public void Update(
        string nmUser,
        string? dcEmail = null,
        string? dcAddress1 = null,
        string? dcAddress2 = null,
        string? noTel = null,
        string? fgRole = null,
        string? ynActive = null,
        string? dcPassword = null)
    {
        if (string.IsNullOrWhiteSpace(nmUser))
            throw new DomainException("User name is required.");

        NmUser = nmUser.Trim();
        DcEmail = dcEmail?.Trim();
        DcAddress1 = dcAddress1?.Trim();
        DcAddress2 = dcAddress2?.Trim();
        NoTel = noTel?.Trim();
        FgRole = fgRole?.Trim();

        if (!string.IsNullOrWhiteSpace(ynActive))
            YnActive = ynActive.Trim();

        if (!string.IsNullOrWhiteSpace(dcPassword))
            DcPassword = dcPassword;

        TmAmd = DateTime.UtcNow;
    }
}
