using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApi;

public class Product
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Column(TypeName = "decimal(18, 2)")]
    public decimal Price { get; set; }
    
    public int Stock { get; set; }
    
    /// <summary>
    /// Concurrency token - EF Core will automatically check this value
    /// during updates. If it has changed since the entity was loaded,
    /// a DbUpdateConcurrencyException will be thrown.
    /// </summary>
    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public ICollection<InventoryTransaction> Transactions { get; set; } = new List<InventoryTransaction>();
}
