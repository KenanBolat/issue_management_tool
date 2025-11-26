using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Application.Services;
using Infrastructure.Auth;
using Infrastructure.Data;
using Api.Data;
using Api.Services;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using StackExchange.Redis;
using Api.Hubs;



var builder = WebApplication.CreateBuilder(args);

// Add console logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

Console.WriteLine("Starting application...");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                
                return Task.CompletedTask;
            }
        };
    });

// Redis IDistributedCache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration["Redis:ConnectionString"];
    options.InstanceName = "tickettracker:";
});

builder.Services.AddAuthorization();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<TicketService>();
builder.Services.AddScoped<SummaryBuilder>();
builder.Services.AddScoped<ICacheService, RedisCacheService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();


builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Satellite Ticket Tracker API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // Get allowed origins from configuration
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
        
        // If no origins configured, try environment variable
        if (allowedOrigins == null || allowedOrigins.Length == 0)
        {
            var originsEnv = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
            if (!string.IsNullOrEmpty(originsEnv))
            {
                // Split by comma or semicolon
                allowedOrigins = originsEnv.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(o => o.Trim())
                    .ToArray();
            }
        }

        // Fallback to localhost if nothing configured
        if (allowedOrigins == null || allowedOrigins.Length == 0)
        {
            allowedOrigins = new[] { "http://localhost:3000", "http://localhost:5173" };
            Console.WriteLine("WARNING: No CORS origins configured, using localhost defaults");
        }

        Console.WriteLine($"CORS: Allowing origins: {string.Join(", ", allowedOrigins)}");

        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); 
    });
});
builder.Services.AddScoped<ExcelExportService>();
builder.Services.AddScoped<ConfigurationService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddSignalR();



var app = builder.Build();

Console.WriteLine("Application built, starting database initialization...");

// Database initialization with better error handling
try
{
    using (var scope = app.Services.CreateScope())
    {
        Console.WriteLine("Creating service scope...");
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        Console.WriteLine("Testing database connection...");
        if (await context.Database.CanConnectAsync())
        {
            Console.WriteLine("Database connection successful!");
        }
        else
        {
            Console.WriteLine("WARNING: Cannot connect to database!");
        }
        
        Console.WriteLine("Applying migrations...");
        await context.Database.MigrateAsync();
        Console.WriteLine("Migrations applied successfully!");
        
        Console.WriteLine("Seeding database...");
        await DbSeeder.SeedAsync(context);
        Console.WriteLine("Database seeded successfully!");

        Console.WriteLine("Seeding Militray Ranks!");
        await MilitaryRankSeeder.SeedMilitaryRanks(context);
        Console.WriteLine("Military ranks seeded successfully!");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"ERROR during database initialization: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    // Don't exit - let the app run anyway for debugging
}

Console.WriteLine("Configuring middleware...");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    Console.WriteLine("Swagger enabled at /swagger");
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");


Console.WriteLine("Application configured successfully!");
Console.WriteLine("Starting web server...");

app.Run();