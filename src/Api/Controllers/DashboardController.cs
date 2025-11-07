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
        var statusCounts = await _context.Tickets
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);

        var ongoingTickets = await _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.CIJobs)
            .Where(t => t.Status != TicketStatus.CLOSED && t.Status != TicketStatus.CANCELLED)
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
                t.DetectedByUser.DisplayName))
            .ToListAsync();

        return Ok(new DashboardResponse(statusCounts, ongoingTickets));
    }
}