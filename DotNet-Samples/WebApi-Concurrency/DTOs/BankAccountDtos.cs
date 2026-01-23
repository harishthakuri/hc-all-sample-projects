using System.ComponentModel.DataAnnotations;

namespace WebApi;

public record AccountDto(
    int Id,
    string AccountNumber,
    string AccountHolder,
    decimal Balance,
    string Currency);

public record CreateAccountDto(
    [Required] string AccountNumber,
    [Required] string AccountHolder,
    [Range(0, double.MaxValue)] decimal InitialBalance = 0,
    string Currency = "USD");

public record TransferDto(
    [Range(1, int.MaxValue)] int FromAccountId,
    [Range(1, int.MaxValue)] int ToAccountId,
    [Range(0.01, double.MaxValue)] decimal Amount);

public record TransferResult(
    bool Success,
    string Message,
    int? TransferId = null,
    decimal? FromBalance = null,
    decimal? ToBalance = null);
