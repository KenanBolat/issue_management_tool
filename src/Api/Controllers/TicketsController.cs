using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.DTOs;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TicketService _ticketService;

    public TicketsController(AppDbContext context, TicketService ticketService)
    {
        _context = context;
        _ticketService = ticketService;
    }

    private long GetCurrentUserId() => long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<TicketListItem>>> GetTickets([FromQuery] string? status = null)
    {
        var query = _context.Tickets.Include(t => t.CreatedBy).Include(t => t.CIJobs).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TicketStatus>(status, true, out var statusEnum))
            query = query.Where(t => t.Status == statusEnum);

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Take(50)
            .Select(t => new TicketListItem(
                t.Id,
                t.ExternalCode,
                t.Title,
                t.Status.ToString(),
                t.IsBlocking,
                t.CreatedAt,
                t.CreatedBy.DisplayName,
                t.CIJobs.Any(j => j.Status == CIJobStatus.Succeeded)))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDetail>> GetTicket(long id)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(id);
        if (ticket == null) return NotFound();

        var detail = new TicketDetail(
            ticket.Id,
            ticket.ExternalCode,
            ticket.Title,
            ticket.Description,
            ticket.IsBlocking,
            ticket.Status.ToString(),
            ticket.CreatedAt,
            ticket.Actions.Select(a => new TicketActionItem(
                a.Id,
                a.ActionType.ToString(),
                a.FromStatus?.ToString(),
                a.ToStatus?.ToString(),
                a.Notes,
                a.PerformedBy.DisplayName,
                a.PerformedAt)).ToList(),
            ticket.Comments.Select(c => new CommentItem(
                c.Id,
                c.Body,
                c.CreatedBy.DisplayName,
                c.CreatedAt)).ToList());

        return Ok(detail);
    }

    [HttpPost]
    [Authorize(Roles = "Editor,Admin")]
    public async Task<ActionResult<TicketDetail>> CreateTicket([FromBody] CreateTicketRequest request)
    {
        if (!Enum.TryParse<TicketStatus>(request.Status, true, out var status))
            return BadRequest(new { message = "Invalid status" });

        var ticket = new Ticket
        {
            ExternalCode = $"ISSUE-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            Title = request.Title,
            Description = request.Description,
            IsBlocking = request.IsBlocking,
            Status = status,
            TechnicalReportRequired = request.TechnicalReportRequired,
            CIId = request.CIId,
            ComponentId = request.ComponentId,
            SubsystemId = request.SubsystemId,
            SystemId = request.SystemId
        };

        var created = await _ticketService.CreateTicketAsync(ticket, GetCurrentUserId());
        return CreatedAtAction(nameof(GetTicket), new { id = created.Id }, await GetTicket(created.Id));
    }

    [HttpPost("{id}/status")]
    [Authorize(Roles = "Editor,Admin")]
    public async Task<ActionResult> ChangeStatus(long id, [FromBody] ChangeStatusRequest request)
    {
        if (!Enum.TryParse<TicketStatus>(request.ToStatus, true, out var toStatus))
            return BadRequest(new { message = "Invalid status" });

        ConfirmationStatus? confirmationStatus = null;
        if (request.ConfirmationStatus != null)
        {
            if (!Enum.TryParse<ConfirmationStatus>(request.ConfirmationStatus, true, out var cs))
                return BadRequest(new { message = "Invalid confirmation status" });
            confirmationStatus = cs;
        }

        try
        {
            var success = await _ticketService.ChangeStatusAsync(
                id, toStatus, request.Notes, confirmationStatus, GetCurrentUserId());

            if (!success) return NotFound();
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/comments")]
    [Authorize(Roles = "Editor,Admin")]
    public async Task<ActionResult> AddComment(long id, [FromBody] AddCommentRequest request)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound();

        var comment = new TicketComment
        {
            TicketId = id,
            Body = request.Body,
            CreatedById = GetCurrentUserId(),
            CreatedAt = DateTime.UtcNow
        };

        _context.TicketComments.Add(comment);
        _context.TicketActions.Add(new TicketAction
        {
            TicketId = id,
            ActionType = ActionType.Comment,
            Notes = "Comment added",
            PerformedById = GetCurrentUserId(),
            PerformedAt = DateTime.UtcNow
        });

        ticket.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { id = comment.Id });
    }
}