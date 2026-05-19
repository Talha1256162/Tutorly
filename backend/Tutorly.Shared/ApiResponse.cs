namespace Tutorly.Shared;

public sealed record ApiResponse<T>(
    int HttpStatusCode,
    bool Success,
    string Message,
    int Count,
    T? Data,
    object? Error)
{
    public static ApiResponse<T> Ok(T data, string message = "Success", int? count = null)
    {
        var resolvedCount = count ?? (data is System.Collections.ICollection collection ? collection.Count : 1);
        return new ApiResponse<T>(200, true, message, resolvedCount, data, null);
    }

    public static ApiResponse<T> Created(T data, string message = "Created")
    {
        return new ApiResponse<T>(201, true, message, 1, data, null);
    }

    public static ApiResponse<T> Fail(int statusCode, string message, object? error = null)
    {
        return new ApiResponse<T>(statusCode, false, message, 0, default, error);
    }
}
