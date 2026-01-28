var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// Health check endpoint
app.MapGet("/health", () => new { status = "healthy", service = "ProductService" });

// Products endpoint
app.MapGet("/products", () =>
{
    var products = new[]
    {
        new { Id = 1, Name = "Laptop", Price = 999.99m, Category = "Electronics" },
        new { Id = 2, Name = "Mouse", Price = 29.99m, Category = "Electronics" },
        new { Id = 3, Name = "Keyboard", Price = 79.99m, Category = "Electronics" },
        new { Id = 4, Name = "Monitor", Price = 299.99m, Category = "Electronics" },
        new { Id = 5, Name = "Desk Chair", Price = 199.99m, Category = "Furniture" }
    };

    return Results.Ok(products);
});

// Get product by ID
app.MapGet("/products/{id:int}", (int id) =>
{
    var products = new[]
    {
        new { Id = 1, Name = "Laptop", Price = 999.99m, Category = "Electronics" },
        new { Id = 2, Name = "Mouse", Price = 29.99m, Category = "Electronics" },
        new { Id = 3, Name = "Keyboard", Price = 79.99m, Category = "Electronics" },
        new { Id = 4, Name = "Monitor", Price = 299.99m, Category = "Electronics" },
        new { Id = 5, Name = "Desk Chair", Price = 199.99m, Category = "Furniture" }
    };

    var product = products.FirstOrDefault(p => p.Id == id);
    
    return product is not null 
        ? Results.Ok(product) 
        : Results.NotFound(new { message = $"Product with ID {id} not found" });
});

app.Run();
