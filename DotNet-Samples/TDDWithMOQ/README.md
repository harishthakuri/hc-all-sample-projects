## Simple xUnit and MOQ example for ASP.NET Core API

xUnit is generally more modern, performance efficient and recommended choice for new ASP.NET Core API project.
Its focus on test isolation by default helps enforce cleaner, independent unit tests, which is ideal for TDD (Test-Driven Development). Microsoft's own documentation often defaults to xUnit examples for .NET Core testing.




## Run test
```bash
dotnet test MOQExample.Test/MOQExample.Test.csproj --verbosity normal
```
