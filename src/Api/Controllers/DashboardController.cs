using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.DTOs;
using Domain.Enums;
using Infrastructure.Data;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> GetDashboard()
    {

        // Get all active tickets with their status
        var tickets = await _context.Tickets
            .Where(t => t.IsActive && !t.IsDeleted)
            .Select(t => t.Status)
            .ToListAsync();

        // ✅ Initialize dictionary with all possible statuses
        var statusCounts = Enum.GetValues<TicketStatus>()
            .ToDictionary(s => s.ToString(), s => 0);

        // Update with actual counts
        foreach (var status in tickets)
        {
            var key = status.ToString();
            if (statusCounts.ContainsKey(key))
            {
                statusCounts[key]++;
            }
            else
            {
                statusCounts[key] = 1;
            }
        }
        // // ✅ FIX 1: Get status counts in memory to avoid duplicate key issues
        // var tickets = await _context.Tickets
        //     .Where(t => t.IsActive && !t.IsDeleted)  // Only count active tickets
        //     .Select(t => t.Status)
        //     .ToListAsync();

        // // Group in memory to ensure no duplicate keys
        // var statusCounts = tickets
        //     .GroupBy(s => s.ToString())
        //     .ToDictionary(g => g.Key, g => g.Count());

        var ongoingTickets = await _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.CIJobs)
            .Include(t => t.DetectedByUser)  
            .Where(t => t.Status != TicketStatus.CLOSED && t.Status != TicketStatus.CANCELLED)
            .Where(t => t.IsActive && !t.IsDeleted)  
            .OrderByDescending(t => t.IsBlocking)
            .ThenByDescending(t => t.UpdatedAt)
            .Take(20)
            .Select(t => new TicketListItem(
                t.Id,
                t.ExternalCode,
                t.Title,
                t.Status.ToString(),
                t.IsBlocking,
                t.CreatedAt,
                t.CreatedBy.DisplayName,
                t.CIJobs.Any(j => j.Status == CIJobStatus.Succeeded),
                t.IsActive,
                t.IsDeleted,
                t.DetectedDate,
                t.ResponseDate,
                t.DetectedByUser != null ? t.DetectedByUser.DisplayName : null,  
                t.TtcomsCode
            ))
            .ToListAsync();

        return Ok(new DashboardResponse(statusCounts, ongoingTickets));
    }
}