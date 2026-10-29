using Enotes.Application.Features.User.DeleteUser;
using Enotes.Application.Features.User.GetUsers;
using Enotes.Application.Features.User.SaveUser;
using Enotes.Application.Features.User.UpdateUser;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Enotes.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class EN_SYS_BAS_REG_001_Controller : ControllerBase
{
    private readonly ISender _sender;

    public EN_SYS_BAS_REG_001_Controller(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> Get(string? search, CancellationToken cancellationToken)
    {
        var query = new GetUsersQuery(search);
        var result = await _sender.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpPut("{cdCom}/{cdUser}")]
    public async Task<IActionResult> Update(string cdCom, string cdUser, [FromBody] UpdateUserCommand command, CancellationToken cancellationToken)
    {
        if (cdCom != command.CdCom || cdUser != command.CdUser)
            return BadRequest("User key mismatch.");

        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{cdCom}/{cdUser}")]
    public async Task<IActionResult> Delete(string cdCom, string cdUser, CancellationToken cancellationToken)
    {
        var command = new DeleteUserCommand(cdCom, cdUser);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] SaveUserCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }
}
