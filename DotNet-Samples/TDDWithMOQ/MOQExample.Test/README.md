

## Run Test

```bash

dotnet test MOQExample.Test/MOQExample.Test.csproj --verbosity normal


dotnet test MOQExample.Test/MOQExample.Test.csproj --verbosity normal

```




## ProductController Test Suites

##### Summary
Added unit tests for ProductController. The test suite now includes 7 tests covering the AddProduct method:


1. AddProduct_ReturnBadRequestResult_WhenModelIsInvalid (existing, fixed)
 - Tests validation errors when product data is invalid

2. AddProduct_ReturnsOkResult_WhenProductIsValid
 - Verifies successful product addition returns OkObjectResult with true

3. AddProduct_CallsRepositoryWithCorrectProduct
 - Verifies the repository is called with the correct product data

4. AddProduct_ReturnsOkResult_WhenRepositoryReturnsFalse
 - Tests behavior when repository returns false

5. AddProduct_ThrowsException_WhenRepositoryThrowsArgumentNullException
 - Tests exception handling when repository throws ArgumentNullException

6. AddProduct_ThrowsException_WhenRepositoryThrowsArgumentOutOfRangeException
 - Tests exception handling when repository throws ArgumentOutOfRangeException

7. AddProduct_HandlesNullProduct
 - Tests behavior when a null product is passed

