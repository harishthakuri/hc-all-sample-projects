-- =============================================
-- PostgreSQL Functions for Customer CRUD Operations
-- Database: CustomerDB
-- Note: PostgreSQL uses snake_case naming convention for columns and parameters
-- =============================================

-- Note: PostgreSQL uses functions instead of stored procedures
-- Function names are case-insensitive in PostgreSQL, but we use lowercase for consistency

-- =============================================
-- Function: sp_getallcustomers
-- Description: Retrieves all customers from the database
-- Returns: TABLE with customer data (using snake_case column names)
-- =============================================
DROP FUNCTION IF EXISTS public.sp_getallcustomers() CASCADE;

CREATE OR REPLACE FUNCTION public.sp_getallcustomers()
RETURNS TABLE (
    id INTEGER,
    display_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    is_active BOOLEAN
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id, 
        c.display_name, 
        c.first_name, 
        c.last_name, 
        c.email, 
        c.phone, 
        c.is_active
    FROM public.customers c
    ORDER BY c.id;
END;
$$;

-- =============================================
-- Function: sp_getcustomerbyid
-- Description: Retrieves a customer by ID
-- Parameters: p_id - Customer ID
-- Returns: TABLE with customer data (using snake_case column names)
-- =============================================
DROP FUNCTION IF EXISTS public.sp_getcustomerbyid(p_id INTEGER) CASCADE;

CREATE OR REPLACE FUNCTION public.sp_getcustomerbyid(p_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    display_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    is_active BOOLEAN
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id, 
        c.display_name, 
        c.first_name, 
        c.last_name, 
        c.email, 
        c.phone, 
        c.is_active
    FROM public.customers c
    WHERE c.id = p_id;
END;
$$;

-- =============================================
-- Function: sp_createcustomer
-- Description: Creates a new customer and returns the new ID
-- Parameters: All customer fields (using snake_case naming)
-- Returns: New customer ID via OUT parameter
-- =============================================
DROP FUNCTION IF EXISTS public.sp_createcustomer(
    p_display_name VARCHAR(255),
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_email VARCHAR(255),
    p_phone VARCHAR(50),
    p_is_active BOOLEAN,
    OUT p_new_id INTEGER
) CASCADE;

CREATE OR REPLACE FUNCTION public.sp_createcustomer(
    p_display_name VARCHAR(255),
    p_first_name VARCHAR(100) DEFAULT NULL,
    p_last_name VARCHAR(100) DEFAULT NULL,
    p_email VARCHAR(255) DEFAULT NULL,
    p_phone VARCHAR(50) DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT TRUE,
    OUT p_new_id INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.customers (display_name, first_name, last_name, email, phone, is_active)
    VALUES (p_display_name, p_first_name, p_last_name, p_email, p_phone, p_is_active)
    RETURNING id INTO p_new_id;
END;
$$;

-- =============================================
-- Function: sp_updatecustomer
-- Description: Updates an existing customer
-- Parameters: Customer ID and all updatable fields (using snake_case naming)
-- Returns: Number of rows affected via OUT parameter
-- =============================================
DROP FUNCTION IF EXISTS public.sp_updatecustomer(
    p_id INTEGER,
    p_display_name VARCHAR(255),
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_email VARCHAR(255),
    p_phone VARCHAR(50),
    p_is_active BOOLEAN,
    OUT p_rows_affected INTEGER
) CASCADE;

CREATE OR REPLACE FUNCTION public.sp_updatecustomer(
    p_id INTEGER,
    p_display_name VARCHAR(255),
    p_first_name VARCHAR(100) DEFAULT NULL,
    p_last_name VARCHAR(100) DEFAULT NULL,
    p_email VARCHAR(255) DEFAULT NULL,
    p_phone VARCHAR(50) DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT TRUE,
    OUT p_rows_affected INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.customers
    SET 
        display_name = p_display_name,
        first_name = p_first_name,
        last_name = p_last_name,
        email = p_email,
        phone = p_phone,
        is_active = p_is_active
    WHERE id = p_id;
    
    GET DIAGNOSTICS p_rows_affected = ROW_COUNT;
END;
$$;

-- =============================================
-- Function: sp_deletecustomer
-- Description: Deletes a customer by ID
-- Parameters: p_id - Customer ID
-- Returns: Number of rows affected via OUT parameter
-- =============================================
DROP FUNCTION IF EXISTS public.sp_deletecustomer(
    p_id INTEGER,
    OUT p_rows_affected INTEGER
) CASCADE;

CREATE OR REPLACE FUNCTION public.sp_deletecustomer(
    p_id INTEGER,
    OUT p_rows_affected INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.customers
    WHERE id = p_id;
    
    GET DIAGNOSTICS p_rows_affected = ROW_COUNT;
END;
$$;

-- =============================================
-- Function: sp_customerexists
-- Description: Checks if a customer exists by ID
-- Parameters: p_id - Customer ID
-- Returns: TRUE if exists, FALSE if not via OUT parameter
-- =============================================
DROP FUNCTION IF EXISTS public.sp_customerexists(
    p_id INTEGER,
    OUT p_exists BOOLEAN
) CASCADE;

CREATE OR REPLACE FUNCTION public.sp_customerexists(
    p_id INTEGER,
    OUT p_exists BOOLEAN
) 
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT EXISTS(SELECT 1 FROM public.customers WHERE id = p_id) INTO p_exists;
END;
$$;

-- Verify functions creation
SELECT 
    routine_schema,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name LIKE 'sp_%customer%'
ORDER BY routine_name;
