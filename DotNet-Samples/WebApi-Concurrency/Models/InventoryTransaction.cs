using System.ComponentModel.DataAnnotations;

namespace WebApi;

public class InventoryTransaction
{
    public int Id { get; set; }
    
    public int ProductId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string TransactionType { get; set; } = string.Empty;
    
    public int Quantity { get; set; }
    public int PreviousStock { get; set; }
    public int NewStock { get; set; }
    
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    
    [MaxLength(100)]
    public string? UserId { get; set; }
    
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    // Navigation property
    public Product Product { get; set; } = null!;
}

public static class TransactionTypes
{
    public const string Purchase = "Purchase";
    public const string Sale = "Sale";
    public const string Adjustment = "Adjustment";
    public const string Return = "Return";
}
