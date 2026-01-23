using System.Data;
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;
using Microsoft.Data.SqlClient;
using WebApiAndADONet.Domain.Entities;

namespace WebApiAndADONet.Benchmarks.Benchmarks;

/// <summary>
/// Benchmarks for data mapping operations from SqlDataReader to Customer entity.
/// This is critical because mapping is called for every row in result sets.
/// </summary>
[MemoryDiagnoser]
[SimpleJob(RuntimeMoniker.Net80)]
public class DataMappingBenchmarks
{
    private IDataReader? _reader;

    /// <summary>
    /// Setup: Creates a mock SqlDataReader with sample customer data.
    /// In a real scenario, this would come from a database query.
    /// </summary>
    [GlobalSetup]
    public void Setup()
    {
        // Create an in-memory DataTable to simulate database results
        var dataTable = new DataTable();
        dataTable.Columns.Add("Id", typeof(int));
        dataTable.Columns.Add("DisplayName", typeof(string));
        dataTable.Columns.Add("FirstName", typeof(string));
        dataTable.Columns.Add("LastName", typeof(string));
        dataTable.Columns.Add("Email", typeof(string));
        dataTable.Columns.Add("Phone", typeof(string));
        dataTable.Columns.Add("IsActive", typeof(bool));

        // Add sample data rows
        for (int i = 1; i <= 1000; i++)
        {
            dataTable.Rows.Add(
                i,
                $"Customer {i}",
                i % 2 == 0 ? $"First{i}" : null,
                i % 3 == 0 ? $"Last{i}" : null,
                i % 4 == 0 ? $"email{i}@example.com" : null,
                i % 5 == 0 ? $"555-{i:D4}" : null,
                i % 10 != 0
            );
        }

        // Create a DataReader from the DataTable
        _reader = dataTable.CreateDataReader();
    }

    [GlobalCleanup]
    public void Cleanup()
    {
        _reader?.Dispose();
    }

    /// <summary>
    /// Benchmarks the current mapping implementation from CustomerRepository.
    /// This uses name-based column access with null checks.
    /// </summary>
    [Benchmark(Baseline = true)]
    [Arguments(1)]
    [Arguments(10)]
    [Arguments(100)]
    [Arguments(1000)]
    public Customer? MapCustomerFromReader_NameBased(int rowCount)
    {
        Customer? lastCustomer = null;
        int count = 0;

        // Reset reader to beginning
        if (_reader != null && !_reader.IsClosed)
        {
            // For DataTable reader, we need to recreate it
            // In real scenario, this would be a fresh reader from query
            var dataTable = new DataTable();
            dataTable.Columns.Add("Id", typeof(int));
            dataTable.Columns.Add("DisplayName", typeof(string));
            dataTable.Columns.Add("FirstName", typeof(string));
            dataTable.Columns.Add("LastName", typeof(string));
            dataTable.Columns.Add("Email", typeof(string));
            dataTable.Columns.Add("Phone", typeof(string));
            dataTable.Columns.Add("IsActive", typeof(bool));

            for (int i = 1; i <= rowCount; i++)
            {
                dataTable.Rows.Add(
                    i,
                    $"Customer {i}",
                    i % 2 == 0 ? $"First{i}" : null,
                    i % 3 == 0 ? $"Last{i}" : null,
                    i % 4 == 0 ? $"email{i}@example.com" : null,
                    i % 5 == 0 ? $"555-{i:D4}" : null,
                    i % 10 != 0
                );
            }

            using var reader = dataTable.CreateDataReader();
            while (reader.Read() && count < rowCount)
            {
                lastCustomer = MapCustomerFromReader(reader);
                count++;
            }
        }

        return lastCustomer;
    }

    /// <summary>
    /// Alternative implementation using ordinal-based column access.
    /// Ordinals are faster than name lookups but less maintainable.
    /// </summary>
    [Benchmark]
    [Arguments(1)]
    [Arguments(10)]
    [Arguments(100)]
    [Arguments(1000)]
    public Customer? MapCustomerFromReader_OrdinalBased(int rowCount)
    {
        Customer? lastCustomer = null;
        int count = 0;

        var dataTable = new DataTable();
        dataTable.Columns.Add("Id", typeof(int));
        dataTable.Columns.Add("DisplayName", typeof(string));
        dataTable.Columns.Add("FirstName", typeof(string));
        dataTable.Columns.Add("LastName", typeof(string));
        dataTable.Columns.Add("Email", typeof(string));
        dataTable.Columns.Add("Phone", typeof(string));
        dataTable.Columns.Add("IsActive", typeof(bool));

        for (int i = 1; i <= rowCount; i++)
        {
            dataTable.Rows.Add(
                i,
                $"Customer {i}",
                i % 2 == 0 ? $"First{i}" : null,
                i % 3 == 0 ? $"Last{i}" : null,
                i % 4 == 0 ? $"email{i}@example.com" : null,
                i % 5 == 0 ? $"555-{i:D4}" : null,
                i % 10 != 0
            );
        }

        using var reader = dataTable.CreateDataReader();
        const int idOrdinal = 0;
        const int displayNameOrdinal = 1;
        const int firstNameOrdinal = 2;
        const int lastNameOrdinal = 3;
        const int emailOrdinal = 4;
        const int phoneOrdinal = 5;
        const int isActiveOrdinal = 6;

        while (reader.Read() && count < rowCount)
        {
            lastCustomer = Customer.FromDatabase(
                id: reader.GetInt32(idOrdinal),
                displayName: reader.GetString(displayNameOrdinal),
                firstName: reader.IsDBNull(firstNameOrdinal) ? null : reader.GetString(firstNameOrdinal),
                lastName: reader.IsDBNull(lastNameOrdinal) ? null : reader.GetString(lastNameOrdinal),
                email: reader.IsDBNull(emailOrdinal) ? null : reader.GetString(emailOrdinal),
                phone: reader.IsDBNull(phoneOrdinal) ? null : reader.GetString(phoneOrdinal),
                isActive: reader.GetBoolean(isActiveOrdinal)
            );
            count++;
        }

        return lastCustomer;
    }

    /// <summary>
    /// Current implementation from CustomerRepository (name-based with null checks).
    /// This matches the actual code in the repository.
    /// Uses IDataReader to work with both SqlDataReader and DataTableReader.
    /// </summary>
    private static Customer MapCustomerFromReader(IDataReader reader)
    {
        return Customer.FromDatabase(
            id: reader.GetInt32(reader.GetOrdinal("Id")),
            displayName: reader.GetString(reader.GetOrdinal("DisplayName")),
            firstName: reader.IsDBNull(reader.GetOrdinal("FirstName")) ? null : reader.GetString(reader.GetOrdinal("FirstName")),
            lastName: reader.IsDBNull(reader.GetOrdinal("LastName")) ? null : reader.GetString(reader.GetOrdinal("LastName")),
            email: reader.IsDBNull(reader.GetOrdinal("Email")) ? null : reader.GetString(reader.GetOrdinal("Email")),
            phone: reader.IsDBNull(reader.GetOrdinal("Phone")) ? null : reader.GetString(reader.GetOrdinal("Phone")),
            isActive: reader.GetBoolean(reader.GetOrdinal("IsActive"))
        );
    }
}
