using Microsoft.Extensions.Options;

namespace WebApi.Configuration;

/// <summary>
/// Validates DatabaseOptions at startup and whenever options are accessed
/// </summary>
public class DatabaseOptionsValidator : IValidateOptions<DatabaseOptions>
{
    private readonly IConfiguration _configuration;

    public DatabaseOptionsValidator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public ValidateOptionsResult Validate(string? name, DatabaseOptions options)
    {
        var errors = new List<string>();

        // Check if Database section exists
        var databaseSection = _configuration.GetSection(DatabaseOptions.SectionName);
        if (!databaseSection.Exists())
        {
            errors.Add($"Configuration section '{DatabaseOptions.SectionName}' is missing. " +
                       "Please add a 'Database' section to your appsettings.json");
        }

        // Check if Provider is configured
        if (options.Provider is null)
        {
            var providerValue = _configuration.GetValue<string>($"{DatabaseOptions.SectionName}:Provider");
            
            if (string.IsNullOrWhiteSpace(providerValue))
            {
                errors.Add("Database provider is not configured. " +
                           "Please set 'Database:Provider' to 'SqlServer' or 'PostgreSql'");
            }
            else
            {
                errors.Add($"Invalid database provider: '{providerValue}'. " +
                           $"Supported providers are: {string.Join(", ", Enum.GetNames<DatabaseProvider>())}");
            }
        }

        // Validate connection string exists for the configured provider
        if (options.Provider is not null)
        {
            var connectionString = _configuration.GetConnectionString(options.ConnectionStringKey);
            
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                errors.Add($"Connection string '{options.ConnectionStringKey}' is not configured for provider '{options.Provider}'. " +
                           $"Please add 'ConnectionStrings:{options.ConnectionStringKey}' to your appsettings.json");
            }
        }

        // Validate numeric ranges
        if (options.MaxRetryCount < 0 || options.MaxRetryCount > 10)
        {
            errors.Add($"MaxRetryCount must be between 0 and 10. Current value: {options.MaxRetryCount}");
        }

        if (options.MaxRetryDelaySeconds < 1 || options.MaxRetryDelaySeconds > 60)
        {
            errors.Add($"MaxRetryDelaySeconds must be between 1 and 60. Current value: {options.MaxRetryDelaySeconds}");
        }

        if (options.CommandTimeoutSeconds < 5 || options.CommandTimeoutSeconds > 300)
        {
            errors.Add($"CommandTimeoutSeconds must be between 5 and 300. Current value: {options.CommandTimeoutSeconds}");
        }

        return errors.Count > 0
            ? ValidateOptionsResult.Fail(errors)
            : ValidateOptionsResult.Success;
    }
}
