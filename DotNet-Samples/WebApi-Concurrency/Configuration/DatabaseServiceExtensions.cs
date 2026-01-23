using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace WebApi.Configuration;

/// <summary>
/// Extension methods for configuring database services
/// </summary>
public static class DatabaseServiceExtensions
{
    /// <summary>
    /// Adds database services with configuration validation
    /// </summary>
    public static IServiceCollection AddDatabaseServices(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        // Register and validate DatabaseOptions
        services.AddOptions<DatabaseOptions>()
            .Bind(configuration.GetSection(DatabaseOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        // Register custom validator
        services.AddSingleton<IValidateOptions<DatabaseOptions>, DatabaseOptionsValidator>();

        // Get validated options for DbContext configuration
        var databaseOptions = configuration
            .GetSection(DatabaseOptions.SectionName)
            .Get<DatabaseOptions>();

        // Validate early - fail fast if configuration is invalid
        if (databaseOptions?.Provider is null)
        {
            var providerValue = configuration.GetValue<string>($"{DatabaseOptions.SectionName}:Provider");
            
            if (string.IsNullOrWhiteSpace(providerValue))
            {
                throw new InvalidOperationException(
                    "Database configuration is missing or invalid. " +
                    "Please ensure 'Database:Provider' is set to 'SqlServer' or 'PostgreSql' in appsettings.json");
            }
            
            throw new InvalidOperationException(
                $"Invalid database provider: '{providerValue}'. " +
                $"Supported providers are: {string.Join(", ", Enum.GetNames<DatabaseProvider>())}");
        }

        var connectionString = configuration.GetConnectionString(databaseOptions.ConnectionStringKey);
        
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                $"Connection string '{databaseOptions.ConnectionStringKey}' is not configured. " +
                $"Please add it to the 'ConnectionStrings' section in appsettings.json");
        }

        // Register DbContext with the appropriate provider
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            ConfigureDbContext(options, databaseOptions, connectionString);
        });

        // Register IDatabaseProvider
        services.AddSingleton<IDatabaseProvider>(_ => CreateDatabaseProvider(databaseOptions.Provider.Value));

        return services;
    }

    private static void ConfigureDbContext(
        DbContextOptionsBuilder options, 
        DatabaseOptions databaseOptions,
        string connectionString)
    {
        switch (databaseOptions.Provider)
        {
            case DatabaseProvider.SqlServer:
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: databaseOptions.MaxRetryCount,
                        maxRetryDelay: TimeSpan.FromSeconds(databaseOptions.MaxRetryDelaySeconds),
                        errorNumbersToAdd: null);
                    sqlOptions.CommandTimeout(databaseOptions.CommandTimeoutSeconds);
                });
                break;

            case DatabaseProvider.PostgreSql:
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: databaseOptions.MaxRetryCount,
                        maxRetryDelay: TimeSpan.FromSeconds(databaseOptions.MaxRetryDelaySeconds),
                        errorCodesToAdd: null);
                    npgsqlOptions.CommandTimeout(databaseOptions.CommandTimeoutSeconds);
                });
                break;

            default:
                throw new InvalidOperationException(
                    $"Unsupported database provider: {databaseOptions.Provider}");
        }
    }

    private static IDatabaseProvider CreateDatabaseProvider(DatabaseProvider provider)
    {
        return provider switch
        {
            DatabaseProvider.SqlServer => new SqlServerProvider(),
            DatabaseProvider.PostgreSql => new PostgreSqlProvider(),
            _ => throw new InvalidOperationException($"Unsupported database provider: {provider}")
        };
    }
}
