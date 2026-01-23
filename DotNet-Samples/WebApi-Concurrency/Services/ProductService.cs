using Microsoft.EntityFrameworkCore;


namespace WebApi;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProductService> _logger;

    public ProductService(ApplicationDbContext context, ILogger<ProductService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        return await _context.Products
            .AsNoTracking()
            .Select(p => new ProductDto(
                p.Id, p.Name, p.Description, p.Price, p.Stock, p.RowVersion))
            .ToListAsync();
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        return product == null ? null : 
            new ProductDto(product.Id, product.Name, product.Description, 
                          product.Price, product.Stock, product.RowVersion);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created product {ProductId}: {ProductName}", product.Id, product.Name);

        return new ProductDto(product.Id, product.Name, product.Description,
                             product.Price, product.Stock, product.RowVersion);
    }

    /// <summary>
    /// Updates a product using OPTIMISTIC CONCURRENCY.
    /// The RowVersion is checked automatically by EF Core.
    /// If another user modified the record, DbUpdateConcurrencyException is thrown.
    /// </summary>
    public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        
        if (product == null)
            throw new KeyNotFoundException($"Product with ID {id} not found");

        // Set the original RowVersion for concurrency check
        // EF Core will include this in the WHERE clause: WHERE Id = @Id AND RowVersion = @OriginalVersion
        _context.Entry(product).Property(p => p.RowVersion).OriginalValue = dto.RowVersion;

        // Update properties
        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
            
            _logger.LogInformation(
                "Product {ProductId} updated successfully. New RowVersion: {RowVersion}",
                id, Convert.ToBase64String(product.RowVersion));

            return new ProductDto(product.Id, product.Name, product.Description,
                                 product.Price, product.Stock, product.RowVersion);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex,
                "Concurrency conflict updating product {ProductId}. " +
                "Another user modified the record.", id);
            
            // Rethrow with more context
            throw new ConcurrencyException(
                "The product was modified by another user. Please refresh and try again.",
                ex);
        }
    }

    /// <summary>
    /// Updates stock with optimistic concurrency and audit trail.
    /// </summary>
    public async Task<ProductDto> UpdateStockAsync(int id, UpdateStockDto dto)
    {
        // Use a transaction to ensure atomicity of stock update and audit record
        await using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            var product = await _context.Products.FindAsync(id);
            
            if (product == null)
                throw new KeyNotFoundException($"Product with ID {id} not found");

            // Set the original RowVersion for concurrency check
            _context.Entry(product).Property(p => p.RowVersion).OriginalValue = dto.RowVersion;

            var previousStock = product.Stock;
            var newStock = previousStock + dto.Quantity;

            if (newStock < 0)
                throw new InvalidOperationException(
                    $"Insufficient stock. Available: {previousStock}, Requested: {Math.Abs(dto.Quantity)}");

            // Update stock
            product.Stock = newStock;
            product.UpdatedAt = DateTime.UtcNow;

            // Create audit record
            var inventoryTransaction = new InventoryTransaction
            {
                ProductId = id,
                TransactionType = dto.TransactionType,
                Quantity = dto.Quantity,
                PreviousStock = previousStock,
                NewStock = newStock,
                Notes = dto.Notes,
                TransactionDate = DateTime.UtcNow
            };
            _context.InventoryTransactions.Add(inventoryTransaction);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Stock updated for product {ProductId}: {Previous} → {New} ({Change:+#;-#;0})",
                id, previousStock, newStock, dto.Quantity);

            return new ProductDto(product.Id, product.Name, product.Description,
                                 product.Price, product.Stock, product.RowVersion);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            await transaction.RollbackAsync();
            
            _logger.LogWarning(ex,
                "Concurrency conflict updating stock for product {ProductId}", id);
            
            throw new ConcurrencyException(
                "Stock was modified by another transaction. Please refresh and try again.",
                ex);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        
        if (product == null)
            throw new KeyNotFoundException($"Product with ID {id} not found");

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Deleted product {ProductId}", id);
    }
}
