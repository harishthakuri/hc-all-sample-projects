-- =============================================
-- Stored Procedures for Customer CRUD Operations
-- Database: CustomerDB
-- =============================================

USE CustomerDB;
GO

-- =============================================
-- Stored Procedure: sp_GetAllCustomers
-- Description: Retrieves all customers from the database
-- =============================================
IF OBJECT_ID('dbo.sp_GetAllCustomers', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.sp_GetAllCustomers;
END
GO

CREATE PROCEDURE dbo.sp_GetAllCustomers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id, 
        DisplayName, 
        FirstName, 
        LastName, 
        Email, 
        Phone, 
        IsActive
    FROM dbo.Customers
    ORDER BY Id;
END
GO

-- =============================================
-- Stored Procedure: sp_GetCustomerById
-- Description: Retrieves a customer by ID
-- Parameters: @Id - Customer ID
-- =============================================
IF OBJECT_ID('dbo.sp_GetCustomerById', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.sp_GetCustomerById;
END
GO

CREATE PROCEDURE dbo.sp_GetCustomerById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id, 
        DisplayName, 
        FirstName, 
        LastName, 
        Email, 
        Phone, 
        IsActive
    FROM dbo.Customers
    WHERE Id = @Id;
END
GO

-- =============================================
-- Stored Procedure: sp_CreateCustomer
-- Description: Creates a new customer and returns the new ID
-- Parameters: All customer fields
-- Returns: New customer ID via OUTPUT parameter
-- =============================================
IF OBJECT_ID('dbo.sp_CreateCustomer', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.sp_CreateCustomer;
END
GO

CREATE PROCEDURE dbo.sp_CreateCustomer
    @DisplayName NVARCHAR(255),
    @FirstName NVARCHAR(100) = NULL,
    @LastName NVARCHAR(100) = NULL,
    @Email NVARCHAR(255) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @IsActive BIT = 1,
    @NewId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO dbo.Customers (DisplayName, FirstName, LastName, Email, Phone, IsActive)
    VALUES (@DisplayName, @FirstName, @LastName, @Email, @Phone, @IsActive);
    
    SET @NewId = SCOPE_IDENTITY();
END
GO

-- =============================================
-- Stored Procedure: sp_UpdateCustomer
-- Description: Updates an existing customer
-- Parameters: Customer ID and all updatable fields
-- Returns: Number of rows affected
-- =============================================
IF OBJECT_ID('dbo.sp_UpdateCustomer', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.sp_UpdateCustomer;
END
GO

CREATE PROCEDURE dbo.sp_UpdateCustomer
    @Id INT,
    @DisplayName NVARCHAR(255),
    @FirstName NVARCHAR(100) = NULL,
    @LastName NVARCHAR(100) = NULL,
    @Email NVARCHAR(255) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @IsActive BIT = 1,
    @RowsAffected INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Customers
    SET 
        DisplayName = @DisplayName,
        FirstName = @FirstName,
        LastName = @LastName,
        Email = @Email,
        Phone = @Phone,
        IsActive = @IsActive
    WHERE Id = @Id;
    
    SET @RowsAffected = @@ROWCOUNT;
END
GO

-- =============================================
-- Stored Procedure: sp_DeleteCustomer
-- Description: Deletes a customer by ID
-- Parameters: @Id - Customer ID
-- Returns: Number of rows affected
-- =============================================
IF OBJECT_ID('dbo.sp_DeleteCustomer', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.sp_DeleteCustomer;
END
GO

CREATE PROCEDURE dbo.sp_DeleteCustomer
    @Id INT,
    @RowsAffected INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM dbo.Customers
    WHERE Id = @Id;
    
    SET @RowsAffected = @@ROWCOUNT;
END
GO

-- =============================================
-- Stored Procedure: sp_CustomerExists
-- Description: Checks if a customer exists by ID
-- Parameters: @Id - Customer ID
-- Returns: 1 if exists, 0 if not
-- =============================================
IF OBJECT_ID('dbo.sp_CustomerExists', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.sp_CustomerExists;
END
GO

CREATE PROCEDURE dbo.sp_CustomerExists
    @Id INT,
    @Exists BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM dbo.Customers WHERE Id = @Id)
        SET @Exists = 1;
    ELSE
        SET @Exists = 0;
END
GO

-- Verify stored procedures creation
SELECT 
    ROUTINE_SCHEMA,
    ROUTINE_NAME,
    ROUTINE_TYPE
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE'
    AND ROUTINE_NAME LIKE 'sp_%Customer%'
ORDER BY ROUTINE_NAME;
GO

PRINT 'All stored procedures created successfully!';
GO
