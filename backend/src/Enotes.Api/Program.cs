using Enotes.Application;
using Enotes.Application.Features.Auth.ChangePassword;
using Enotes.Application.Features.Auth.Login;
using Enotes.Application.Features.Employees.CreateEmployee;
using Enotes.Domain.Common;
using Enotes.Infrastructure;
using Enotes.Infrastructure.Auth;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;
using Scalar.AspNetCore;
using System.Net;
using System.Text.Json;

// Fix Npgsql DateTime Kind=Unspecified -> timestamptz issue
AppContext.SetSwitch("Npgsql.EnableDateTimeKindConverting", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddAuth(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-Api-Version"));
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwt.Issuer,
        ValidAudience = jwt.Audience,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(jwt.SecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();

// Allow the Vite dev server (and configured origins) to call the API.
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? new[] { "http://localhost:5173" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("EnotesClient", policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddProblemDetails();

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition =
        System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Global exception handler — returns ProblemDetails for all unhandled exceptions
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var exceptionHandlerFeature = context.Features.Get<IExceptionHandlerFeature>();
        var exception = exceptionHandlerFeature?.Error;

        var problemDetails = new ProblemDetails
        {
            Title = "An error occurred while processing your request.",
            Status = StatusCodes.Status500InternalServerError,
            Detail = exception?.Message,
            Instance = context.Request.Path,
        };

        // Map exception types to HTTP status codes
        if (exception is DomainException)
        {
            problemDetails.Status = StatusCodes.Status400BadRequest;
            problemDetails.Title = "Validation or business rule error.";
        }
        else if (exception is FluentValidation.ValidationException)
        {
            problemDetails.Status = StatusCodes.Status400BadRequest;
            problemDetails.Title = "Validation failed.";
            problemDetails.Extensions["errors"] = ((FluentValidation.ValidationException)exception).Errors
                .Select(e => new { e.PropertyName, e.ErrorMessage });
        }
        else if (exception is UnauthorizedAccessException)
        {
            problemDetails.Status = StatusCodes.Status401Unauthorized;
            problemDetails.Title = "Unauthorized.";
        }
        else if (exception is KeyNotFoundException)
        {
            problemDetails.Status = StatusCodes.Status404NotFound;
            problemDetails.Title = "Not found.";
        }

        context.Response.StatusCode = problemDetails.Status.Value;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsJsonAsync(problemDetails);
    });
});

app.UseCors("EnotesClient");

app.UseAuthentication();
app.UseMiddleware<RLSMiddleware>();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new { status = "ok", service = "ENOTES API" }));

app.MapPost("/api/auth/login", async (LoginCommand command, ISender sender) =>
{
    var response = await sender.Send(command);
    return Results.Ok(response);
});

app.MapPost("/api/employees", async (CreateEmployeeCommand command, ISender sender) =>
{
    var response = await sender.Send(command);
    return Results.Created($"/api/employees/{response.CdUser}", response);
});

app.MapPost("/api/auth/change-password", async (
    ChangePasswordCommand command,
    ISender sender) =>
{
    var response = await sender.Send(command);
    return Results.Ok(response);
})
.RequireAuthorization();

app.MapControllers().RequireAuthorization();

app.Run();
