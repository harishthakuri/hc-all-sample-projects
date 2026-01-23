using Microsoft.AspNetCore.Mvc;

namespace WebApi;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class BankAccountsController : ControllerBase
{
    private readonly IBankTransferService _transferService;
    private readonly ILogger<BankAccountsController> _logger;

    public BankAccountsController(
        IBankTransferService transferService, 
        ILogger<BankAccountsController> logger)
    {
        _transferService = transferService;
        _logger = logger;
    }

    /// <summary>
    /// Get all active bank accounts
    /// </summary>
    /// <returns>List of all active bank accounts</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AccountDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AccountDto>>> GetAccounts()
    {
        var accounts = await _transferService.GetAllAccountsAsync();
        return Ok(accounts);
    }

    /// <summary>
    /// Get a specific bank account by ID
    /// </summary>
    /// <param name="id">Account ID</param>
    /// <returns>The account if found</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AccountDto>> GetAccount(int id)
    {
        var account = await _transferService.GetAccountByIdAsync(id);
        
        if (account == null)
            return NotFound(new { message = $"Account with ID {id} not found" });

        return Ok(account);
    }

    /// <summary>
    /// Create a new bank account
    /// </summary>
    /// <param name="dto">Account creation data</param>
    /// <returns>The created account</returns>
    [HttpPost]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AccountDto>> CreateAccount(CreateAccountDto dto)
    {
        try
        {
            var account = await _transferService.CreateAccountAsync(dto);
            return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Transfer money using OPTIMISTIC concurrency.
    /// 
    /// This method uses RowVersion checking. If concurrent modifications
    /// occur to either account during the transfer, the operation may fail 
    /// and should be retried.
    /// 
    /// Recommended for:
    /// - Low to moderate contention scenarios
    /// - Better throughput when conflicts are rare
    /// </summary>
    /// <param name="dto">Transfer details</param>
    /// <returns>Transfer result with new balances</returns>
    [HttpPost("transfer")]
    [ProducesResponseType(typeof(TransferResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(TransferResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(TransferResult), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TransferResult>> Transfer(TransferDto dto)
    {
        var result = await _transferService.TransferAsync(dto);
        
        if (!result.Success)
        {
            if (result.Message.Contains("concurrent"))
                return Conflict(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Transfer money using PESSIMISTIC concurrency (database locks).
    /// 
    /// This method acquires exclusive locks on the account rows using
    /// SQL Server's UPDLOCK hint. Other transactions trying to access
    /// these accounts will WAIT until this transaction completes.
    /// 
    /// Benefits:
    /// - Guarantees no conflicts (requests are serialized)
    /// - No need for retry logic in the client
    /// 
    /// Drawbacks:
    /// - Can cause lock waits (slower response times under load)
    /// - Potential for deadlocks (mitigated by consistent lock ordering)
    /// 
    /// Recommended for:
    /// - High contention scenarios (flash sales, limited inventory)
    /// - Critical financial transactions where consistency is paramount
    /// - Scenarios where you can't afford to retry
    /// </summary>
    /// <param name="dto">Transfer details</param>
    /// <returns>Transfer result with new balances</returns>
    [HttpPost("transfer-locked")]
    [ProducesResponseType(typeof(TransferResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(TransferResult), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TransferResult>> TransferWithLock(TransferDto dto)
    {
        var result = await _transferService.TransferWithPessimisticLockAsync(dto);
        
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Demo endpoint: Simulate concurrent transfers to test locking.
    /// 
    /// This endpoint initiates multiple concurrent transfers from the same
    /// account to demonstrate the difference between optimistic and pessimistic
    /// concurrency control.
    /// 
    /// With optimistic concurrency (usePessimisticLock=false):
    /// - Some transfers may fail due to concurrent modification
    /// - Failed transfers would need to be retried by the client
    /// 
    /// With pessimistic concurrency (usePessimisticLock=true):
    /// - All transfers should succeed (they're serialized)
    /// - But total time will be longer due to lock waiting
    /// </summary>
    /// <param name="fromAccountId">Source account ID</param>
    /// <param name="toAccountId">Destination account ID</param>
    /// <param name="amount">Amount per transfer (default: 100)</param>
    /// <param name="concurrentRequests">Number of concurrent transfers (default: 5)</param>
    /// <param name="usePessimisticLock">Use pessimistic locking (default: false)</param>
    /// <returns>Summary of all transfer attempts</returns>
    [HttpPost("demo-concurrent-transfers")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> DemoConcurrentTransfers(
        [FromQuery] int fromAccountId,
        [FromQuery] int toAccountId,
        [FromQuery] decimal amount = 100,
        [FromQuery] int concurrentRequests = 5,
        [FromQuery] bool usePessimisticLock = false)
    {
        _logger.LogInformation(
            "Starting concurrent transfer demo: {Count} requests, Amount: {Amount:C}, Pessimistic: {Pessimistic}",
            concurrentRequests, amount, usePessimisticLock);

        var dto = new TransferDto(fromAccountId, toAccountId, amount);
        
        var startTime = DateTime.UtcNow;
        
        // Launch concurrent requests
        var tasks = Enumerable.Range(0, concurrentRequests)
            .Select(i => ExecuteTransferWithTiming(i, dto, usePessimisticLock))
            .ToList();

        var results = await Task.WhenAll(tasks);
        
        var totalTime = DateTime.UtcNow - startTime;

        var summary = new
        {
            TotalRequests = concurrentRequests,
            Successful = results.Count(r => r.Result.Success),
            Failed = results.Count(r => !r.Result.Success),
            TotalTimeMs = totalTime.TotalMilliseconds,
            AverageTimeMs = results.Average(r => r.DurationMs),
            UsedPessimisticLock = usePessimisticLock,
            Results = results.Select(r => new 
            { 
                Request = r.RequestNumber + 1, 
                r.Result.Success, 
                r.Result.Message,
                DurationMs = r.DurationMs
            })
        };

        return Ok(summary);
    }

    private async Task<(int RequestNumber, TransferResult Result, double DurationMs)> ExecuteTransferWithTiming(
        int requestNumber, TransferDto dto, bool usePessimisticLock)
    {
        var startTime = DateTime.UtcNow;
        
        var result = usePessimisticLock
            ? await _transferService.TransferWithPessimisticLockAsync(dto)
            : await _transferService.TransferAsync(dto);
        
        var duration = (DateTime.UtcNow - startTime).TotalMilliseconds;
        
        return (requestNumber, result, duration);
    }
}
