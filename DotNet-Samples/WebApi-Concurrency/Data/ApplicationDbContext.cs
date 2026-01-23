using Microsoft.EntityFrameworkCore;


namespace WebApi;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<Product> Products => Set<Product>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
    public DbSet<BankAccount> BankAccounts => Set<BankAccount>();
    public DbSet<Transfer> Transfers => Set<Transfer>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        ConfigureProduct(modelBuilder);
        ConfigureInventoryTransaction(modelBuilder);
        ConfigureBankAccount(modelBuilder);
        ConfigureTransfer(modelBuilder);
        
        // Seed test data
        SeedData(modelBuilder);
    }

    private static void ConfigureProduct(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.Price)
                .HasColumnType("decimal(18, 2)");
            
            // Configure RowVersion as concurrency token
            // SQL Server will automatically update this value on each modification
            entity.Property(e => e.RowVersion)
                .IsRowVersion()
                .IsConcurrencyToken();
            
            entity.HasIndex(e => e.Name);
        });
    }

    private static void ConfigureInventoryTransaction(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<InventoryTransaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.TransactionType)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.HasOne(e => e.Product)
                .WithMany(p => p.Transactions)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.ProductId);
            entity.HasIndex(e => e.TransactionDate);
        });
    }

    private static void ConfigureBankAccount(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BankAccount>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.AccountNumber)
                .IsRequired()
                .HasMaxLength(20);
            
            entity.HasIndex(e => e.AccountNumber)
                .IsUnique();
            
            entity.Property(e => e.AccountHolder)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.Balance)
                .HasColumnType("decimal(18, 2)");
            
            entity.Property(e => e.Currency)
                .HasMaxLength(3)
                .HasDefaultValue("USD");
            
            // Configure RowVersion as concurrency token
            entity.Property(e => e.RowVersion)
                .IsRowVersion()
                .IsConcurrencyToken();
            
            // Check constraint for non-negative balance
            entity.ToTable(t => t.HasCheckConstraint(
                "CK_BankAccounts_Balance", 
                "[Balance] >= 0"));
        });
    }

    private static void ConfigureTransfer(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Transfer>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20);
            
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18, 2)");
            
            entity.HasOne(e => e.FromAccount)
                .WithMany()
                .HasForeignKey(e => e.FromAccountId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.ToAccount)
                .WithMany()
                .HasForeignKey(e => e.ToAccountId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Check constraints
            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_Transfers_DifferentAccounts",
                    "[FromAccountId] <> [ToAccountId]");
                t.HasCheckConstraint(
                    "CK_Transfers_PositiveAmount",
                    "[Amount] > 0");
            });
            
            entity.HasIndex(e => e.FromAccountId);
            entity.HasIndex(e => e.ToAccountId);
            entity.HasIndex(e => e.TransferDate);
        });
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Products
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = 1,
                Name = "iPhone 15 Pro",
                Description = "Latest iPhone with A17 chip",
                Price = 999.99m,
                Stock = 100,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 2,
                Name = "MacBook Pro 14\"",
                Description = "M3 Pro chip, 18GB RAM",
                Price = 1999.99m,
                Stock = 50,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 3,
                Name = "AirPods Pro 2",
                Description = "Active Noise Cancellation, USB-C",
                Price = 249.99m,
                Stock = 200,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
        
        // Seed Bank Accounts
        modelBuilder.Entity<BankAccount>().HasData(
            new BankAccount
            {
                Id = 1,
                AccountNumber = "ACC-001",
                AccountHolder = "John Doe",
                Balance = 10000.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new BankAccount
            {
                Id = 2,
                AccountNumber = "ACC-002",
                AccountHolder = "Jane Smith",
                Balance = 5000.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new BankAccount
            {
                Id = 3,
                AccountNumber = "ACC-003",
                AccountHolder = "Bob Wilson",
                Balance = 7500.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
