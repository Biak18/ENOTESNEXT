using Enotes.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Enotes.Infrastructure.Auth;

public sealed class RLSMiddleware
{
    private readonly RequestDelegate _next;

    public RLSMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
    {
        if (context.User.Identity is { IsAuthenticated: true })
        {
            var companyId = context.User.FindFirst("cd_com")?.Value;
            if (!string.IsNullOrEmpty(companyId))
            {
                await dbContext.Database.ExecuteSqlRawAsync(
                    "SELECT set_config('app.current_company', {0}, true)",
                    companyId);
            }
        }

        await _next(context);
    }
}
