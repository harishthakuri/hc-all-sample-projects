using System.Data;
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;
using Microsoft.Data.SqlClient;
using WebApiAndADONet.Domain.DTOs;

namespace WebApiAndADONet.Benchmarks.Benchmarks;

/// <summary>
/// Benchmarks for parameter creation methods used in repository operations.
/// Parameter creation happens on every database operation, so efficiency matters.
/// </summary>
[MemoryDiagnoser]
[SimpleJob(RuntimeMoniker.Net80)]
public class ParameterCreationBenchmarks
{
    private CreateCustomerDto _createDto = null!;
    private UpdateCustomerDto _updateDto = null!;

    [GlobalSetup]
    public void Setup()
    {
        _createDto = new CreateCustomerDto
        {
            DisplayName = "Test Customer",
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Phone = "555-1234",
            IsActive = true
        };

        _updateDto = new UpdateCustomerDto
        {
            DisplayName = "Updated Customer",
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane.smith@example.com",
            Phone = "555-5678",
            IsActive = false
        };
    }

    /// <summary>
    /// Current implementation using AddWithValue (convenient but less optimal).
    /// </summary>
    [Benchmark(Baseline = true)]
    public void AddCustomerDtoParameters_AddWithValue()
    {
        using var connection = new SqlConnection();
        using var command = new SqlCommand("sp_CreateCustomer", connection)
        {
            CommandType = CommandType.StoredProcedure
        };

        command.Parameters.AddWithValue("@DisplayName", _createDto.DisplayName);
        command.Parameters.AddWithValue("@FirstName", (object?)_createDto.FirstName ?? DBNull.Value);
        command.Parameters.AddWithValue("@LastName", (object?)_createDto.LastName ?? DBNull.Value);
        command.Parameters.AddWithValue("@Email", (object?)_createDto.Email ?? DBNull.Value);
        command.Parameters.AddWithValue("@Phone", (object?)_createDto.Phone ?? DBNull.Value);
        command.Parameters.AddWithValue("@IsActive", _createDto.IsActive);
    }

    /// <summary>
    /// Optimized implementation using typed parameters (better performance).
    /// </summary>
    [Benchmark]
    public void AddCustomerDtoParameters_TypedParameters()
    {
        using var connection = new SqlConnection();
        using var command = new SqlCommand("sp_CreateCustomer", connection)
        {
            CommandType = CommandType.StoredProcedure
        };

        command.Parameters.Add(new SqlParameter("@DisplayName", SqlDbType.NVarChar) { Value = _createDto.DisplayName });
        
        var firstNameParam = new SqlParameter("@FirstName", SqlDbType.NVarChar);
        firstNameParam.Value = (object?)_createDto.FirstName ?? DBNull.Value;
        command.Parameters.Add(firstNameParam);

        var lastNameParam = new SqlParameter("@LastName", SqlDbType.NVarChar);
        lastNameParam.Value = (object?)_createDto.LastName ?? DBNull.Value;
        command.Parameters.Add(lastNameParam);

        var emailParam = new SqlParameter("@Email", SqlDbType.NVarChar);
        emailParam.Value = (object?)_createDto.Email ?? DBNull.Value;
        command.Parameters.Add(emailParam);

        var phoneParam = new SqlParameter("@Phone", SqlDbType.NVarChar);
        phoneParam.Value = (object?)_createDto.Phone ?? DBNull.Value;
        command.Parameters.Add(phoneParam);

        command.Parameters.Add(new SqlParameter("@IsActive", SqlDbType.Bit) { Value = _createDto.IsActive });
    }

    /// <summary>
    /// Current implementation using helper method with nullable parameter handling.
    /// </summary>
    [Benchmark]
    public void AddCustomerDtoParameters_WithHelperMethod()
    {
        using var connection = new SqlConnection();
        using var command = new SqlCommand("sp_CreateCustomer", connection)
        {
            CommandType = CommandType.StoredProcedure
        };

        command.Parameters.AddWithValue("@DisplayName", _createDto.DisplayName);
        AddNullableParameter(command, "@FirstName", _createDto.FirstName);
        AddNullableParameter(command, "@LastName", _createDto.LastName);
        AddNullableParameter(command, "@Email", _createDto.Email);
        AddNullableParameter(command, "@Phone", _createDto.Phone);
        command.Parameters.AddWithValue("@IsActive", _createDto.IsActive);
    }

    /// <summary>
    /// Benchmark for update DTO parameter creation.
    /// </summary>
    [Benchmark]
    public void AddCustomerUpdateDtoParameters()
    {
        const int id = 123;
        using var connection = new SqlConnection();
        using var command = new SqlCommand("sp_UpdateCustomer", connection)
        {
            CommandType = CommandType.StoredProcedure
        };

        command.Parameters.AddWithValue("@Id", id);
        command.Parameters.AddWithValue("@DisplayName", _updateDto.DisplayName);
        command.Parameters.Add("@FirstName", SqlDbType.NVarChar).Value = (object?)_updateDto.FirstName ?? DBNull.Value;
        command.Parameters.Add("@LastName", SqlDbType.NVarChar).Value = (object?)_updateDto.LastName ?? DBNull.Value;
        command.Parameters.Add("@Email", SqlDbType.NVarChar).Value = (object?)_updateDto.Email ?? DBNull.Value;
        command.Parameters.Add("@Phone", SqlDbType.NVarChar).Value = (object?)_updateDto.Phone ?? DBNull.Value;
        command.Parameters.AddWithValue("@IsActive", _updateDto.IsActive);
    }

    /// <summary>
    /// Helper method matching the repository implementation.
    /// </summary>
    private static void AddNullableParameter(SqlCommand command, string parameterName, string? value, SqlDbType dbType = SqlDbType.NVarChar)
    {
        var parameter = command.Parameters.Add(parameterName, dbType);
        parameter.Value = (object?)value ?? DBNull.Value;
    }
}
