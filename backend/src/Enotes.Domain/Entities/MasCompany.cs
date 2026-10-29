using Enotes.Domain.Common;

namespace Enotes.Domain.Entities;

public sealed class MasCompany
{
    public string CdCompany { get; private set; } = string.Empty;
    public string NmCompany { get; private set; } = string.Empty;
    public string? NmShort { get; private set; }
    public string? DcImageUrl { get; private set; }
    public string? DcAddress1 { get; private set; }
    public string? DcAddress2 { get; private set; }
    public string? DcCity { get; private set; }
    public string? DcState { get; private set; }
    public string? DcPostalCode { get; private set; }
    public string? DcCountry { get; private set; }
    public string? NoPhone { get; private set; }
    public string? NoFax { get; private set; }
    public string? DcEmail { get; private set; }
    public string? DcWebsite { get; private set; }
    public string? NoTaxId { get; private set; }
    public string? NoRegNo { get; private set; }
    public DateTime? TmReg { get; private set; }
    public DateTime? TmAmd { get; private set; }
    public bool FlActive { get; private set; } = true;

    private MasCompany() { }

    public static MasCompany Create(
        string cdCompany,
        string nmCompany,
        string? nmShort = null)
    {
        if (string.IsNullOrWhiteSpace(cdCompany))
            throw new DomainException("Company code is required.");

        if (string.IsNullOrWhiteSpace(nmCompany))
            throw new DomainException("Company name is required.");

        return new MasCompany
        {
            CdCompany = cdCompany.Trim(),
            NmCompany = nmCompany.Trim(),
            NmShort = nmShort?.Trim(),
            FlActive = true
        };
    }

    public void Update(
        string nmCompany,
        string? nmShort = null,
        string? dcImageUrl = null,
        string? dcAddress1 = null,
        string? dcAddress2 = null,
        string? dcCity = null,
        string? dcState = null,
        string? dcPostalCode = null,
        string? dcCountry = null,
        string? noPhone = null,
        string? noFax = null,
        string? dcEmail = null,
        string? dcWebsite = null,
        string? noTaxId = null,
        string? noRegNo = null,
        bool flActive = true)
    {
        if (string.IsNullOrWhiteSpace(nmCompany))
            throw new DomainException("Company name is required.");

        NmCompany = nmCompany.Trim();
        NmShort = nmShort?.Trim();
        DcImageUrl = dcImageUrl?.Trim();
        DcAddress1 = dcAddress1?.Trim();
        DcAddress2 = dcAddress2?.Trim();
        DcCity = dcCity?.Trim();
        DcState = dcState?.Trim();
        DcPostalCode = dcPostalCode?.Trim();
        DcCountry = dcCountry?.Trim();
        NoPhone = noPhone?.Trim();
        NoFax = noFax?.Trim();
        DcEmail = dcEmail?.Trim();
        DcWebsite = dcWebsite?.Trim();
        NoTaxId = noTaxId?.Trim();
        NoRegNo = noRegNo?.Trim();
        FlActive = flActive;
        TmAmd = DateTime.UtcNow;
    }
}
