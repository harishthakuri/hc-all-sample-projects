using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using WebApiAndADONet.Domain.DTOs;
using WebApiAndADONet.Domain.Entities;

namespace WebApiAndADONet.Data.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly string _connectionString;
    private readonly ILogger<CustomerRepository> _logger;

    public CustomerRepository(IConfiguration configuration, ILogger<CustomerRepository> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        _logger = logger;
    }

    #region Helper Methods - Centralized Common Code

    /// <summary>
    /// Creates and opens a SQL connection
    /// </summary>
    private async Task<SqlConnection> CreateConnectionAsync()
    {
        var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }

    /// <summary>
    /// Creates a SQL command for a stored procedure
    /// </summary>
    private static SqlCommand CreateStoredProcedureCommand(string storedProcedureName, SqlConnection connection)
    {
        return new SqlCommand(storedProcedureName, connection)
        {
            CommandType = CommandType.StoredProcedure
        };
    }

    /// <summary>
    /// Adds a nullable string parameter to the command
    /// </summary>
    private static void AddNullableParameter(SqlCommand command, string parameterName, string? value, SqlDbType dbType = SqlDbType.NVarChar)
    {
        var parameter = command.Parameters.Add(parameterName, dbType);
        parameter.Value = (object?)value ?? DBNull.Value;
    }

    /// <summary>
    /// Executes a stored procedure with a reader and handles the result
    /// </summary>
    private async Task<T> ExecuteWithReaderAsync<T>(
        string storedProcedureName,
        Action<SqlCommand>? configureCommand,
        Func<SqlDataReader, Task<T>> processReader,
        string errorMessage)
    {
        try
        {
            await using var connection = await CreateConnectionAsync();
            await using var command = CreateStoredProcedureCommand(storedProcedureName, connection);
            
            configureCommand?.Invoke(command);
            
            await using var reader = await command.ExecuteReaderAsync();
            return await processReader(reader);
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, errorMessage);
            throw;
        }
    }


    /// <summary>
    /// Gets an output parameter value, handling null/DBNull cases
    /// </summary>
    private static T? GetOutputParameterValue<T>(SqlParameter parameter) where T : struct
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
    private static T? GetOutputParameterValueRef<T>(SqlParameter parameter) where T : class
    {
        if (parameter.Value == null || parameter.Value == DBNull.Value)
        {
            return null;
        }
        return (T)parameter.Value;
    }

    /// <summary>
    /// Adds customer DTO parameters to a command
    /// </summary>
    private static void AddCustomerDtoParameters(SqlCommand command, CreateCustomerDto dto)
    {
        command.Parameters.AddWithValue("@DisplayName", dto.DisplayName);
        AddNullableParameter(command, "@FirstName", dto.FirstName);
        AddNullableParameter(command, "@LastName", dto.LastName);
        AddNullableParameter(command, "@Email", dto.Email);
        AddNullableParameter(command, "@Phone", dto.Phone);
        command.Parameters.AddWithValue("@IsActive", dto.IsActive);
    }

    /// <summary>
    /// Adds customer update DTO parameters to a command
    /// </summary>
    private static void AddCustomerUpdateDtoParameters(SqlCommand command, int id, UpdateCustomerDto dto)
    {
        command.Parameters.AddWithValue("@Id", id);
        command.Parameters.AddWithValue("@DisplayName", dto.DisplayName);
        AddNullableParameter(command, "@FirstName", dto.FirstName);
        AddNullableParameter(command, "@LastName", dto.LastName);
        AddNullableParameter(command, "@Email", dto.Email);
        AddNullableParameter(command, "@Phone", dto.Phone);
        command.Parameters.AddWithValue("@IsActive", dto.IsActive);
    }

    #endregion

    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        return await ExecuteWithReaderAsync(
            storedProcedureName: "sp_GetAllCustomers",
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
            storedProcedureName: "sp_GetCustomerById",
            configureCommand: command => command.Parameters.AddWithValue("@Id", id),
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
        SqlParameter? newIdParam = null;
        SqlConnection? connection = null;
        SqlCommand? command = null;

        try
        {
            connection = await CreateConnectionAsync();
            command = CreateStoredProcedureCommand("sp_CreateCustomer", connection);
            
            AddCustomerDtoParameters(command, dto);
            newIdParam = new SqlParameter("@NewId", SqlDbType.Int)
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
        catch (SqlException ex)
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
            await using var command = CreateStoredProcedureCommand("sp_UpdateCustomer", connection);
            
            AddCustomerUpdateDtoParameters(command, id, dto);
            var rowsAffectedParam = new SqlParameter("@RowsAffected", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(rowsAffectedParam);

            await command.ExecuteNonQueryAsync();

            var rowsAffected = GetOutputParameterValue<int>(rowsAffectedParam);
            return rowsAffected.HasValue && rowsAffected.Value > 0;
        }
        catch (SqlException ex)
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
            await using var command = CreateStoredProcedureCommand("sp_DeleteCustomer", connection);
            
            command.Parameters.AddWithValue("@Id", id);
            var rowsAffectedParam = new SqlParameter("@RowsAffected", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(rowsAffectedParam);

            await command.ExecuteNonQueryAsync();

            var rowsAffected = GetOutputParameterValue<int>(rowsAffectedParam);
            return rowsAffected.HasValue && rowsAffected.Value > 0;
        }
        catch (SqlException ex)
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
            await using var command = CreateStoredProcedureCommand("sp_CustomerExists", connection);
            
            command.Parameters.AddWithValue("@Id", id);
            var existsParam = new SqlParameter("@Exists", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(existsParam);

            await command.ExecuteNonQueryAsync();

            var exists = GetOutputParameterValue<bool>(existsParam);
            return exists ?? false;
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, $"Error checking existence of customer with Id {id} in database");
            throw;
        }
    }

    private static Customer MapCustomerFromReader(SqlDataReader reader)
    {
        return Customer.FromDatabase(
            id: reader.GetInt32("Id"),
            displayName: reader.GetString("DisplayName"),
            firstName: reader.IsDBNull("FirstName") ? null : reader.GetString("FirstName"),
            lastName: reader.IsDBNull("LastName") ? null : reader.GetString("LastName"),
            email: reader.IsDBNull("Email") ? null : reader.GetString("Email"),
            phone: reader.IsDBNull("Phone") ? null : reader.GetString("Phone"),
            isActive: reader.GetBoolean("IsActive")
        );
    }
}
