IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    CREATE TABLE [BankAccounts] (
        [Id] int NOT NULL IDENTITY,
        [AccountNumber] nvarchar(20) NOT NULL,
        [AccountHolder] nvarchar(200) NOT NULL,
        [Balance] decimal(18,2) NOT NULL,
        [Currency] nvarchar(3) NOT NULL DEFAULT N'USD',
        [RowVersion] rowversion NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_BankAccounts] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_BankAccounts_Balance] CHECK ([Balance] >= 0)
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Products] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(max) NULL,
        [Price] decimal(18,2) NOT NULL,
        [Stock] int NOT NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Transfers] (
        [Id] int NOT NULL IDENTITY,
        [FromAccountId] int NOT NULL,
        [ToAccountId] int NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [TransferDate] datetime2 NOT NULL,
        [CompletedAt] datetime2 NULL,
        [ErrorMessage] nvarchar(500) NULL,
        CONSTRAINT [PK_Transfers] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Transfers_DifferentAccounts] CHECK ([FromAccountId] <> [ToAccountId]),
        CONSTRAINT [CK_Transfers_PositiveAmount] CHECK ([Amount] > 0),
        CONSTRAINT [FK_Transfers_BankAccounts_FromAccountId] FOREIGN KEY ([FromAccountId]) REFERENCES [BankAccounts] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Transfers_BankAccounts_ToAccountId] FOREIGN KEY ([ToAccountId]) REFERENCES [BankAccounts] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    CREATE TABLE [InventoryTransactions] (
        [Id] int NOT NULL IDENTITY,
        [ProductId] int NOT NULL,
        [TransactionType] nvarchar(50) NOT NULL,
        [Quantity] int NOT NULL,
        [PreviousStock] int NOT NULL,
        [NewStock] int NOT NULL,
        [TransactionDate] datetime2 NOT NULL,
        [UserId] nvarchar(100) NULL,
        [Notes] nvarchar(500) NULL,
        CONSTRAINT [PK_InventoryTransactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_InventoryTransactions_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AccountHolder', N'AccountNumber', N'Balance', N'CreatedAt', N'Currency', N'IsActive', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[BankAccounts]'))
        SET IDENTITY_INSERT [BankAccounts] ON;
    EXEC(N'INSERT INTO [BankAccounts] ([Id], [AccountHolder], [AccountNumber], [Balance], [CreatedAt], [Currency], [IsActive], [UpdatedAt])
    VALUES (1, N''John Doe'', N''ACC-001'', 10000.0, ''2024-01-01T00:00:00.0000000Z'', N''USD'', CAST(1 AS bit), ''2024-01-01T00:00:00.0000000Z''),
    (2, N''Jane Smith'', N''ACC-002'', 5000.0, ''2024-01-01T00:00:00.0000000Z'', N''USD'', CAST(1 AS bit), ''2024-01-01T00:00:00.0000000Z''),
    (3, N''Bob Wilson'', N''ACC-003'', 7500.0, ''2024-01-01T00:00:00.0000000Z'', N''USD'', CAST(1 AS bit), ''2024-01-01T00:00:00.0000000Z'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AccountHolder', N'AccountNumber', N'Balance', N'CreatedAt', N'Currency', N'IsActive', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[BankAccounts]'))
        SET IDENTITY_INSERT [BankAccounts] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Name', N'Price', N'Stock', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Products]'))
        SET IDENTITY_INSERT [Products] ON;
    EXEC(N'INSERT INTO [Products] ([Id], [CreatedAt], [Description], [Name], [Price], [Stock], [UpdatedAt])
    VALUES (1, ''2024-01-01T00:00:00.0000000Z'', N''Latest iPhone with A17 chip'', N''iPhone 15 Pro'', 999.99, 100, ''2024-01-01T00:00:00.0000000Z''),
    (2, ''2024-01-01T00:00:00.0000000Z'', N''M3 Pro chip, 18GB RAM'', N''MacBook Pro 14"'', 1999.99, 50, ''2024-01-01T00:00:00.0000000Z''),
    (3, ''2024-01-01T00:00:00.0000000Z'', N''Active Noise Cancellation, USB-C'', N''AirPods Pro 2'', 249.99, 200, ''2024-01-01T00:00:00.0000000Z'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Name', N'Price', N'Stock', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Products]'))
        SET IDENTITY_INSERT [Products] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_BankAccounts_AccountNumber] ON [BankAccounts] ([AccountNumber]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_InventoryTransactions_ProductId] ON [InventoryTransactions] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_InventoryTransactions_TransactionDate] ON [InventoryTransactions] ([TransactionDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Products_Name] ON [Products] ([Name]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Transfers_FromAccountId] ON [Transfers] ([FromAccountId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Transfers_ToAccountId] ON [Transfers] ([ToAccountId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Transfers_TransferDate] ON [Transfers] ([TransferDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122200538_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260122200538_InitialCreate', N'8.0.11');
END;
GO

COMMIT;
GO

