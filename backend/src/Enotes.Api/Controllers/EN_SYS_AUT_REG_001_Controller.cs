using Enotes.Application.Features.CompanyMenu.DeleteCompanyMenu;
using Enotes.Application.Features.CompanyMenu.GetCompanyMenus;
using Enotes.Application.Features.CompanyMenu.SaveCompanyMenu;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Enotes.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class EN_SYS_AUT_REG_001_Controller : ControllerBase
{
    private readonly ISender _sender;

    public EN_SYS_AUT_REG_001_Controller(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("{cdCompany}")]
    public async Task<IActionResult> Get(
        string cdCompany,
        CancellationToken cancellationToken)
    {
        var query = new GetCompanyMenusQuery(cdCompany);
        var result = await _sender.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{cdCompany}/{cdMenu}")]
    public async Task<IActionResult> Delete(string cdCompany, string cdMenu, CancellationToken cancellationToken)
    {
        var command = new DeleteCompanyMenuCommand(cdCompany, cdMenu);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save(
        [FromBody] SaveCompanyMenuCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }
}
