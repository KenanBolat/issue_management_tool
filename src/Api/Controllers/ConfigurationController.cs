using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Api.DTOs;
using Api.Services;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConfigurationController : ControllerBase
{
    private readonly ConfigurationService _service;
    private readonly ILogger<ConfigurationController> _logger;

    public ConfigurationController(
        ConfigurationService service,
        ILogger<ConfigurationController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Get current configuration
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ConfigurationResponse>> GetConfiguration()
    {
        try
        {
            var config = await _service.GetCurrentConfigurationAsync();
            return Ok(config);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving configuration");
            return StatusCode(500, new { message = "Failed to retrieve configuration" });
        }
    }

    /// <summary>
    /// Update configuration (Admin only)
    /// </summary>
    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ConfigurationResponse>> UpdateConfiguration(
        [FromBody] UpdateConfigurationRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!long.TryParse(userIdClaim, out long userId))
            {
                return Unauthorized(new { message = "Invalid user ID" });
            }

            var config = await _service.UpdateConfigurationAsync(request, userId);
            return Ok(config);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating configuration");
            return StatusCode(500, new { message = "Failed to update configuration" });
        }
    }
}