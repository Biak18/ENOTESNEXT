namespace Enotes.Domain.Entities;

public sealed class MasUom
{
    public string CdUom { get; private set; } = string.Empty;
    public bool FlActive { get; private set; }

    private MasUom() { }
}
