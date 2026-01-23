

namespace WebApi;

public interface IBankTransferService
{
    Task<IEnumerable<AccountDto>> GetAllAccountsAsync();
    Task<AccountDto?> GetAccountByIdAsync(int id);
    Task<AccountDto> CreateAccountAsync(CreateAccountDto dto);
    Task<TransferResult> TransferAsync(TransferDto dto);
    Task<TransferResult> TransferWithPessimisticLockAsync(TransferDto dto);
}
