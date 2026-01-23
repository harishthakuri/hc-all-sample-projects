


#### MS SQL SERVER 2022 Database is on Remote server
Remote server IP: `192.168.1.61` and port `1433`


ASP.NET Core uses appsettings.Development.json when running in Development mode

`appsettings.Development.json` database connection configuration
```json
"ConnectionStrings": {
    "DefaultConnection": "Server=tcp:192.168.1.61,1433;Database=ConcurrencySampleDB;User Id=<db-user-name>;Password=<db-password>;TrustServerCertificate=True;Encrypt=False;Connection Timeout=30;MultiSubnetFailover=True;"
  },
```
OR
```json
   "ConnectionStrings": {
      "DefaultConnection": "Server=192.168.1.61,1433;Database=ConcurrencySampleDB;User Id=<db-user-name>;Password=<db-password>;TrustServerCertificate=True;Encrypt=False;Connection Timeout=30;MultiSubnetFailover=True;"
  },
```

##### Install dotnet-ef tool, if not already installed

```bash
dotnet tool install --global dotnet-ef


'
Tools directory '/Users/<user_name>/.dotnet/tools' is not currently on the PATH environment variable.
If you are using zsh, you can add it to your profile by running the following command:

cat << \EOF >> ~/.zprofile
# Add .NET Core SDK tools
export PATH="$PATH:/Users/<user_name>/.dotnet/tools"
EOF

And run `zsh -l` to make it available for current session.

You can only add it to the current session by running the following command:

export PATH="$PATH:/Users/<user_name>/.dotnet/tools"

You can invoke the tool using the following command: dotnet-ef
Tool 'dotnet-ef' (version '10.0.2') was successfully installed.
'
```


##### Create database migration

```bash
dotnet ef migrations add InitialCreate
```


##### Apply Database migration

```bash
Apply Database Migration
```




##### Project Structure

Concurrency_Sample/
├── Models/
│   ├── Product.cs           # Product with RowVersion concurrency token
│   ├── InventoryTransaction.cs  # Audit trail for stock changes
│   ├── BankAccount.cs       # Bank account with RowVersion
│   └── Transfer.cs          # Transfer records
├── DTOs/
│   ├── ProductDtos.cs       # Product DTOs (Create, Update, Stock)
│   └── BankAccountDtos.cs   # Account & Transfer DTOs
├── Data/
│   └── ApplicationDbContext.cs  # EF Core DbContext with configurations
├── Exceptions/
│   └── ConcurrencyException.cs  # Custom exception for conflicts
├── Services/
│   ├── IProductService.cs   # Product service interface
│   ├── ProductService.cs    # Optimistic concurrency implementation
│   ├── IBankTransferService.cs  # Transfer service interface
│   └── BankTransferService.cs   # Both optimistic & pessimistic locking
├── Controllers/
│   ├── ProductsController.cs    # Product CRUD with concurrency
│   └── BankAccountsController.cs # Transfers with demo endpoint
├── Migrations/
│   └── InitialCreate.cs     # Database migration
├── Program.cs               # Updated with DI and EF Core
├── appsettings.json         # SQL Server connection string
├── appsettings.Development.json         # SQL Server connection string








Next Step: Apply Database Migration
The database connection works differently from your terminal. Open a new terminal window (outside Cursor) and run:

cd /Users/user_name/RiderProjects/Concurrency_Sample
export PATH="$PATH:/Users/user_name/.dotnet/tools"
dotnet ef database update


cd /Users/user_name/RiderProjects/Concurrency_Sampleexport PATH="$PATH:/Users/harishchand/.dotnet/tools"dotnet ef database update
Or run dotnet run directly from your terminal:

cd /Users/user_name/RiderProjects/Concurrency_Sampledotnet run

With AutoMigrate enabled:
cd /Users/user_name/RiderProjects/Concurrency_Sampledotnet run --AutoMigrate=true
The Swagger UI is available at: http://localhost:5237/swagger