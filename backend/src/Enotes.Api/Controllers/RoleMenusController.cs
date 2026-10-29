using Enotes.Application.Features.RoleMenu.DeleteRoleMenu;
using Enotes.Application.Features.RoleMenu.GetRoleMenus;
using Enotes.Application.Features.RoleMenu.SaveRoleMenu;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Enotes.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class RoleMenusController : ControllerBase
{
    private readonly ISender _sender;

    public RoleMenusController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> Get(string? search, CancellationToken cancellationToken)
    {
        var query = new GetRoleMenusQuery(search);
        var result = await _sender.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{fgRole}/{cdMenu}")]
    public async Task<IActionResult> Delete(string fgRole, string cdMenu, CancellationToken cancellationToken)
    {
        var command = new DeleteRoleMenuCommand(fgRole, cdMenu);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save(
        [FromBody] SaveRoleMenuCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }
}
