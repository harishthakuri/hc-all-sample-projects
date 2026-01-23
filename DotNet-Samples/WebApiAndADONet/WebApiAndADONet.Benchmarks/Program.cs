using BenchmarkDotNet.Running;

namespace API_With_ADO_Net.Benchmarks;

/// <summary>
/// Benchmark runner for API_With_ADO_Net project.
/// 
/// Run specific benchmarks:
/// - dotnet run -c Release -- --filter *DataMappingBenchmarks*
/// - dotnet run -c Release -- --filter *ParameterCreationBenchmarks*
/// - dotnet run -c Release -- --filter *EntityFactoryBenchmarks*
/// - dotnet run -c Release -- --filter *RepositoryOperationBenchmarks*
/// 
/// Run all benchmarks:
/// - dotnet run -c Release
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        // Run all benchmarks or filter by command line arguments
        var summary = BenchmarkSwitcher.FromAssembly(typeof(Program).Assembly).Run(args);
    }
}