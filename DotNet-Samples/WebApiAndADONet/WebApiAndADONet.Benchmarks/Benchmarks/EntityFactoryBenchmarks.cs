using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;
using WebApiAndADONet.Domain.DTOs;
using WebApiAndADONet.Domain.Entities;

namespace WebApiAndADONet.Benchmarks.Benchmarks;

/// <summary>
/// Benchmarks for entity factory methods used in Customer creation and mapping.
/// These are called frequently during data operations, so performance matters.
/// </summary>
[MemoryDiagnoser]
[SimpleJob(RuntimeMoniker.Net80)]
public class EntityFactoryBenchmarks
{
    private CreateCustomerDto _createDto = null!;

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
    }

    /// <summary>
    /// Benchmarks the FromCreateDto factory method.
    /// </summary>
    [Benchmark(Baseline = true)]
    public Customer CreateFromDto()
    {
        return Customer.FromCreateDto(_createDto);
    }

    /// <summary>
    /// Benchmarks the FromDatabase factory method (used in mapping).
    /// </summary>
    [Benchmark]
    public Customer CreateFromDatabase()
    {
        return Customer.FromDatabase(
            id: 123,
            displayName: "Test Customer",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "555-1234",
            isActive: true
        );
    }

    /// <summary>
    /// Benchmarks the Create factory method.
    /// </summary>
    [Benchmark]
    public Customer CreateDirect()
    {
        return Customer.Create(
            displayName: "Test Customer",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "555-1234",
            isActive: true
        );
    }

    /// <summary>
    /// Benchmarks creating with null values (common scenario).
    /// </summary>
    [Benchmark]
    public Customer CreateWithNulls()
    {
        return Customer.FromDatabase(
            id: 123,
            displayName: "Test Customer",
            firstName: null,
            lastName: null,
            email: null,
            phone: null,
            isActive: true
        );
    }

    /// <summary>
    /// Benchmarks bulk creation (simulating GetAllAsync scenario).
    /// </summary>
    [Benchmark]
    [Arguments(10)]
    [Arguments(100)]
    [Arguments(1000)]
    public List<Customer> CreateBulk(int count)
    {
        var customers = new List<Customer>(count);
        for (int i = 0; i < count; i++)
        {
            customers.Add(Customer.FromDatabase(
                id: i + 1,
                displayName: $"Customer {i + 1}",
                firstName: i % 2 == 0 ? $"First{i + 1}" : null,
                lastName: i % 3 == 0 ? $"Last{i + 1}" : null,
                email: i % 4 == 0 ? $"email{i + 1}@example.com" : null,
                phone: i % 5 == 0 ? $"555-{i + 1:D4}" : null,
                isActive: i % 10 != 0
            ));
        }
        return customers;
    }
}
