using Enotes.Application.Features.Menu.DeleteMenu;
using Enotes.Application.Features.Menu.GetMenus;
using Enotes.Application.Features.Menu.SaveMenu;
using Enotes.Application.Features.Menu.UpdateMenu;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Enotes.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
// Literal route (no [controller] token): the screen-id path is exactly
// /api/v1/EN_SYS_MENU_REG_001 for the manual callApi/fnGetDataSet endpoint.
[Route("api/v{version:apiVersion}/EN_SYS_MENU_REG_001")]
public class EN_SYS_MENU_REG_001_Controller : ControllerBase
{
    private readonly ISender _sender;

    public EN_SYS_MENU_REG_001_Controller(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> Get(string? search, CancellationToken cancellationToken)
    {
        var query = new GetMenusQuery(search);
        var result = await _sender.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpPut("{cdMenu}")]
    public async Task<IActionResult> Update(string cdMenu, [FromBody] UpdateMenuCommand command, CancellationToken cancellationToken)
    {
        if (cdMenu != command.CdMenu)
            return BadRequest("Menu code mismatch.");

        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{cdMenu}")]
    public async Task<IActionResult> Delete(string cdMenu, CancellationToken cancellationToken)
    {
        var command = new DeleteMenuCommand(cdMenu);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] SaveMenuCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }
}
