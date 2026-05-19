namespace Tutorly.Infrastructure.Repositories;

internal static class SqlMapping
{
    public static string[] SplitList(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? Array.Empty<string>()
            : value.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }
}
