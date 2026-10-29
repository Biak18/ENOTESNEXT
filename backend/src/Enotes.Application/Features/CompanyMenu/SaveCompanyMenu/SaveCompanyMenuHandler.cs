using Enotes.Application.Common;
using MediatR;

namespace Enotes.Application.Features.CompanyMenu.SaveCompanyMenu;

/// <summary>
/// Saves company menu grants (sys_companymenu). Cascade-on-write semantics:
/// a folder grant/expunge covers its whole sys_menu subtree (cd_menu_parent,
/// cycle-safe) so reads remain plain row-presence lookups.
/// Rule symmetry: folder unassign deletes the folder row AND all descendant
/// rows; re-ticking a child after an unassign re-grants it individually.
/// </summary>
public sealed class SaveCompanyMenuHandler(
    ICompanyMenuRepository companyMenuRepository,
    IMenuRepository menuRepository)
    : IRequestHandler<SaveCompanyMenuCommand, SaveCompanyMenuResponse>
{
    public async Task<SaveCompanyMenuResponse> Handle(
        SaveCompanyMenuCommand command,
        CancellationToken cancellationToken)
    {
        // One hierarchy read; folder items cascade to their whole subtree.
        var hierarchy = await menuRepository.GetMenuHierarchyAsync(cancellationToken);
        var folders = hierarchy
            .Where(m => m.FgType == "F")
            .Select(m => m.CdMenu)
            .ToHashSet(StringComparer.Ordinal);

        // Grants currently in the DB; used for dedupe and delete scoping.
        var assigned = await companyMenuRepository.GetAssignedMenuCodesAsync(
            command.CdCompany,
            cancellationToken);
        var assignedSet = new HashSet<string>(assigned, StringComparer.Ordinal);

        var savedCount = 0;

        foreach (var item in command.Items)
        {
            // Folder toggles cascade; program toggles stay single-row.
            var codes = folders.Contains(item.CdMenu)
                ? MenuSubtree.WithDescendants(hierarchy, item.CdMenu)
                : (IReadOnlyCollection<string>)[item.CdMenu];

            if (item.IsAssigned)
            {
                // Idempotent: already-granted codes are skipped.
                var toAdd = codes.Where(c => assignedSet.Add(c)).ToHashSet(StringComparer.Ordinal);

                if (toAdd.Count > 0)
                {
                    await companyMenuRepository.AddRangeAsync(
                        command.CdCompany,
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
                    savedCount += await companyMenuRepository.RemoveRangeAsync(
                        command.CdCompany,
                        toRemove,
                        cancellationToken);
                }
            }
        }

        // Every add/remove was tracked in the same change set: one atomic save.
        await companyMenuRepository.SaveChangesAsync(cancellationToken);

        return new SaveCompanyMenuResponse(savedCount);
    }
}
