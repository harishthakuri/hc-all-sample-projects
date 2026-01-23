using System.ComponentModel.DataAnnotations;

namespace WebApi;

public record ProductDto(
    int Id,
    string Name,
    string? Description,
    decimal Price,
    int Stock,
    byte[] RowVersion);

public record CreateProductDto(
    [Required] string Name,
    string? Description,
    [Range(0.01, double.MaxValue)] decimal Price,
    [Range(0, int.MaxValue)] int Stock);

public record UpdateProductDto(
    [Required] string Name,
    string? Description,
    [Range(0.01, double.MaxValue)] decimal Price,
    [Required] byte[] RowVersion);  // Required for optimistic concurrency

public record UpdateStockDto(
    int Quantity,        // Positive for add, negative for subtract
    [Required] string TransactionType,
    string? Notes,
    [Required] byte[] RowVersion);
