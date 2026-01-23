using Microsoft.EntityFrameworkCore;


namespace WebApi;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add DbContext with dynamic provider selection
        var dbProvider = builder.Configuration.GetValue<string>("Database:Provider", "SqlServer");
        
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            switch (dbProvider.ToLower())
            {
                case "sqlserver":
                    options.UseSqlServer(
                        builder.Configuration.GetConnectionString("SqlServerConnection"),
                        sqlOptions =>
                        {
                            // Enable retry on failure for transient errors (connection issues, deadlocks)
                            sqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 3,
                                maxRetryDelay: TimeSpan.FromSeconds(5),
                                errorNumbersToAdd: null);
                            // Set command timeout (default is 30 seconds)
                            sqlOptions.CommandTimeout(30);
                        });
                    break;
                    
                case "postgresql":
                case "postgres":
                    options.UseNpgsql(
                        builder.Configuration.GetConnectionString("PostgreSqlConnection"),
                        npgsqlOptions =>
                        {
                            // Enable retry on failure for transient errors
                            npgsqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 3,
                                maxRetryDelay: TimeSpan.FromSeconds(5),
                                errorCodesToAdd: null);
                            // Set command timeout
                            npgsqlOptions.CommandTimeout(30);
                        });
                    break;
                    
                default:
                    throw new InvalidOperationException(
                        $"Unsupported database provider: {dbProvider}. Supported providers: SqlServer, PostgreSql");
            }
        });

        // Register database provider based on configuration
        builder.Services.AddSingleton<IDatabaseProvider>(sp =>
        {
            return dbProvider.ToLower() switch
            {
                "sqlserver" => new SqlServerProvider(),
                "postgresql" or "postgres" => new PostgreSqlProvider(),
                _ => throw new InvalidOperationException($"Unsupported database provider: {dbProvider}")
            };
        });

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
