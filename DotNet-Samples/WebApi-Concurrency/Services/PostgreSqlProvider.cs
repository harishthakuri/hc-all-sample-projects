namespace WebApi;

public class PostgreSqlProvider : IDatabaseProvider
{
    public string ProviderName => "PostgreSql";

    public string GetLockRowsForUpdateSql(string tableName, string whereClause)
    {
        // PostgreSQL uses FOR UPDATE clause
        // This acquires an exclusive row lock, preventing other transactions
        // from updating or deleting the locked rows
        // NOWAIT option can be added to avoid waiting: FOR UPDATE NOWAIT
        return $"SELECT * FROM {tableName} WHERE {whereClause} FOR UPDATE";
    }
}
