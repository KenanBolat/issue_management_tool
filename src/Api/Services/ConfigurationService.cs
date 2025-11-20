using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Domain.Entities;
using Api.DTOs;

namespace Api.Services;

public class ConfigurationService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ConfigurationService> _logger;

    public ConfigurationService(AppDbContext context, ILogger<ConfigurationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get current active configuration (singleton pattern)
    /// </summary>
    public async Task<ConfigurationResponse> GetCurrentConfigurationAsync()
    {
        var config = await _context.Configurations
            .Include(c => c.UpdatedBy)
            .Where(c => c.IsActive)
            .OrderByDescending(c => c.UpdatedDate)
            .FirstOrDefaultAsync();

        // If no configuration exists, create default one
        if (config == null)
        {
            config = new Configuration
            {
                PdfReportDate = DateTime.UtcNow,
                IsActive = true,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };
            
            _context.Configurations.Add(config);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Created default configuration");
        }

        return MapToResponse(config);
    }

    /// <summary>
    /// Update configuration
    /// </summary>
    public async Task<ConfigurationResponse> UpdateConfigurationAsync(
        UpdateConfigurationRequest request, 
        long updatedById)
    {
        // Get or create active configuration
        var config = await _context.Configurations
            .Where(c => c.IsActive)
            .OrderByDescending(c => c.UpdatedDate)
            .FirstOrDefaultAsync();

        if (config == null)
        {
            config = new Configuration
            {
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };
            _context.Configurations.Add(config);
        }

        // Update fields
        config.ExpirationDate = request.ExpirationDate;
        config.PdfReportDate = request.PdfReportDate;
        config.UpdatedDate = DateTime.UtcNow;
        config.UpdatedById = updatedById;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Configuration updated by UserId: {UserId}. PdfReportDate: {PdfReportDate}",
            updatedById,
            request.PdfReportDate
        );

        // Reload to get UpdatedBy user info
        await _context.Entry(config).Reference(c => c.UpdatedBy).LoadAsync();

        return MapToResponse(config);
    }

    private ConfigurationResponse MapToResponse(Configuration config)
    {
        return new ConfigurationResponse(
            config.Id,
            config.ExpirationDate,
            config.PdfReportDate,
            config.IsActive,
            config.CreatedDate,
            config.UpdatedDate,
            config.UpdatedBy?.DisplayName
        );
    }
}