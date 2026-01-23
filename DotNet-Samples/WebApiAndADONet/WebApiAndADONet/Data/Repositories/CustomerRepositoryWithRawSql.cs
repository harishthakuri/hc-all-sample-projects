using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using WebApiAndADONet.Domain.DTOs;
using WebApiAndADONet.Domain.Entities;

namespace WebApiAndADONet.Data.Repositories;

public class CustomerRepositoryWithRawSql : ICustomerRepository
{
    private readonly string _connectionString;
    private readonly ILogger<CustomerRepositoryWithRawSql> _logger;

    public CustomerRepositoryWithRawSql(IConfiguration configuration, ILogger<CustomerRepositoryWithRawSql> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        _logger = logger;
    }

    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        const string sql = @"
            SELECT Id, DisplayName, FirstName, LastName, Email, Phone, IsActive
            FROM Customers
            ORDER BY Id";

        var customers = new List<Customer>();

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(sql, connection);
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
        const string sql = @"
            SELECT Id, DisplayName, FirstName, LastName, Email, Phone, IsActive
            FROM Customers
            WHERE Id = @Id";

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(sql, connection);
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
        const string sql = @"
            INSERT INTO Customers (DisplayName, FirstName, LastName, Email, Phone, IsActive)
            OUTPUT INSERTED.Id
            VALUES (@DisplayName, @FirstName, @LastName, @Email, @Phone, @IsActive)";

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@DisplayName", dto.DisplayName);
            command.Parameters.Add("@FirstName", SqlDbType.NVarChar).Value = (object?)dto.FirstName ?? DBNull.Value;
            command.Parameters.Add("@LastName", SqlDbType.NVarChar).Value = (object?)dto.LastName ?? DBNull.Value;
            command.Parameters.Add("@Email", SqlDbType.NVarChar).Value = (object?)dto.Email ?? DBNull.Value;
            command.Parameters.Add("@Phone", SqlDbType.NVarChar).Value = (object?)dto.Phone ?? DBNull.Value;
            command.Parameters.AddWithValue("@IsActive", dto.IsActive);

            var result = await command.ExecuteScalarAsync();
            if (result == null)
            {
                throw new InvalidOperationException("Failed to retrieve the ID of the newly created customer.");
            }

            var newId = (int)result;
            
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
        const string sql = @"
            UPDATE Customers
            SET DisplayName = @DisplayName,
                FirstName = @FirstName,
                LastName = @LastName,
                Email = @Email,
                Phone = @Phone,
                IsActive = @IsActive
            WHERE Id = @Id";

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Id", id);
            command.Parameters.AddWithValue("@DisplayName", dto.DisplayName);
            command.Parameters.Add("@FirstName", SqlDbType.NVarChar).Value = (object?)dto.FirstName ?? DBNull.Value;
            command.Parameters.Add("@LastName", SqlDbType.NVarChar).Value = (object?)dto.LastName ?? DBNull.Value;
            command.Parameters.Add("@Email", SqlDbType.NVarChar).Value = (object?)dto.Email ?? DBNull.Value;
            command.Parameters.Add("@Phone", SqlDbType.NVarChar).Value = (object?)dto.Phone ?? DBNull.Value;
            command.Parameters.AddWithValue("@IsActive", dto.IsActive);

            var rowsAffected = await command.ExecuteNonQueryAsync();
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
        const string sql = "DELETE FROM Customers WHERE Id = @Id";

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Id", id);

            var rowsAffected = await command.ExecuteNonQueryAsync();
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
        const string sql = "SELECT COUNT(1) FROM Customers WHERE Id = @Id";

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Id", id);

            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt32(result) > 0;
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
