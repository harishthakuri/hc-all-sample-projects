using WebApiAndADONet.Data.Configuration;
using WebApiAndADONet.Data.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register repositories based on database provider configuration
var databaseProvider = builder.Configuration.GetValue<string>("Database:Provider") ?? "SqlServer";
var providerEnum = Enum.TryParse<DatabaseProvider>(databaseProvider, true, out var parsedProvider) 
    ? parsedProvider 
    : DatabaseProvider.SqlServer;

switch (providerEnum)
{
    case DatabaseProvider.SqlServer:
        builder.Services.AddScoped<ICustomerRepository, SqlServerCustomerRepository>();
        break;
    case DatabaseProvider.PostgreSQL:
        builder.Services.AddScoped<ICustomerRepository, PostgreSqlCustomerRepository>();
        break;
    default:
        throw new InvalidOperationException($"Unsupported database provider: {databaseProvider}");
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();