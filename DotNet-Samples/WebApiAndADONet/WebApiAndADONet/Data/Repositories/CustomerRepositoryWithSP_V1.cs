using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using WebApiAndADONet.Domain.DTOs;
using WebApiAndADONet.Domain.Entities;

namespace WebApiAndADONet.Data.Repositories;

public class CustomerRepositoryWithSP_V1 : ICustomerRepository
{
    private readonly string _connectionString;
    private readonly ILogger<CustomerRepositoryWithSP_V1> _logger;

    public CustomerRepositoryWithSP_V1(IConfiguration configuration, ILogger<CustomerRepositoryWithSP_V1> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        _logger = logger;
    }

    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        const string storedProcedure = "sp_GetAllCustomers";
        var customers = new List<Customer>();

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(storedProcedure, connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                customers.Add(MapCustomerFromReader(reader));
            }
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error retrieving all customers from database");
            throw;
        }

        return customers;
    }

    public async Task<Customer?> GetByIdAsync(int id)
    {
        const string storedProcedure = "sp_GetCustomerById";

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(storedProcedure, connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.AddWithValue("@Id", id);

            await using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return MapCustomerFromReader(reader);
            }
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error retrieving customer with Id {CustomerId} from database", id);
            throw;
        }

        return null;
    }

    public async Task<Customer> CreateAsync(CreateCustomerDto dto)
    {
        const string storedProcedure = "sp_CreateCustomer";

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(storedProcedure, connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@DisplayName", dto.DisplayName);
            command.Parameters.Add("@FirstName", SqlDbType.NVarChar).Value = (object?)dto.FirstName ?? DBNull.Value;
            command.Parameters.Add("@LastName", SqlDbType.NVarChar).Value = (object?)dto.LastName ?? DBNull.Value;
            command.Parameters.Add("@Email", SqlDbType.NVarChar).Value = (object?)dto.Email ?? DBNull.Value;
            command.Parameters.Add("@Phone", SqlDbType.NVarChar).Value = (object?)dto.Phone ?? DBNull.Value;
            command.Parameters.AddWithValue("@IsActive", dto.IsActive);

            var newIdParam = new SqlParameter("@NewId", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(newIdParam);

            await command.ExecuteNonQueryAsync();

            if (newIdParam.Value == null || newIdParam.Value == DBNull.Value)
            {
                throw new InvalidOperationException("Failed to retrieve the ID of the newly created customer.");
            }

            var newId = (int)newIdParam.Value;
            if (newId <= 0)
            {
                throw new InvalidOperationException("Invalid customer ID returned from database.");
            }

            var customer = Customer.FromCreateDto(dto);
            customer.SetId(newId);

            return customer;
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error creating customer in database");
            throw;
        }
    }

    public async Task<bool> UpdateAsync(int id, UpdateCustomerDto dto)
    {
        const string storedProcedure = "sp_UpdateCustomer";

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(storedProcedure, connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@Id", id);
            command.Parameters.AddWithValue("@DisplayName", dto.DisplayName);
            command.Parameters.Add("@FirstName", SqlDbType.NVarChar).Value = (object?)dto.FirstName ?? DBNull.Value;
            command.Parameters.Add("@LastName", SqlDbType.NVarChar).Value = (object?)dto.LastName ?? DBNull.Value;
            command.Parameters.Add("@Email", SqlDbType.NVarChar).Value = (object?)dto.Email ?? DBNull.Value;
            command.Parameters.Add("@Phone", SqlDbType.NVarChar).Value = (object?)dto.Phone ?? DBNull.Value;
            command.Parameters.AddWithValue("@IsActive", dto.IsActive);

            var rowsAffectedParam = new SqlParameter("@RowsAffected", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(rowsAffectedParam);

            await command.ExecuteNonQueryAsync();

            if (rowsAffectedParam.Value == null || rowsAffectedParam.Value == DBNull.Value)
            {
                return false;
            }

            var rowsAffected = (int)rowsAffectedParam.Value;
            return rowsAffected > 0;
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error updating customer with Id {CustomerId} in database", id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string storedProcedure = "sp_DeleteCustomer";

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(storedProcedure, connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@Id", id);

            var rowsAffectedParam = new SqlParameter("@RowsAffected", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(rowsAffectedParam);

            await command.ExecuteNonQueryAsync();

            if (rowsAffectedParam.Value == null || rowsAffectedParam.Value == DBNull.Value)
            {
                return false;
            }

            var rowsAffected = (int)rowsAffectedParam.Value;
            return rowsAffected > 0;
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error deleting customer with Id {CustomerId} from database", id);
            throw;
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        const string storedProcedure = "sp_CustomerExists";

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(storedProcedure, connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@Id", id);

            var existsParam = new SqlParameter("@Exists", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(existsParam);

            await command.ExecuteNonQueryAsync();

            if (existsParam.Value == null || existsParam.Value == DBNull.Value)
            {
                return false;
            }

            return (bool)existsParam.Value;
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error checking existence of customer with Id {CustomerId} in database", id);
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
