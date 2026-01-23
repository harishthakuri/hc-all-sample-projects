using System.ComponentModel.DataAnnotations;

namespace WebApi.Configuration;

/// <summary>
/// Supported database providers
/// </summary>
public enum DatabaseProvider
{
    SqlServer,
    PostgreSql
}

/// <summary>
/// Configuration options for database connectivity
/// </summary>
public class DatabaseOptions
{
    /// <summary>
    /// Configuration section name in appsettings.json
    /// </summary>
    public const string SectionName = "Database";

    /// <summary>
    /// The database provider to use (SqlServer or PostgreSql)
    /// </summary>
    [Required(ErrorMessage = "Database provider is required")]
    public DatabaseProvider? Provider { get; set; }

    /// <summary>
    /// Maximum retry count for transient failures
    /// </summary>
    [Range(0, 10, ErrorMessage = "MaxRetryCount must be between 0 and 10")]
    public int MaxRetryCount { get; set; } = 3;

    /// <summary>
    /// Maximum delay between retries in seconds
    /// </summary>
    [Range(1, 60, ErrorMessage = "MaxRetryDelaySeconds must be between 1 and 60")]
    public int MaxRetryDelaySeconds { get; set; } = 5;

    /// <summary>
    /// Command timeout in seconds
    /// </summary>
    [Range(5, 300, ErrorMessage = "CommandTimeoutSeconds must be between 5 and 300")]
    public int CommandTimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Gets the normalized provider name for comparison
    /// </summary>
    public string ProviderName => Provider?.ToString() ?? string.Empty;

    /// <summary>
    /// Gets the connection string key based on the provider
    /// </summary>
    public string ConnectionStringKey => Provider switch
    {
        DatabaseProvider.SqlServer => "SqlServerConnection",
        DatabaseProvider.PostgreSql => "PostgreSqlConnection",
        _ => throw new InvalidOperationException($"Unknown provider: {Provider}")
    };
}
