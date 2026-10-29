using Enotes.Application.Features.UserMenu.DeleteUserMenu;
using Enotes.Application.Features.UserMenu.GetUserMenus;
using Enotes.Application.Features.UserMenu.SaveUserMenu;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Enotes.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class EN_SYS_AUT_REG_003_Controller : ControllerBase
{
    private readonly ISender _sender;

    public EN_SYS_AUT_REG_003_Controller(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> Get(string cdCompany, string? cdUser, CancellationToken cancellationToken)
    {
        var query = new GetUserMenusQuery(cdCompany, cdUser);
        var result = await _sender.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{cdCompany}/{cdUser}/{cdMenu}")]
    public async Task<IActionResult> Delete(string cdCompany, string cdUser, string cdMenu, CancellationToken cancellationToken)
    {
        var command = new DeleteUserMenuCommand(cdCompany, cdUser, cdMenu);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save(
        [FromBody] SaveUserMenuCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }
}
