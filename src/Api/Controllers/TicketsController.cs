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
        var query = _context.Tickets
        .Include(t => t.CreatedBy)
        .Include(t => t.CIJobs)
        .Include(t => t.DetectedByUser)
        .AsQueryable();

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
                t.CIJobs.Any(j => j.Status == CIJobStatus.Succeeded),
                t.IsActive,
                t.IsDeleted,
                t.DetectedDate,
                t.ResponseDate,
                t.DetectedByUser != null ? t.DetectedByUser.DisplayName: null))
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
            ticket.ConfirmationStatus?.ToString(),
            ticket.TechnicalReportRequired,
                ticket.CreatedAt,
                ticket.UpdatedAt,
                ticket.CreatedBy.DisplayName,
                ticket.CreatedById,
                ticket.LastUpdatedBy?.DisplayName,
                ticket.LastUpdatedById,
                ticket.IsActive,
                ticket.IsDeleted,
                ticket.CIId,
                ticket.ComponentId,
                ticket.SubsystemId,
                ticket.SystemId,
                ticket.CI?.Name,
                ticket.Component?.Name,
                ticket.Subsystem?.Name,
                ticket.System?.Name,
                // Detection fields
                ticket.DetectedDate,
                ticket.DetectedContractorNotifiedAt,
                ticket.DetectedNotificationMethods?.Select(m => m.ToString()).ToArray(),
                ticket.DetectedByUserId,
                ticket.DetectedByUser?.DisplayName,
                // Response fields
                ticket.ResponseDate,
                ticket.ResponseResolvedAt,
                ticket.ResponseByUser.Select(rp => new ResponsePersonnelItem(
                    rp.UserId,
                    rp.User.DisplayName
                )).ToList(),
                // Related data
                ticket.Actions
                    .OrderByDescending(a => a.PerformedAt)
                    .Select(a => new TicketActionItem(
                        a.Id,
                        a.ActionType.ToString(),
                        a.FromStatus?.ToString(),
                        a.ToStatus?.ToString(),
                        a.Notes,
                        a.PerformedBy.DisplayName,
                        a.PerformedAt
                    )).ToList(),
                ticket.Comments
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new CommentItem(
                        c.Id,
                        c.Body,
                        c.CreatedBy.DisplayName,
                        c.CreatedAt
                    )).ToList()
            );

            return Ok(detail);
    }

    [HttpPost]
    [Authorize(Roles = "Editor,Admin")]
    public async Task<ActionResult<TicketDetail>> CreateTicket([FromBody] CreateTicketRequest request)
    {
        if (!Enum.TryParse<TicketStatus>(request.Status, true, out var status))
            return BadRequest(new { message = "Invalid status" });

        //Parse notification method if provided 
        NotificationMethod[]? notificationMethods = null; 

         if (request.DetectedNotificationMethods != null && request.DetectedNotificationMethods.Length > 0)
            {
                var methods = new List<NotificationMethod>();
                foreach (var method in request.DetectedNotificationMethods)
                {
                    if (Enum.TryParse<NotificationMethod>(method, true, out var nm))
                        methods.Add(nm);
                }
                notificationMethods = methods.ToArray();
            }

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
                SystemId = request.SystemId,
                // Detection fields
                DetectedDate = request.DetectedDate,
                DetectedContractorNotifiedAt = request.DetectedContractorNotifiedAt,
                DetectedNotificationMethods = notificationMethods,
                DetectedByUserId = request.DetectedByUserId,
                // Response fields
                ResponseDate = request.ResponseDate,
                ResponseResolvedAt = request.ResponseResolvedAt,
                IsActive = true,
                IsDeleted = false
        };

        var created = await _ticketService.CreateTicketAync(ticket, GetCurrentUserId());

        // Add response personnel if provided
        if (request.ResponsePersonnelIds != null && request.ResponsePersonnelIds.Any())
        {
            foreach (var userId in request.ResponsePersonnelIds)
            {
                _context.TicketResponsePersonnel.Add(new TicketResponsePersonnel
                {
                    TicketId = created.Id,
                    UserId = userId
                });
            }
            await _context.SaveChangesAsync();
        }
        return CreatedAtAction(nameof(GetTicket), new { id = created.Id }, await GetTicket(created.Id));
    }


        [HttpPut("{id}")]
        [Authorize(Roles = "Editor,Admin")]
        public async Task<ActionResult> UpdateTicket(long id, [FromBody] UpdateTicketRequest request)
        {
            var ticket = await _context.Tickets
                .Include(t => t.ResponseByUser)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null) return NotFound();

            var currentUserId = GetCurrentUserId();
            var hasChanges = false;

            // Update basic fields
            if (request.Title != null && ticket.Title != request.Title)
            {
                ticket.Title = request.Title;
                hasChanges = true;
            }

            if (request.Description != null && ticket.Description != request.Description)
            {
                ticket.Description = request.Description;
                hasChanges = true;
            }

            if (request.IsBlocking.HasValue && ticket.IsBlocking != request.IsBlocking.Value)
            {
                ticket.IsBlocking = request.IsBlocking.Value;
                hasChanges = true;
            }

            if (request.TechnicalReportRequired.HasValue && ticket.TechnicalReportRequired != request.TechnicalReportRequired.Value)
            {
                ticket.TechnicalReportRequired = request.TechnicalReportRequired.Value;
                hasChanges = true;
            }

            // Update reference IDs
            if (request.CIId.HasValue) ticket.CIId = request.CIId;
            if (request.ComponentId.HasValue) ticket.ComponentId = request.ComponentId;
            if (request.SubsystemId.HasValue) ticket.SubsystemId = request.SubsystemId;
            if (request.SystemId.HasValue) ticket.SystemId = request.SystemId;

            // Update detection fields
            if (request.DetectedDate.HasValue) ticket.DetectedDate = request.DetectedDate;
            if (request.DetectedContractorNotifiedAt.HasValue) ticket.DetectedContractorNotifiedAt = request.DetectedContractorNotifiedAt;
            if (request.DetectedByUserId.HasValue) ticket.DetectedByUserId = request.DetectedByUserId;

            if (request.DetectedNotificationMethods != null)
            {
                var methods = new List<NotificationMethod>();
                foreach (var method in request.DetectedNotificationMethods)
                {
                    if (Enum.TryParse<NotificationMethod>(method, true, out var nm))
                        methods.Add(nm);
                }
                ticket.DetectedNotificationMethods = methods.ToArray();
                hasChanges = true;
            }

            // Update response fields
            if (request.ResponseDate.HasValue) ticket.ResponseDate = request.ResponseDate;
            if (request.ResponseResolvedAt.HasValue) ticket.ResponseResolvedAt = request.ResponseResolvedAt;

            // Update response personnel if provided
            if (request.ResponsePersonnelIds != null)
            {
                // Remove existing personnel
                _context.TicketResponsePersonnel.RemoveRange(ticket.ResponseByUser);

                // Add new personnel
                foreach (var userId in request.ResponsePersonnelIds)
                {
                    _context.TicketResponsePersonnel.Add(new TicketResponsePersonnel
                    {
                        TicketId = ticket.Id,
                        UserId = userId
                    });
                }
                hasChanges = true;
            }

            if (hasChanges)
            {
                ticket.UpdatedAt = DateTime.UtcNow;
                ticket.LastUpdatedById = currentUserId;

                _context.TicketActions.Add(new TicketAction
                {
                    TicketId = id,
                    ActionType = ActionType.Edit,
                    Notes = "Ticket updated",
                    PerformedById = currentUserId,
                    PerformedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
            }

            return NoContent();
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

    [HttpDelete("{id}")]
    [Authorize(Roles = "Editor, Admin")]
    public async Task<ActionResult> DeleteTicket(long id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound();

        // soft delete could be implemented here instead
        ticket.IsDeleted = true;
        ticket.IsActive = false;
        ticket.UpdatedAt = DateTime.UtcNow;
        ticket.LastUpdatedById = GetCurrentUserId();

        _context.TicketActions.Add(new TicketAction
        {
            TicketId = id,
            ActionType = ActionType.Edit,
            Notes = "Ticket deleted (soft delete)",
            PerformedById = GetCurrentUserId(),
            PerformedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Helper endpoint to get available users for response personnel dropdown
    [HttpGet("available-personnel")]
    public async Task<ActionResult<List<PersonnelOption>>> GetAvailablePersonnel()
    {
        var users = await _context.Users
            .Where(u => u.IsActive && (u.Role == UserRole.Editor || u.Role == UserRole.Admin))
            .Select(u => new PersonnelOption(u.Id, u.DisplayName, u.Department))
            .OrderBy(u => u.DisplayName)
            .ToListAsync();
        return Ok(users);
        }

    public record PersonnelOption(long Id, string DisplayName, string? Department);
}
