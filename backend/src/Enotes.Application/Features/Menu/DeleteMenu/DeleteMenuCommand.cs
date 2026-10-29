using MediatR;

namespace Enotes.Application.Features.Menu.DeleteMenu;

public sealed record DeleteMenuCommand(string CdMenu) : IRequest<DeleteMenuResponse>;

public sealed record DeleteMenuResponse(string CdMenu, string Message);
