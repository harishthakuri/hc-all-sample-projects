using Microsoft.EntityFrameworkCore;
using WebApi.Configuration;

namespace WebApi;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add database services with validated configuration (Options pattern)
        builder.Services.AddDatabaseServices(builder.Configuration);

        // Register services for dependency injection
        builder.Services.AddScoped<IProductService, ProductService>();
        builder.Services.AddScoped<IBankTransferService, BankTransferService>();

        builder.Services.AddControllers();
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
            {
                Title = "Concurrency Sample API",
                Version = "v1",
                Description = "A sample API demonstrating database-level locking and concurrency control with EF Core.\n\n" +
                              "**Key Features:**\n" +
                              "- Optimistic Concurrency (RowVersion) - Products API\n" +
                              "- Pessimistic Concurrency (Database Locks) - Bank Transfer API\n" +
                              "- Concurrent transfer demo endpoint"
            });
        });

        var app = builder.Build();

        // Apply migrations on startup (can be disabled via configuration)
        var autoMigrate = builder.Configuration.GetValue<bool>("AutoMigrate", false);
        if (autoMigrate)
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            
            try
            {
                logger.LogInformation("Applying database migrations...");
                db.Database.Migrate();
                logger.LogInformation("Database migrations applied successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while applying migrations. " +
                    "Make sure SQL Server is running and the connection string is correct.");
            }
        }
        else
        {
            app.Logger.LogInformation("Auto-migration disabled. Run 'dotnet ef database update' manually.");
        }

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "Concurrency Sample API v1");
                options.DocumentTitle = "Concurrency Sample API";
            });
        }

        app.UseHttpsRedirection();

        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}
