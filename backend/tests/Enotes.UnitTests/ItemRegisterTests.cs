using Enotes.Application.Features.Item.SaveItems;
using Enotes.Domain.Common;
using Enotes.Domain.Entities;

namespace Enotes.UnitTests;

public sealed class ItemRegisterTests
{
    [Fact]
    public void Create_normalizes_values_and_keeps_database_managed_cost_empty()
    {
        var item = MasItem.Create(
            " DEMO ",
            " ITEM-01 ",
            " Copy paper ",
            10,
            " Office supplies ",
            " EA ",
            2.5m,
            false,
            true);

        Assert.Equal("DEMO", item.CdCompany);
        Assert.Equal("ITEM-01", item.CdItem);
        Assert.Equal("Copy paper", item.NmItem);
        Assert.Equal("Office supplies", item.CdCategory);
        Assert.Equal("EA", item.CdUom);
        Assert.Equal(2.5m, item.PrPx);
        Assert.Null(item.AmCost);
    }

    [Theory]
    [InlineData((short)0)]
    [InlineData((short)40)]
    public void Create_rejects_item_types_not_allowed_by_database(short type)
    {
        Assert.Throws<DomainException>(() =>
            MasItem.Create("DEMO", "ITEM-01", "Item", type, null, "EA", null, false, true));
    }

    [Fact]
    public void Create_rejects_price_with_more_than_six_decimal_places()
    {
        Assert.Throws<DomainException>(() =>
            MasItem.Create("DEMO", "ITEM-01", "Item", 10, null, "EA", 1.1234567m, false, true));
    }

    [Fact]
    public void Save_validator_requires_unique_codes_and_supported_states()
    {
        var validator = new SaveItemsValidator();
        var row = new ItemSaveRequest(
            "ITEM-01", "Item", 10, null, "EA", 1m, false, true, "I");
        var duplicateCommand = new SaveItemsCommand("DEMO", [row, row]);
        var invalidStateCommand = new SaveItemsCommand(
            "DEMO",
            [row with { State = "X" }]);

        Assert.Contains(
            validator.Validate(duplicateCommand).Errors,
            error => error.ErrorMessage == "An item code can appear only once in a save request.");
        Assert.Contains(
            validator.Validate(invalidStateCommand).Errors,
            error => error.ErrorMessage == "State must be I (insert), U (update), or D (delete).");
    }

    [Fact]
    public void Save_validator_allows_delete_rows_with_only_the_key_and_state()
    {
        var validator = new SaveItemsValidator();
        var command = new SaveItemsCommand(
            "DEMO",
            [new ItemSaveRequest("ITEM-01", "", 0, null, "", null, false, false, "D")]);

        Assert.True(validator.Validate(command).IsValid);
    }
}
