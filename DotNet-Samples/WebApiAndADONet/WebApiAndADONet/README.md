
### How to switch database
1. Switch to PostgreSQL in appsettings.json:


```json
"Database": { 
  "Provider": "PostgreSQL"
},
"ConnectionStrings": {"DefaultConnection": "Host=localhost;Database=CustomerDB;Username=your_user;Password=your_password;"
}

```

2. Restore packages:

```bash
dotnet restore
```

3. Run PostgreSQL scripts:

 - First: Data/Scripts/PostgreSQL/CreateCustomerTable.sql
 - Then: Data/Scripts/PostgreSQL/CreateFunctions.sql

