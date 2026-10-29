using Enotes.Application.Features.Menu.DeleteMenu;
using Enotes.Application.Features.Menu.GetMenus;
using Enotes.Application.Features.Menu.SaveMenu;
using Enotes.Application.Features.Menu.UpdateMenu;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Enotes.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class MenusController : ControllerBase
{
    private readonly ISender _sender;

    public MenusController(ISender sender)
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
