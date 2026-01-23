-- =============================================
-- Customer Table Creation Script for PostgreSQL
-- Database: CustomerDB
-- Note: PostgreSQL uses snake_case naming convention
-- =============================================

-- Create database if it doesn't exist (run this as superuser)
-- CREATE DATABASE CustomerDB;

-- Connect to the database
-- \c CustomerDB;

-- Drop table if exists (for development/testing purposes)
DROP TABLE IF EXISTS public.customers CASCADE;

-- Create Customers table with snake_case column names
CREATE TABLE public.customers
(
    id SERIAL PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create indexes for better query performance
CREATE INDEX IX_Customers_Email ON public.customers(email) WHERE email IS NOT NULL;
CREATE INDEX IX_Customers_IsActive ON public.customers(is_active);
CREATE INDEX IX_Customers_DisplayName ON public.customers(display_name);

-- Insert sample data (optional)
INSERT INTO public.customers (display_name, first_name, last_name, email, phone, is_active)
VALUES
    ('John Doe', 'John', 'Doe', 'john.doe@example.com', '555-0101', TRUE),
    ('Jane Smith', 'Jane', 'Smith', 'jane.smith@example.com', '555-0102', TRUE),
    ('Bob Johnson', 'Bob', 'Johnson', 'bob.johnson@example.com', '555-0103', FALSE);

-- Verify table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'customers'
ORDER BY ordinal_position;

-- =============================================
-- Create Functions (PostgreSQL equivalent of stored procedures)
-- =============================================
-- Note: Functions are created in a separate script file
-- Run CreateFunctions.sql after this script
