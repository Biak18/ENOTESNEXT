using Enotes.Application.Common;
using Enotes.Domain.Common;
using Enotes.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Enotes.Application.Features.Menu.SaveMenu;

public sealed class SaveMenuHandler(
    IMenuRepository menuRepository,
    ICompanyMenuRepository companyMenuRepository,
    IUserMenuRepository userMenuRepository,
    IRoleMenuRepository roleMenuRepository,
    IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<SaveMenuCommand, SaveMenuResponse>
{
    public async Task<SaveMenuResponse> Handle(
        SaveMenuCommand command,
        CancellationToken cancellationToken)
    {
        var userContext = httpContextAccessor.HttpContext?.User;
        var cdCompany = userContext?.FindFirst("cd_com")?.Value;
        var cdUser = userContext?.FindFirst("cd_user")?.Value;
        var fgRole = userContext?.FindFirst(ClaimTypes.Role)?.Value;

        var savedCount = 0;
        var newMenus = new List<(SysMenu Menu, string? CoCompany, string? CuUser, string? FrRole)>();

        foreach (var item in command.Items)
        {
            switch (item.State?.ToUpperInvariant())
            {
                case "ADDED":
                case "INSERT":
                case "I":
                {
                    var menu = SysMenu.Create(
                        item.CdMenu,
                        item.NmMenu,
                        item.NmNetwindow,
                        item.CdModule,
                        item.NoPos,
                        item.CdMenuParent);

                    await menuRepository.AddAsync(menu, cancellationToken);
                    newMenus.Add((menu, cdCompany, cdUser, fgRole));
                    savedCount++;
                    break;
                }

                case "MODIFIED":
                case "UPDATE":
                case "U":
                {
                    var existing = await menuRepository.GetByIdAsync(
                        item.CdMenu,
                        cancellationToken)
                        ?? throw new DomainException("Menu not found: " + item.CdMenu);

                    existing.Update(
                        item.NmMenu,
                        item.NmNetwindow,
                        item.FgType,
                        item.CdModule,
                        item.NoPos,
                        item.CdMenuParent);

                    menuRepository.Update(existing);
                    savedCount++;
                    break;
                }

                case "DELETED":
                case "DELETE":
                case "D":
                {
                    await menuRepository.DeleteAsync(item.CdMenu, cancellationToken);
                    savedCount++;
                    break;
                }
            }
        }

        // Save menus first so they exist in sys_menu before any related
        // company/user/role menu assignments reference them (FK constraint).
        await menuRepository.SaveChangesAsync(cancellationToken);

        // Grant the new menus to the creator's company/user/role.
        foreach (var (menu, coCompany, cuUser, frRole) in newMenus)
        {
            if (!string.IsNullOrEmpty(coCompany))
            {
                await companyMenuRepository.AssignAsync(
                    coCompany,
                    menu.CdMenu,
                    cancellationToken);

                if (!string.IsNullOrEmpty(cuUser)
                    && !await userMenuRepository.ExistsAsync(
                        coCompany, cuUser, menu.CdMenu, cancellationToken))
                {
                    await userMenuRepository.AddAsync(
                        coCompany, cuUser, menu.CdMenu, "A", cancellationToken);
                }
            }

            if (!string.IsNullOrEmpty(frRole)
                && !await roleMenuRepository.ExistsAsync(
                    frRole, menu.CdMenu, cancellationToken))
            {
                await roleMenuRepository.AddAsync(
                    SysRoleMenu.Create(frRole, menu.CdMenu),
                    cancellationToken);
            }
        }

        await menuRepository.SaveChangesAsync(cancellationToken);

        return new SaveMenuResponse(savedCount);
    }
}
