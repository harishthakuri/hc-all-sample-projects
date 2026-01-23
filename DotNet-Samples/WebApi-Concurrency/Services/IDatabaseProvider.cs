namespace WebApi;

/// <summary>
/// Provides database provider-specific SQL queries and operations
/// </summary>
public interface IDatabaseProvider
{
    /// <summary>
    /// Gets the SQL query to lock rows for update
    /// </summary>
    string GetLockRowsForUpdateSql(string tableName, string whereClause);
    
    /// <summary>
    /// Gets the name of the database provider (SqlServer, PostgreSql, etc.)
    /// </summary>
    string ProviderName { get; }
}
