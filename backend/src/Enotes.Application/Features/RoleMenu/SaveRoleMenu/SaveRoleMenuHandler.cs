using Enotes.Application.Common;
using MediatR;

namespace Enotes.Application.Features.RoleMenu.SaveRoleMenu;

/// <summary>
/// Saves role menu grants (sys_rolemenu). Cascade-on-write semantics:
/// a folder grant/expunge covers its whole sys_menu subtree (cd_menu_parent,
/// cycle-safe) so reads remain plain row-presence lookups.
/// Rule symmetry: folder unassign deletes the folder row AND all descendant
/// rows; re-ticking a child after an unassign re-grants it individually.
/// </summary>
public sealed class SaveRoleMenuHandler(
    IRoleMenuRepository roleMenuRepository,
    IMenuRepository menuRepository)
    : IRequestHandler<SaveRoleMenuCommand, SaveRoleMenuResponse>
{
    public async Task<SaveRoleMenuResponse> Handle(
        SaveRoleMenuCommand command,
        CancellationToken cancellationToken)
    {
        // One hierarchy read; folder items cascade to their whole subtree.
        var hierarchy = await menuRepository.GetMenuHierarchyAsync(cancellationToken);
        var folders = hierarchy
            .Where(m => m.FgType == "F")
            .Select(m => m.CdMenu)
            .ToHashSet(StringComparer.Ordinal);

        // Codes granted per role, cache-free per role in this save.
        Dictionary<string, HashSet<string>>? assignedByRole = null;

        var savedCount = 0;

        foreach (var item in command.Items)
        {
            // Folder toggles cascade; program toggles stay single-row.
            var codes = folders.Contains(item.CdMenu)
                ? MenuSubtree.WithDescendants(hierarchy, item.CdMenu)
                : (IReadOnlyCollection<string>)[item.CdMenu];

            assignedByRole ??= [];
            if (!assignedByRole.TryGetValue(item.FgRole, out var assignedSet))
            {
                var assigned = await roleMenuRepository.GetAssignedMenuCodesAsync(
                    item.FgRole,
                    cancellationToken);
                assignedSet = new HashSet<string>(assigned, StringComparer.Ordinal);
                assignedByRole[item.FgRole] = assignedSet;
            }

            if (item.IsAssigned)
            {
                // Idempotent: already-granted codes are skipped.
                var toAdd = codes.Where(c => assignedSet.Add(c)).ToHashSet(StringComparer.Ordinal);

                if (toAdd.Count > 0)
                {
                    await roleMenuRepository.AddRangeAsync(
                        item.FgRole,
                        toAdd,
                        cancellationToken);
                }

                savedCount += toAdd.Count;
            }
            else
            {
                // Only touches codes that actually have rows in the DB (or were
                // added earlier in this same save, which are then untracked).
                var toRemove = codes.Where(c => assignedSet.Remove(c)).ToHashSet(StringComparer.Ordinal);

                if (toRemove.Count > 0)
                {
                    savedCount += await roleMenuRepository.RemoveRangeAsync(
                        item.FgRole,
                        toRemove,
                        cancellationToken);
                }
            }
        }

        // Every add/remove was tracked in the same change set: one atomic save.
        await roleMenuRepository.SaveChangesAsync(cancellationToken);

        return new SaveRoleMenuResponse(savedCount);
    }
}
