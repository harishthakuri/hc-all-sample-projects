namespace WebApi;

public class SqlServerProvider : IDatabaseProvider
{
    public string ProviderName => "SqlServer";

    public string GetLockRowsForUpdateSql(string tableName, string whereClause)
    {
        // SQL Server uses WITH (UPDLOCK, ROWLOCK) hints
        // UPDLOCK: Prevents other transactions from acquiring update/exclusive locks
        // ROWLOCK: Lock at row level for better concurrency
        return $"SELECT * FROM {tableName} WITH (UPDLOCK, ROWLOCK) WHERE {whereClause}";
    }
}
