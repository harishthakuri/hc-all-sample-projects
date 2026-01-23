namespace WebApi;

/// <summary>
/// Exception thrown when a concurrency conflict is detected during database operations.
/// This typically occurs when trying to update a record that has been modified by another user/process.
/// </summary>
public class ConcurrencyException : Exception
{
    public ConcurrencyException(string message) : base(message)
    {
    }

    public ConcurrencyException(string message, Exception innerException) 
        : base(message, innerException)
    {
    }
}
