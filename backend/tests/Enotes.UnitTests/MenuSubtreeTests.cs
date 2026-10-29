using Enotes.Application.Common;

namespace Enotes.UnitTests;

public class MenuSubtreeTests
{
    private static MenuHierarchyItemDto M(string cdMenu, string? fgType, string? parent)
        => new(cdMenu, fgType, parent);

    private static readonly IReadOnlyList<MenuHierarchyItemDto> SampleHierarchy =
    [
        M("BAS", "F", null),
        M("MAS", "F", "BAS"),
        M("PUR", "F", "BAS"),
        M("SAL", "F", "BAS"),
        M("SYS", "F", "BAS"),
        M("EN_MAS_ORG_REG_001", "M", "MAS"),
        M("EN_SYS_BAS_REG_001", "M", "MAS"),
        M("EN_SYS_AUT_REG_001", "M", "SYS"),
        M("EN_SYS_AUT_REG_002", "M", "SYS"),
        M("EN_SYS_AUT_REG_003", "M", "SYS"),
    ];

    [Fact]
    public void WithDescendants_folder_includes_every_level()
    {
        var codes = MenuSubtree.WithDescendants(SampleHierarchy, "BAS");

        Assert.Contains("BAS", codes);
        Assert.Contains("MAS", codes);
        Assert.Contains("EN_MAS_ORG_REG_001", codes);
        Assert.Contains("SYS", codes);
        Assert.Contains("EN_SYS_AUT_REG_001", codes);
        Assert.Equal(10, codes.Count);
    }

    [Fact]
    public void WithDescendants_leaf_returns_only_itself()
    {
        var codes = MenuSubtree.WithDescendants(SampleHierarchy, "EN_SYS_AUT_REG_001");

        Assert.Single(codes);
        Assert.Equal("EN_SYS_AUT_REG_001", codes.Single());
    }

    [Fact]
    public void WithDescendants_unknown_menu_returns_only_itself()
    {
        var codes = MenuSubtree.WithDescendants(SampleHierarchy, "NO_SUCH_MENU");

        Assert.Single(codes);
        Assert.Equal("NO_SUCH_MENU", codes.Single());
    }

    [Fact]
    public void WithDescendants_self_parent_menu_does_not_loop()
    {
        var hierarchy = new List<MenuHierarchyItemDto>
        {
            M("F", "F", null),
            M("A", "M", "F"),
            M("X", "M", "X"), // self-parent cycle
        };

        var codes = MenuSubtree.WithDescendants(hierarchy, "F");

        Assert.Equal(new HashSet<string> { "F", "A" }, codes);
    }

    [Fact]
    public void WithDescendants_mutual_parent_cycle_stops_traversal()
    {
        // Malformed data: a second X row with parent Y closes the cycle
        // X -> Y -> X. The visited set must stop traversal once, and the
        // other child C of X must still be collected.
        var hierarchy = new List<MenuHierarchyItemDto>
        {
            M("BAS", "F", null),
            M("X", "F", "BAS"),
            M("Y", "M", "X"),
            M("X", "M", "Y"), // duplicate code row closing the cycle X <-> Y
            M("C", "M", "X"),
        };

        var codes = MenuSubtree.WithDescendants(hierarchy, "BAS");

        Assert.Equal(4, codes.Count); // BAS, X, Y, C — each exactly once
    }

    [Fact]
    public void WithDescendants_duplicate_child_paths_appear_once()
    {
        // Malformed data: the same menu code listed twice with different
        // parents — collected exactly once.
        var hierarchy = new List<MenuHierarchyItemDto>
        {
            M("F", "F", null),
            M("P1", "M", "F"),
            M("P2", "M", "F"),
            M("C", "M", "P1"),
            M("C", "M", "P2"), // duplicate path to C
        };

        var codes = MenuSubtree.WithDescendants(hierarchy, "F");

        Assert.Equal(4, codes.Count); // F, P1, P2, C — C only once
    }
}

