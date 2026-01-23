using Microsoft.EntityFrameworkCore;


namespace WebApi;

public class BankTransferService : IBankTransferService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BankTransferService> _logger;
    private readonly IDatabaseProvider _dbProvider;

    public BankTransferService(
        ApplicationDbContext context, 
        ILogger<BankTransferService> logger,
        IDatabaseProvider dbProvider)
    {
        _context = context;
        _logger = logger;
        _dbProvider = dbProvider;
    }

    public async Task<IEnumerable<AccountDto>> GetAllAccountsAsync()
    {
        return await _context.BankAccounts
            .AsNoTracking()
            .Where(a => a.IsActive)
            .Select(a => new AccountDto(
                a.Id, a.AccountNumber, a.AccountHolder, a.Balance, a.Currency))
            .ToListAsync();
    }

    public async Task<AccountDto?> GetAccountByIdAsync(int id)
    {
        var account = await _context.BankAccounts
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        return account == null ? null :
            new AccountDto(account.Id, account.AccountNumber, 
                          account.AccountHolder, account.Balance, account.Currency);
    }

    public async Task<AccountDto> CreateAccountAsync(CreateAccountDto dto)
    {
        var account = new BankAccount
        {
            AccountNumber = dto.AccountNumber,
            AccountHolder = dto.AccountHolder,
            Balance = dto.InitialBalance,
            Currency = dto.Currency,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.BankAccounts.Add(account);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created bank account {AccountNumber} for {AccountHolder}", 
            account.AccountNumber, account.AccountHolder);

        return new AccountDto(account.Id, account.AccountNumber, 
                             account.AccountHolder, account.Balance, account.Currency);
    }

    /// <summary>
    /// Transfer with OPTIMISTIC concurrency (using RowVersion).
    /// Good for low-contention scenarios.
    /// </summary>
    public async Task<TransferResult> TransferAsync(TransferDto dto)
    {
        // Validate input
        if (dto.FromAccountId == dto.ToAccountId)
            return new TransferResult(false, "Cannot transfer to the same account");
        
        if (dto.Amount <= 0)
            return new TransferResult(false, "Amount must be positive");

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var fromAccount = await _context.BankAccounts.FindAsync(dto.FromAccountId);
            var toAccount = await _context.BankAccounts.FindAsync(dto.ToAccountId);

            if (fromAccount == null)
                return new TransferResult(false, "Source account not found");
            if (toAccount == null)
                return new TransferResult(false, "Destination account not found");
            if (!fromAccount.IsActive || !toAccount.IsActive)
                return new TransferResult(false, "One or both accounts are inactive");
            if (fromAccount.Balance < dto.Amount)
                return new TransferResult(false, 
                    $"Insufficient funds. Available: {fromAccount.Balance:C}");

            // Create transfer record
            var transfer = new Transfer
            {
                FromAccountId = dto.FromAccountId,
                ToAccountId = dto.ToAccountId,
                Amount = dto.Amount,
                Status = TransferStatus.Pending,
                TransferDate = DateTime.UtcNow
            };
            _context.Transfers.Add(transfer);

            // Perform transfer
            fromAccount.Balance -= dto.Amount;
            fromAccount.UpdatedAt = DateTime.UtcNow;
            
            toAccount.Balance += dto.Amount;
            toAccount.UpdatedAt = DateTime.UtcNow;

            transfer.Status = TransferStatus.Completed;
            transfer.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Transfer {TransferId} completed: {Amount:C} from Account {From} to Account {To}",
                transfer.Id, dto.Amount, dto.FromAccountId, dto.ToAccountId);

            return new TransferResult(
                true,
                "Transfer completed successfully",
                transfer.Id,
                fromAccount.Balance,
                toAccount.Balance);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            await transaction.RollbackAsync();
            
            _logger.LogWarning(ex, 
                "Concurrency conflict during transfer from Account {From} to Account {To}",
                dto.FromAccountId, dto.ToAccountId);

            return new TransferResult(false, 
                "Transfer failed due to concurrent modification. Please try again.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Transfer failed unexpectedly");
            return new TransferResult(false, "Transfer failed: " + ex.Message);
        }
    }

    /// <summary>
    /// Transfer with PESSIMISTIC concurrency (using database locks).
    /// Better for high-contention scenarios like flash sales.
    /// Uses provider-specific row locking (UPDLOCK for SQL Server, FOR UPDATE for PostgreSQL).
    /// </summary>
    public async Task<TransferResult> TransferWithPessimisticLockAsync(TransferDto dto)
    {
        // Validate input
        if (dto.FromAccountId == dto.ToAccountId)
            return new TransferResult(false, "Cannot transfer to the same account");
        
        if (dto.Amount <= 0)
            return new TransferResult(false, "Amount must be positive");

        // Use SERIALIZABLE isolation level for strongest consistency
        // This prevents phantom reads and ensures complete isolation
        await using var transaction = await _context.Database
            .BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

        try
        {
            // Lock rows in a consistent order to prevent deadlocks
            // Always lock lower ID first - this is critical for deadlock prevention!
            var (firstId, secondId) = dto.FromAccountId < dto.ToAccountId
                ? (dto.FromAccountId, dto.ToAccountId)
                : (dto.ToAccountId, dto.FromAccountId);

            // Use provider-specific locking SQL (works for both SQL Server and PostgreSQL)
            // SQL Server: SELECT * FROM BankAccounts WITH (UPDLOCK, ROWLOCK) WHERE ...
            // PostgreSQL: SELECT * FROM BankAccounts WHERE ... FOR UPDATE
            // The locks are held until the transaction completes (commit or rollback)
            var lockSql = _dbProvider.GetLockRowsForUpdateSql(
                "BankAccounts", 
                $"Id IN ({firstId}, {secondId})");
            
            var accounts = await _context.BankAccounts
                .FromSqlRaw(lockSql)
                .ToListAsync();

            var fromAccount = accounts.FirstOrDefault(a => a.Id == dto.FromAccountId);
            var toAccount = accounts.FirstOrDefault(a => a.Id == dto.ToAccountId);

            if (fromAccount == null)
                return new TransferResult(false, "Source account not found");
            if (toAccount == null)
                return new TransferResult(false, "Destination account not found");
            if (!fromAccount.IsActive || !toAccount.IsActive)
                return new TransferResult(false, "One or both accounts are inactive");
            if (fromAccount.Balance < dto.Amount)
                return new TransferResult(false, 
                    $"Insufficient funds. Available: {fromAccount.Balance:C}");

            // Simulate some processing time to demonstrate locking behavior
            // In real scenarios, this could be external API calls, validations, etc.
            // Other transactions trying to access these rows will wait here
            await Task.Delay(100);

            // Create transfer record
            var transfer = new Transfer
            {
                FromAccountId = dto.FromAccountId,
                ToAccountId = dto.ToAccountId,
                Amount = dto.Amount,
                Status = TransferStatus.Pending,
                TransferDate = DateTime.UtcNow
            };
            _context.Transfers.Add(transfer);

            // Perform transfer
            fromAccount.Balance -= dto.Amount;
            fromAccount.UpdatedAt = DateTime.UtcNow;
            
            toAccount.Balance += dto.Amount;
            toAccount.UpdatedAt = DateTime.UtcNow;

            transfer.Status = TransferStatus.Completed;
            transfer.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Transfer {TransferId} completed with pessimistic lock: {Amount:C} from Account {From} to Account {To}",
                transfer.Id, dto.Amount, dto.FromAccountId, dto.ToAccountId);

            return new TransferResult(
                true,
                "Transfer completed successfully (with pessimistic lock)",
                transfer.Id,
                fromAccount.Balance,
                toAccount.Balance);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Transfer with pessimistic lock failed");
            return new TransferResult(false, "Transfer failed: " + ex.Message);
        }
    }
}
