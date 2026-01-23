# Benchmarks

This project contains performance benchmarks for the WebApiAndADONet application using BenchmarkDotNet.

## Overview

The benchmarks are organized into four main categories:

### 1. **Data Mapping Benchmarks** (`DataMappingBenchmarks.cs`)
- **Purpose**: Measures performance of mapping `SqlDataReader` to `Customer` entities
- **Why**: Mapping is called for every row in result sets, so it's a critical performance path
- **Tests**:
  - Name-based column access (current implementation)
  - Ordinal-based column access (alternative, faster but less maintainable)
  - Performance with different row counts (1, 10, 100, 1000)

### 2. **Parameter Creation Benchmarks** (`ParameterCreationBenchmarks.cs`)
- **Purpose**: Measures overhead of creating SQL parameters
- **Why**: Parameter creation happens on every database operation
- **Tests**:
  - `AddWithValue` vs typed parameters
  - Helper method overhead
  - Create and Update DTO parameter creation

### 3. **Entity Factory Benchmarks** (`EntityFactoryBenchmarks.cs`)
- **Purpose**: Measures performance of entity creation methods
- **Why**: Factory methods are called frequently during data operations
- **Tests**:
  - `FromCreateDto` factory method
  - `FromDatabase` factory method
  - Direct creation
  - Creation with null values
  - Bulk creation (simulating `GetAllAsync`)

### 4. **Repository Operation Benchmarks** (`RepositoryOperationBenchmarks.cs`)
- **Purpose**: Measures actual database operation performance
- **Why**: These are the real-world operations that matter most
- **Tests**:
  - `GetByIdAsync` - Single record lookup
  - `GetAllAsync` - Retrieve all records
  - `ExistsAsync` - Existence check
  - `CreateAsync` - Insert operation
  - `UpdateAsync` - Update operation
  - `DeleteAsync` - Delete operation
  - Connection creation overhead

## Prerequisites

1. **.NET 8.0 SDK** - Required to build and run benchmarks
2. **SQL Server Database** - Required for `RepositoryOperationBenchmarks`
   - Database must be set up with tables and stored procedures
   - Connection string must be configured in `appsettings.json`

## Setup

### 1. Configure Database Connection

Edit `appsettings.json` and update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-server;Database=your-database;Integrated Security=True;TrustServerCertificate=True;"
  }
}
```

### 2. Database Setup

Ensure your database has:
- Customer table created (see `API_With_ADO_Net/Data/Scripts/CreateCustomerTable.sql`)
- Stored procedures created (see `API_With_ADO_Net/Data/Scripts/CreateStoredProcedures.sql`)

**⚠️ WARNING**: Repository benchmarks will create and delete test data. Use a test database, not production!

## Running Benchmarks

### Run All Benchmarks

```bash
cd API_With_ADO_Net.Benchmarks
dotnet run -c Release
```

### Run Specific Benchmark Classes

```bash
# Data mapping benchmarks only
dotnet run -c Release -- --filter *DataMappingBenchmarks*

# Parameter creation benchmarks only
dotnet run -c Release -- --filter *ParameterCreationBenchmarks*

# Entity factory benchmarks only
dotnet run -c Release -- --filter *EntityFactoryBenchmarks*

# Repository operation benchmarks only (requires database)
dotnet run -c Release -- --filter *RepositoryOperationBenchmarks*
```

### Run Specific Benchmark Methods

```bash
# Run only the baseline method
dotnet run -c Release -- --filter *DataMappingBenchmarks.MapCustomerFromReader_NameBased*

# Run with specific arguments
dotnet run -c Release -- --filter *DataMappingBenchmarks* --anyCategories
```

## Understanding Results

BenchmarkDotNet provides several metrics:

- **Mean**: Average execution time
- **Median**: Middle value (less affected by outliers)
- **StdDev**: Standard deviation (consistency indicator)
- **Min/Max**: Best and worst case performance
- **Gen 0/1/2**: Garbage collection frequency
- **Allocated**: Memory allocated per operation

### Key Metrics to Watch

1. **Execution Time**: Lower is better
2. **Memory Allocation**: Lower allocation means less GC pressure
3. **Consistency (StdDev)**: Lower standard deviation means more consistent performance

## Interpreting Results

### Data Mapping Benchmarks
- Compare name-based vs ordinal-based access
- Check performance scaling with row count
- Look for memory allocation patterns

### Parameter Creation Benchmarks
- Compare `AddWithValue` vs typed parameters
- Measure helper method overhead
- Identify optimization opportunities

### Entity Factory Benchmarks
- Verify factory methods are efficient
- Check null handling performance
- Measure bulk creation scalability

### Repository Operation Benchmarks
- Identify slow database operations
- Check connection pooling effectiveness
- Measure real-world performance characteristics

## Best Practices

1. **Always run in Release mode**: Debug builds have significant overhead
2. **Warm up**: First run may be slower due to JIT compilation
3. **Multiple runs**: BenchmarkDotNet runs multiple iterations automatically
4. **Database state**: Ensure consistent database state for repository benchmarks
5. **Isolation**: Run benchmarks on dedicated machines when possible

## Troubleshooting

### "Connection string not found" error
- Ensure `appsettings.json` exists in the benchmark project
- Verify connection string name matches `"DefaultConnection"`

### "Database not available" error
- Check SQL Server is running
- Verify connection string is correct
- Ensure database and tables exist

### Slow benchmark execution
- Ensure you're running in Release mode (`-c Release`)
- Close other applications to reduce interference
- Check database performance and indexes

## Example Output

```
BenchmarkDotNet v0.15.8, .NET 8.0.0
AMD Ryzen 9 5900X, 1 CPU, 24 logical and 12 physical cores

| Method                              | Mean      | Error    | StdDev   | Median    | Gen0   | Allocated |
|------------------------------------ |----------:|---------:|---------:|----------:|-------:|----------:|
| MapCustomerFromReader_NameBased     | 1.234 us  | 0.012 us | 0.011 us | 1.230 us  | 0.1234 |    1.2 KB |
| MapCustomerFromReader_OrdinalBased  | 0.987 us  | 0.009 us | 0.008 us | 0.985 us  | 0.0987 |    1.0 KB |
```

## Additional Resources

- [BenchmarkDotNet Documentation](https://benchmarkdotnet.org/)
- [Performance Best Practices](https://docs.microsoft.com/en-us/dotnet/standard/performance/)
- [ADO.NET Performance](https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/performance-guidelines)
