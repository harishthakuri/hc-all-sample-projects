
# Web API with ADO.NET CRUD operations
This project demonstrate how to use ADO.NET with modern ASP.NET core API

### Completed steps
 - Added Microsoft.Data.SqlClient NuGet package
 - Configured connection string in appsettings.json
 - Created DTOs (CreateCustomerDto, UpdateCustomerDto)
 - Enhanced Customer entity with factory methods and encapsulation
 - Created repository interface (ICustomerRepository)
 - Implemented repository with ADO.NET best practices
 - Registered repository in dependency injection
 - Implemented CRUD endpoints in CustomerController
 - Created database schema SQL script `data/scripts`
 - Created Stored Procedure SQL script `data/scripts`


#### ADO.NET best practices implemented
 - Parameterized queries (SQL injection prevention)
 - Async/await for all database operations
 - Proper resource disposal with using statements
 - Error handling and logging
 - Null-safe database operations
 - Repository pattern for testability
 - Dependency injection
 - Separation of concerns (DTOs, Entities, Repositories)
