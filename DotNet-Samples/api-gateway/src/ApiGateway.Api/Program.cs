using System.Text;
using ApiGateway.Api.Configuration;
using ApiGateway.Api.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Ocelot.Provider.Consul;
using Ocelot.Provider.Polly;
using Ocelot.Cache.CacheManager;
using CacheManager.Core;

var builder = WebApplication.CreateBuilder(args);

// Add Ocelot configuration based on environment
var env = builder.Environment.EnvironmentName;
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Configuration.AddJsonFile($"ocelot.{env}.json", optional: true, reloadOnChange: true);

// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Configure JWT Settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>() 
    ?? throw new InvalidOperationException("JwtSettings configuration is missing");

// Configure Cache Settings
var cacheSettings = builder.Configuration.GetSection("CacheSettings").Get<CacheSettings>() 
    ?? new CacheSettings();

builder.Services.AddSingleton(cacheSettings);

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogWarning("Authentication failed: {Message}", context.Exception.Message);
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogInformation("Token validated for user: {User}", 
                    context.Principal?.Identity?.Name ?? "Unknown");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Define authorization policies
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("Admin"));
    
    options.AddPolicy("UserOrAdmin", policy => 
        policy.RequireRole("Admin", "User"));
    
    options.AddPolicy("RequireEmail", policy => 
        policy.RequireClaim("email"));
});

// Add IP-based rate limiting
builder.Services.AddSingleton<Microsoft.AspNetCore.Http.IHttpContextAccessor, Microsoft.AspNetCore.Http.HttpContextAccessor>();

// Configure caching based on provider
if (cacheSettings.Provider.Equals("Redis", StringComparison.OrdinalIgnoreCase))
{
    Console.WriteLine($"Configuring Redis caching with connection: {cacheSettings.Redis.ConnectionString}");
    
    // Parse Redis connection string
    var redisConnectionParts = cacheSettings.Redis.ConnectionString.Split(':');
    var redisHost = redisConnectionParts[0];
    var redisPort = redisConnectionParts.Length > 1 && int.TryParse(redisConnectionParts[1], out var port) ? port : 6379;
    
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = cacheSettings.Redis.ConnectionString;
        options.InstanceName = cacheSettings.Redis.InstanceName;
    });
    
    builder.Services
        .AddOcelot(builder.Configuration)
        .AddConsul()
        .AddPolly()
        .AddCacheManager(x =>
        {
            x.WithJsonSerializer()
             .WithRedisConfiguration("redis", config =>
             {
                 config.WithAllowAdmin()
                     .WithDatabase(0)
                     .WithEndpoint(redisHost, redisPort);
             })
             .WithMaxRetries(100)
             .WithRetryTimeout(50)
             .WithRedisBackplane("redis")
             .WithRedisCacheHandle("redis", true);
        });
}
else
{
    // Default to in-memory caching
    Console.WriteLine("Configuring In-Memory caching");
    
    builder.Services
        .AddOcelot(builder.Configuration)
        .AddConsul()
        .AddPolly();
}


var app = builder.Build();

// Add health check middleware (MUST be first to bypass Ocelot)
app.UseMiddleware<HealthCheckMiddleware>();

// Add client ID middleware for rate limiting (uses IP address)
app.UseMiddleware<ClientIdMiddleware>();

// Add correlation ID middleware for distributed tracing
app.UseMiddleware<CorrelationIdMiddleware>();

// Add cache header middleware to track cache hits/misses
app.UseMiddleware<CacheHeaderMiddleware>();

// Add authentication and authorization middleware (must be before Ocelot)
app.UseAuthentication();
app.UseAuthorization();

// Use Ocelot middleware (this should be last)
app.UseOcelot().Wait();

app.Run();
