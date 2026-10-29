using Enotes.Application.Features.Company.DeleteCompany;
using Enotes.Application.Features.Company.GetCompanies;
using Enotes.Application.Features.Company.SaveCompany;
using Enotes.Application.Features.Company.UpdateCompany;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Enotes.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class EN_MAS_ORG_REG_001_Controller : ControllerBase
{
    private readonly ISender _sender;

    public EN_MAS_ORG_REG_001_Controller(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> Get(string? search, CancellationToken cancellationToken)
    {
        var query = new GetCompaniesQuery(search);
        var result = await _sender.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpPut("{cdCompany}")]
    public async Task<IActionResult> Update(string cdCompany, [FromBody] UpdateCompanyCommand command, CancellationToken cancellationToken)
    {
        if (cdCompany != command.CdCompany)
            return BadRequest("Company code mismatch.");

        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{cdCompany}")]
    public async Task<IActionResult> Delete(string cdCompany, CancellationToken cancellationToken)
    {
        var command = new DeleteCompanyCommand(cdCompany);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] SaveCompanyCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }
}
