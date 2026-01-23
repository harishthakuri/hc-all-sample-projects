-- =============================================
-- Customer Table Creation Script
-- Database: CustomerDB
-- =============================================

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CustomerDB')
BEGIN
    CREATE DATABASE CustomerDB;
END
GO

USE CustomerDB;
GO

-- Drop table if exists (for development/testing purposes)
IF OBJECT_ID('dbo.Customers', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Customers;
END
GO

-- Create Customers table
CREATE TABLE dbo.Customers
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DisplayName NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100) NULL,
    LastName NVARCHAR(100) NULL,
    Email NVARCHAR(255) NULL,
    Phone NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

-- Create indexes for better query performance
CREATE INDEX IX_Customers_Email ON dbo.Customers(Email) WHERE Email IS NOT NULL;
CREATE INDEX IX_Customers_IsActive ON dbo.Customers(IsActive);
CREATE INDEX IX_Customers_DisplayName ON dbo.Customers(DisplayName);
GO

-- Insert sample data (optional)
INSERT INTO dbo.Customers (DisplayName, FirstName, LastName, Email, Phone, IsActive)
VALUES
    ('John Doe', 'John', 'Doe', 'john.doe@example.com', '555-0101', 1),
    ('Jane Smith', 'Jane', 'Smith', 'jane.smith@example.com', '555-0102', 1),
    ('Bob Johnson', 'Bob', 'Johnson', 'bob.johnson@example.com', '555-0103', 0);
GO

-- Verify table creation
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Customers'
ORDER BY ORDINAL_POSITION;
GO

PRINT 'Customer table created successfully!';
GO

-- =============================================
-- Create Stored Procedures
-- =============================================
-- Note: Stored procedures are created in a separate script file
-- Run CreateStoredProcedures.sql after this script
PRINT 'Please run CreateStoredProcedures.sql to create the stored procedures.';
GO
