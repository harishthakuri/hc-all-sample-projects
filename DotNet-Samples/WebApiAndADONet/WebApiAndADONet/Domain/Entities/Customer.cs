using WebApiAndADONet.Domain.DTOs;

namespace WebApiAndADONet.Domain.Entities;

public class Customer
{
    #region Core Properties - Essential Customer Data Only

    public int Id { get; private set; }
    public string DisplayName { get; private set; } = string.Empty;
    public string? FirstName { get; private set; }
    public string? LastName { get; private set; }
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public bool IsActive { get; private set; } = true;

    #endregion

    #region Constructors

    // Private parameterless constructor for entity framework/ADO.NET mapping
    private Customer() { }

    // Factory method for creating new customers
    public static Customer Create(string displayName, string? firstName = null, string? lastName = null, 
        string? email = null, string? phone = null, bool isActive = true)
    {
        return new Customer
        {
            DisplayName = displayName,
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            IsActive = isActive
        };
    }

    // Factory method from DTO
    public static Customer FromCreateDto(CreateCustomerDto dto)
    {
        return Create(
            dto.DisplayName,
            dto.FirstName,
            dto.LastName,
            dto.Email,
            dto.Phone,
            dto.IsActive
        );
    }

    // Factory method for mapping from database (with Id)
    public static Customer FromDatabase(int id, string displayName, string? firstName, string? lastName,
        string? email, string? phone, bool isActive)
    {
        return new Customer
        {
            Id = id,
            DisplayName = displayName,
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            IsActive = isActive
        };
    }

    #endregion

    #region Update Methods

    public void Update(UpdateCustomerDto dto)
    {
        DisplayName = dto.DisplayName;
        FirstName = dto.FirstName;
        LastName = dto.LastName;
        Email = dto.Email;
        Phone = dto.Phone;
        IsActive = dto.IsActive;
    }

    public void SetId(int id)
    {
        Id = id;
    }

    #endregion
}