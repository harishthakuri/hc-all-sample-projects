using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApi;

public class Transfer
{
    public int Id { get; set; }
    
    public int FromAccountId { get; set; }
    public int ToAccountId { get; set; }
    
    [Column(TypeName = "decimal(18, 2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = TransferStatus.Pending;
    
    public DateTime TransferDate { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    [MaxLength(500)]
    public string? ErrorMessage { get; set; }
    
    // Navigation properties
    public BankAccount FromAccount { get; set; } = null!;
    public BankAccount ToAccount { get; set; } = null!;
}

public static class TransferStatus
{
    public const string Pending = "Pending";
    public const string Completed = "Completed";
    public const string Failed = "Failed";
}
