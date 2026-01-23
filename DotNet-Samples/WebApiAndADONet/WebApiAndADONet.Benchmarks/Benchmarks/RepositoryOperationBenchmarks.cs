using System.Data;
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WebApiAndADONet.Data.Repositories;
using WebApiAndADONet.Domain.DTOs;

namespace WebApiAndADONet.Benchmarks.Benchmarks;

/// <summary>
/// Benchmarks for repository database operations.
/// 
/// IMPORTANT: These benchmarks require a real database connection.
/// 
/// Setup Instructions:
/// 1. Ensure you have a SQL Server database available
/// 2. Update the connection string in appsettings.json in the benchmark project
/// 3. Run the database setup scripts to create tables and stored procedures
/// 4. Seed the database with test data (optional, but recommended for accurate results)
/// 
/// Note: These benchmarks will actually execute database operations.
/// Make sure you're using a test database, not production!
/// </summary>
[MemoryDiagnoser]
[SimpleJob(RuntimeMoniker.Net80)]
[MinColumn, MaxColumn, MeanColumn, MedianColumn]
public class RepositoryOperationBenchmarks
{
    private ICustomerRepository _repository = null!;
    private IConfiguration _configuration = null!;
    private ILogger<CustomerRepository> _logger = null!;
    private List<int> _testCustomerIds = new();
    private const int TestDataCount = 100;

    [GlobalSetup]
    public void Setup()
    {
        // Load configuration
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

        _configuration = builder.Build();

        // Create logger
        using var loggerFactory = LoggerFactory.Create(b => b.AddConsole());
        _logger = loggerFactory.CreateLogger<CustomerRepository>();

        // Create repository
        _repository = new CustomerRepository(_configuration, _logger);

        // Verify connection and prepare test data
        try
        {
            PrepareTestData();
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Failed to setup repository benchmarks. " +
                $"Ensure database is available and connection string is correct. " +
                $"Error: {ex.Message}", ex);
        }
    }

    [GlobalCleanup]
    public void Cleanup()
    {
        // Clean up test data
        try
        {
            CleanupTestData();
        }
        catch
        {
            // Ignore cleanup errors
        }
    }

    private void PrepareTestData()
    {
        // Create test customers for benchmarking
        _testCustomerIds.Clear();
        for (int i = 0; i < TestDataCount; i++)
        {
            var dto = new CreateCustomerDto
            {
                DisplayName = $"Benchmark Customer {i}",
                FirstName = i % 2 == 0 ? $"First{i}" : null,
                LastName = i % 3 == 0 ? $"Last{i}" : null,
                Email = i % 4 == 0 ? $"benchmark{i}@test.com" : null,
                Phone = i % 5 == 0 ? $"555-{i:D4}" : null,
                IsActive = i % 10 != 0
            };

            var customer = _repository.CreateAsync(dto).GetAwaiter().GetResult();
            _testCustomerIds.Add(customer.Id);
        }
    }

    private void CleanupTestData()
    {
        foreach (var id in _testCustomerIds)
        {
            try
            {
                _repository.DeleteAsync(id).GetAwaiter().GetResult();
            }
            catch
            {
                // Ignore individual delete errors
            }
        }
        _testCustomerIds.Clear();
    }

    /// <summary>
    /// Benchmarks retrieving a single customer by ID.
    /// This is a common operation and should be fast with proper indexing.
    /// </summary>
    [Benchmark(Baseline = true)]
    public async Task GetByIdAsync()
    {
        if (_testCustomerIds.Count == 0) return;
        var id = _testCustomerIds[0];
        await _repository.GetByIdAsync(id);
    }

    /// <summary>
    /// Benchmarks retrieving all customers.
    /// Performance scales with the number of records in the database.
    /// </summary>
    [Benchmark]
    public async Task GetAllAsync()
    {
        await _repository.GetAllAsync();
    }

    /// <summary>
    /// Benchmarks checking if a customer exists.
    /// This is often used before update/delete operations.
    /// </summary>
    [Benchmark]
    public async Task ExistsAsync()
    {
        if (_testCustomerIds.Count == 0) return;
        var id = _testCustomerIds[0];
        await _repository.ExistsAsync(id);
    }

    /// <summary>
    /// Benchmarks creating a new customer.
    /// Measures the full create operation including stored procedure execution.
    /// </summary>
    [Benchmark]
    public async Task CreateAsync()
    {
        var dto = new CreateCustomerDto
        {
            DisplayName = $"Benchmark Create {Guid.NewGuid()}",
            FirstName = "Test",
            LastName = "User",
            Email = $"test{Guid.NewGuid()}@example.com",
            Phone = "555-0000",
            IsActive = true
        };

        var customer = await _repository.CreateAsync(dto);
        // Store ID for cleanup
        _testCustomerIds.Add(customer.Id);
    }

    /// <summary>
    /// Benchmarks updating an existing customer.
    /// </summary>
    [Benchmark]
    public async Task UpdateAsync()
    {
        if (_testCustomerIds.Count == 0) return;
        var id = _testCustomerIds[0];
        var dto = new UpdateCustomerDto
        {
            DisplayName = $"Updated {Guid.NewGuid()}",
            FirstName = "Updated",
            LastName = "Name",
            Email = $"updated{Guid.NewGuid()}@example.com",
            Phone = "555-9999",
            IsActive = false
        };

        await _repository.UpdateAsync(id, dto);
    }

    /// <summary>
    /// Benchmarks deleting a customer.
    /// Note: This will actually delete data, so it's run last.
    /// </summary>
    [Benchmark]
    public async Task DeleteAsync()
    {
        if (_testCustomerIds.Count < 2) return;
        // Use the last ID to avoid affecting other benchmarks
        var id = _testCustomerIds[_testCustomerIds.Count - 1];
        _testCustomerIds.RemoveAt(_testCustomerIds.Count - 1);
        await _repository.DeleteAsync(id);
    }

    /// <summary>
    /// Benchmarks connection creation overhead.
    /// This helps identify if connection pooling is working effectively.
    /// </summary>
    [Benchmark]
    public async Task ConnectionCreation()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrEmpty(connectionString)) return;

        for (int i = 0; i < 10; i++)
        {
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
        }
    }
}
