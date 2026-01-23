using System.Data;
using Npgsql;
using NpgsqlTypes;
using Microsoft.Extensions.Configuration;
using WebApiAndADONet.Domain.DTOs;
using WebApiAndADONet.Domain.Entities;

namespace WebApiAndADONet.Data.Repositories;

/// <summary>
/// PostgreSQL implementation of ICustomerRepository using ADO.NET
/// Note: PostgreSQL uses snake_case column naming convention (id, display_name, etc.)
/// </summary>
public class PostgreSqlCustomerRepository : ICustomerRepository
{
    private readonly string _connectionString;
    private readonly ILogger<PostgreSqlCustomerRepository> _logger;

    public PostgreSqlCustomerRepository(IConfiguration configuration, ILogger<PostgreSqlCustomerRepository> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        _logger = logger;
    }

    #region Helper Methods - Centralized Common Code

    /// <summary>
    /// Creates and opens a PostgreSQL connection
    /// </summary>
    private async Task<NpgsqlConnection> CreateConnectionAsync()
    {
        var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }

    /// <summary>
    /// Creates a PostgreSQL command for a function (PostgreSQL equivalent of stored procedure)
    /// </summary>
    private static NpgsqlCommand CreateFunctionCommand(string functionName, NpgsqlConnection connection)
    {
        return new NpgsqlCommand(functionName, connection)
        {
            CommandType = CommandType.StoredProcedure
        };
    }

    /// <summary>
    /// Adds a nullable string parameter to the command
    /// </summary>
    private static void AddNullableParameter(NpgsqlCommand command, string parameterName, string? value, NpgsqlDbType dbType = NpgsqlDbType.Varchar)
    {
        var parameter = command.Parameters.Add(parameterName, dbType);
        parameter.Value = (object?)value ?? DBNull.Value;
    }

    /// <summary>
    /// Executes a function with a reader and handles the result
    /// </summary>
    private async Task<T> ExecuteWithReaderAsync<T>(
        string functionName,
        Action<NpgsqlCommand>? configureCommand,
        Func<NpgsqlDataReader, Task<T>> processReader,
        string errorMessage)
    {
        try
        {
            await using var connection = await CreateConnectionAsync();
            await using var command = CreateFunctionCommand(functionName, connection);
            
            configureCommand?.Invoke(command);
            
            await using var reader = await command.ExecuteReaderAsync();
            return await processReader(reader);
        }
        catch (PostgresException ex)
        {
            _logger.LogError(ex, errorMessage);
            throw;
        }
    }


    /// <summary>
    /// Gets an output parameter value, handling null/DBNull cases
    /// </summary>
    private static T? GetOutputParameterValue<T>(NpgsqlParameter parameter) where T : struct
    {
        if (parameter.Value == null || parameter.Value == DBNull.Value)
        {
            return null;
        }
        return (T)parameter.Value;
    }

    /// <summary>
    /// Gets an output parameter value for reference types
    /// </summary>
    private static T? GetOutputParameterValueRef<T>(NpgsqlParameter parameter) where T : class
    {
        if (parameter.Value == null || parameter.Value == DBNull.Value)
        {
            return null;
        }
        return (T)parameter.Value;
    }

    /// <summary>
    /// Adds customer DTO parameters to a command
    /// Note: PostgreSQL function parameters use p_ prefix with snake_case naming
    /// </summary>
    private static void AddCustomerDtoParameters(NpgsqlCommand command, CreateCustomerDto dto)
    {
        command.Parameters.AddWithValue("@p_display_name", dto.DisplayName);
        AddNullableParameter(command, "@p_first_name", dto.FirstName);
        AddNullableParameter(command, "@p_last_name", dto.LastName);
        AddNullableParameter(command, "@p_email", dto.Email);
        AddNullableParameter(command, "@p_phone", dto.Phone);
        command.Parameters.AddWithValue("@p_is_active", dto.IsActive);
    }

    /// <summary>
    /// Adds customer update DTO parameters to a command
    /// Note: PostgreSQL function parameters use p_ prefix with snake_case naming
    /// </summary>
    private static void AddCustomerUpdateDtoParameters(NpgsqlCommand command, int id, UpdateCustomerDto dto)
    {
        command.Parameters.AddWithValue("@p_id", id);
        command.Parameters.AddWithValue("@p_display_name", dto.DisplayName);
        AddNullableParameter(command, "@p_first_name", dto.FirstName);
        AddNullableParameter(command, "@p_last_name", dto.LastName);
        AddNullableParameter(command, "@p_email", dto.Email);
        AddNullableParameter(command, "@p_phone", dto.Phone);
        command.Parameters.AddWithValue("@p_is_active", dto.IsActive);
    }

    #endregion

    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        return await ExecuteWithReaderAsync(
            functionName: "sp_getallcustomers",
            configureCommand: null,
            processReader: async reader =>
            {
                var customers = new List<Customer>();
                while (await reader.ReadAsync())
                {
                    customers.Add(MapCustomerFromReader(reader));
                }
                return customers;
            },
            errorMessage: "Error retrieving all customers from database"
        );
    }

    public async Task<Customer?> GetByIdAsync(int id)
    {
        return await ExecuteWithReaderAsync(
            functionName: "sp_getcustomerbyid",
            configureCommand: command => command.Parameters.AddWithValue("@p_id", id),
            processReader: async reader =>
            {
                if (await reader.ReadAsync())
                {
                    return MapCustomerFromReader(reader);
                }
                return null;
            },
            errorMessage: $"Error retrieving customer with Id {id} from database"
        );
    }

    public async Task<Customer> CreateAsync(CreateCustomerDto dto)
    {
        NpgsqlParameter? newIdParam = null;
        NpgsqlConnection? connection = null;
        NpgsqlCommand? command = null;

        try
        {
            connection = await CreateConnectionAsync();
            command = CreateFunctionCommand("sp_createcustomer", connection);
            
            AddCustomerDtoParameters(command, dto);
            newIdParam = new NpgsqlParameter("@p_new_id", NpgsqlDbType.Integer)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(newIdParam);

            await command.ExecuteNonQueryAsync();

            var newId = GetOutputParameterValue<int>(newIdParam);
            if (!newId.HasValue || newId.Value <= 0)
            {
                throw new InvalidOperationException("Failed to retrieve the ID of the newly created customer.");
            }

            var customer = Customer.FromCreateDto(dto);
            customer.SetId(newId.Value);
            return customer;
        }
        catch (PostgresException ex)
        {
            _logger.LogError(ex, "Error creating customer in database");
            throw;
        }
        finally
        {
            command?.Dispose();
            connection?.Dispose();
        }
    }

    public async Task<bool> UpdateAsync(int id, UpdateCustomerDto dto)
    {
        try
        {
            await using var connection = await CreateConnectionAsync();
            await using var command = CreateFunctionCommand("sp_updatecustomer", connection);
            
            AddCustomerUpdateDtoParameters(command, id, dto);
            var rowsAffectedParam = new NpgsqlParameter("@p_rows_affected", NpgsqlDbType.Integer)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(rowsAffectedParam);

            await command.ExecuteNonQueryAsync();

            var rowsAffected = GetOutputParameterValue<int>(rowsAffectedParam);
            return rowsAffected.HasValue && rowsAffected.Value > 0;
        }
        catch (PostgresException ex)
        {
            _logger.LogError(ex, $"Error updating customer with Id {id} in database");
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            await using var connection = await CreateConnectionAsync();
            await using var command = CreateFunctionCommand("sp_deletecustomer", connection);
            
            command.Parameters.AddWithValue("@p_id", id);
            var rowsAffectedParam = new NpgsqlParameter("@p_rows_affected", NpgsqlDbType.Integer)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(rowsAffectedParam);

            await command.ExecuteNonQueryAsync();

            var rowsAffected = GetOutputParameterValue<int>(rowsAffectedParam);
            return rowsAffected.HasValue && rowsAffected.Value > 0;
        }
        catch (PostgresException ex)
        {
            _logger.LogError(ex, $"Error deleting customer with Id {id} from database");
            throw;
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        try
        {
            await using var connection = await CreateConnectionAsync();
            await using var command = CreateFunctionCommand("sp_customerexists", connection);
            
            command.Parameters.AddWithValue("@p_id", id);
            var existsParam = new NpgsqlParameter("@p_exists", NpgsqlDbType.Boolean)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(existsParam);

            await command.ExecuteNonQueryAsync();

            var exists = GetOutputParameterValue<bool>(existsParam);
            return exists ?? false;
        }
        catch (PostgresException ex)
        {
            _logger.LogError(ex, $"Error checking existence of customer with Id {id} in database");
            throw;
        }
    }

    /// <summary>
    /// Maps database reader to Customer entity
    /// Note: PostgreSQL uses snake_case column names (id, display_name, etc.)
    /// </summary>
    private static Customer MapCustomerFromReader(NpgsqlDataReader reader)
    {
        return Customer.FromDatabase(
            id: reader.GetInt32("id"),
            displayName: reader.GetString("display_name"),
            firstName: reader.IsDBNull("first_name") ? null : reader.GetString("first_name"),
            lastName: reader.IsDBNull("last_name") ? null : reader.GetString("last_name"),
            email: reader.IsDBNull("email") ? null : reader.GetString("email"),
            phone: reader.IsDBNull("phone") ? null : reader.GetString("phone"),
            isActive: reader.GetBoolean("is_active")
        );
    }
}
