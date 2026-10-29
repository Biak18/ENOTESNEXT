using MediatR;

namespace Enotes.Application.Features.Employees.CreateEmployee;

public sealed record CreateEmployeeCommand(
    string CdCom,
    string CdUser,
    string Password,
    string NmUser,
    string? DcEmail,
    string? DcAddress1,
    string? DcAddress2,
    string? NoTel,
    string? FgRole,
    string DtReg) : IRequest<CreateEmployeeResponse>;
