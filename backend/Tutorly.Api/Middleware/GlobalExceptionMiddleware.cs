using System.Net;
using Tutorly.Shared;

namespace Tutorly.Api.Middleware;

public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UnauthorizedAccessException exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.Unauthorized, exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.NotFound, exception.Message);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            if (!context.Response.HasStarted)
            {
                context.Response.StatusCode = 499;
            }
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Unhandled API exception");
            await WriteErrorAsync(context, HttpStatusCode.InternalServerError, "An unexpected error occurred.");
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, HttpStatusCode statusCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;
        var response = ApiResponse<object>.Fail((int)statusCode, message);
        await context.Response.WriteAsJsonAsync(response);
    }
}
