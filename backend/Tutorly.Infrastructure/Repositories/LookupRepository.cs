using Dapper;
using Tutorly.Application;
using Tutorly.Domain;
using Tutorly.Infrastructure.Data;

namespace Tutorly.Infrastructure.Repositories;

public sealed class LookupRepository : ILookupRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public LookupRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyDictionary<string, IReadOnlyList<LookupValue>>> GetLookupMapAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            select
                lv.Id,
                lv.LookupGroupId,
                lg.Code as GroupCode,
                lv.Code,
                lv.Name,
                lv.SortOrder,
                lv.IsActive
            from lookupValues lv
            inner join lookupGroups lg on lg.Id = lv.LookupGroupId
            where lv.IsActive = 1 and lg.IsActive = 1
            order by lg.Code, lv.SortOrder, lv.Name;
            """;

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<LookupValue>(new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows
            .GroupBy(row => row.GroupCode)
            .ToDictionary(group => group.Key, group => (IReadOnlyList<LookupValue>)group.ToArray());
    }

    public async Task<IReadOnlyList<PlatformSetting>> GetPlatformSettingsAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            select [Key], [Value], ValueType, Description
            from platformSettings
            where IsActive = 1
            order by [Key];
            """;

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync<PlatformSetting>(new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows.ToArray();
    }
}
