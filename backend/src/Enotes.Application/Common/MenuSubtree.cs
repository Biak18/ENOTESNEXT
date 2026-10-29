namespace Enotes.Application.Common;

/// <summary>
/// Pure navigation over the sys_menu parent/child hierarchy (cd_menu_parent)
/// for folder-grant cascading. Presence-grant layers (sys_companymenu /
/// sys_rolemenu) treat a folder row as granting its whole subtree.
/// </summary>
public static class MenuSubtree
{
    /// <summary>
    /// The menu itself plus every recursive descendant (all depths) reached by
    /// following cd_menu_parent. Cycle-safe: malformed data such as
    /// X.parent = Y, Y.parent = X or X.parent = X stops traversal instead of
    /// looping forever, while every other descendant still gets collected.
    /// </summary>
    public static IReadOnlyCollection<string> WithDescendants(
        IReadOnlyList<MenuHierarchyItemDto> menus,
        string rootCdMenu)
    {
        // parent code -> children codes
        var byParent = new Dictionary<string, List<string>>(StringComparer.Ordinal);
        foreach (var m in menus)
        {
            if (string.IsNullOrEmpty(m.CdMenuParent) || m.CdMenuParent == m.CdMenu)
                continue; // no parent, or self-parent (trivial cycle)

            if (!byParent.TryGetValue(m.CdMenuParent, out var children))
            {
                children = [];
                byParent[m.CdMenuParent] = children;
            }

            children.Add(m.CdMenu);
        }

        var result = new List<string> { rootCdMenu };
        var visited = new HashSet<string>(StringComparer.Ordinal) { rootCdMenu };
        var queue = new Queue<string>();
        queue.Enqueue(rootCdMenu);

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();

            if (!byParent.TryGetValue(current, out var children))
                continue;

            foreach (var child in children)
            {
                if (visited.Add(child))
                {
                    result.Add(child);
                    queue.Enqueue(child);
                }
            }
        }

        return result;
    }
}
