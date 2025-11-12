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

    /// <summary>
    /// Get available systems for dropdown
    /// </summary>
    [HttpGet("system")]
    public async Task<ActionResult<List<SystemOption>>> GetAvailableSystems()
    {
        var systems = await _context.Systems
            .OrderBy(s => s.Name)
            .Select(s => new SystemOption(
                s.Id,
                s.Name
            ))
            .ToListAsync();

        return Ok(systems);
    }

    /// <summary>
    /// Get available subsystems for dropdown (optionally filtered by system)
    /// </summary>
    [HttpGet("subsystem")]
    public async Task<ActionResult<List<SubsystemOption>>> GetAvailableSubsystems([FromQuery] long? systemId = null)
    {
        IQueryable<Subsystem> query = _context.Subsystems.AsNoTracking();

        if (systemId.HasValue)
        {
            query = query.Where(s => s.SystemId == systemId.Value);
        }

        var subsystems = await query
            .OrderBy(s => s.Name)
            .Select(s => new SubsystemOption(
                s.Id,
                s.Name,
                s.SystemId
            ))
            .ToListAsync();

        return Ok(subsystems);
    }
    /// <summary>
    /// Get available CIs for dropdown (optionally filtered by subsystem)
    /// </summary>
    [HttpGet("ci")]
    public async Task<ActionResult<List<CIOption>>> GetAvailableCIs([FromQuery] long? subsystemId = null)
    {
        var query = _context.ConfigurationItems;

        var cis = await query
            .OrderBy(ci => ci.Name)
            .Select(ci => new CIOption(
                ci.Id,
                ci.Name
               ))
            .ToListAsync();

        return Ok(cis);
    }


    /// <summary>
    /// Get available components for dropdown (optionally filtered by CI)
    /// </summary>
    [HttpGet("component")]
    public async Task<ActionResult<List<ComponentOption>>> GetAvailableComponents([FromQuery] long? subsystemID = null)
    {
        // var query = _context.Components;
        IQueryable<Component> query = _context.Components.AsNoTracking();

        if (subsystemID.HasValue)
        {
            query = query.Where(c => c.SubsystemId == subsystemID.Value);
        }

        var components = await query
            .OrderBy(c => c.Name)
            .Select(c => new ComponentOption(
                c.Id,
                c.Name,
                c.SubsystemId
            ))
            .ToListAsync();

        return Ok(components);
    }


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
                t.DetectedByUser != null ? t.DetectedByUser.DisplayName : null, t.TtcomsCode))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDetail>> GetTicket(long id)
    {
        var ticket = await _context.Tickets
                 .Include(t => t.CreatedBy)
                 .Include(t => t.LastUpdatedBy)
                 .Include(t => t.DetectedByUser)
                     .ThenInclude(u => u.MilitaryRank)  // Include MilitaryRank for DetectedByUser
                 .Include(t => t.CI)
                 .Include(t => t.Component)
                 .Include(t => t.Subsystem)
                 .Include(t => t.System)
                 .Include(t => t.ResponseByUser)
                     .ThenInclude(rp => rp.User)
                         .ThenInclude(u => u.MilitaryRank)  // Include MilitaryRank for ResponsePersonnel
                 .Include(t => t.Actions)
                     .ThenInclude(a => a.PerformedBy)
                 .Include(t => t.Comments)
                     .ThenInclude(c => c.CreatedBy)
                 .FirstOrDefaultAsync(t => t.Id == id);

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
                ticket.ResponseActions,
                // Related data
                ticket.ActivityControlPersonnelId,
                ticket.ActivityControlCommanderId,
                ticket.ActivityControlDate,
                ticket.ActivityControlResult,
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
                    )).ToList(),
                ticket.TtcomsCode,
                ticket.ItemDescription,
                ticket.ItemId,
                ticket.ItemSerialNo

            );

        return Ok(detail);
    }

    [HttpPost]
    [Authorize(Roles = "Editor,Admin")]
    public async Task<ActionResult<TicketDetail>> CreateTicket([FromBody] CreateTicketRequest request)
    {

        if (!Enum.TryParse<TicketStatus>(request.Status, true, out var status))
            return BadRequest(new { message = "Invalid status" });

        // Parse notification methods if provided 
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
            // ExternalCode = $"TKT-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            ExternalCode = await GenerateNextExternalCodeAsync(),
            Title = request.Title,
            Description = request.Description,
            IsBlocking = request.IsBlocking,
            Status = status,
            TechnicalReportRequired = request.TechnicalReportRequired,

            // Hierarchy fields
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
            ResponseActions = request.ResponseActions,

            // Activity Control fields
            ActivityControlPersonnelId = request.ActivityControlPersonnelId,
            ActivityControlCommanderId = request.ActivityControlCommanderId,
            ActivityControlDate = request.ActivityControlDate,
            ActivityControlResult = request.ActivityControlResult,
            TtcomsCode = request.TtcomsCode,
            ItemDescription = request.ItemDescription,
            ItemId = request.ItemId,
            ItemSerialNo = request.ItemSerialNo,

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

        if (request.TtcomsCode != null && ticket.TtcomsCode != request.TtcomsCode)
        {
            ticket.TtcomsCode = request.TtcomsCode;
            hasChanges = true;
        }

        if (request.Description != null && ticket.Description != request.Description)
        {
            ticket.Description = request.Description;
            hasChanges = true;
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<TicketStatus>(request.Status, true, out var newStatus))
            {
                if (ticket.Status != newStatus)
                {
                    var oldStatus = ticket.Status;
                    ticket.Status = newStatus;
                    hasChanges = true;

                    // Log the status change in the action
                    _context.TicketActions.Add(new TicketAction
                    {
                        TicketId = id,
                        ActionType = ActionType.StatusChange,
                        FromStatus = oldStatus,
                        ToStatus = newStatus,
                        Notes = $"Status changed from {oldStatus} to {newStatus}",
                        PerformedById = currentUserId,
                        PerformedAt = DateTime.UtcNow
                    });
                }
            }
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

        if (!string.IsNullOrWhiteSpace(request.ResponseActions))
        {
            ticket.ResponseActions = request.ResponseActions;
            hasChanges = true;
        }

        if (!string.IsNullOrWhiteSpace(request.ResponseActions))
        {
            ticket.ResponseActions = request.ResponseActions;
            hasChanges = true;
        }


        if (!string.IsNullOrWhiteSpace(request.ItemDescription))
        {
            ticket.ItemDescription = request.ItemDescription;
            hasChanges = true;
        }

        if (!string.IsNullOrWhiteSpace(request.ItemId))
        {
            ticket.ItemId = request.ItemId;
            hasChanges = true;
        }
        if (!string.IsNullOrWhiteSpace(request.ItemSerialNo))
        {
            ticket.ItemSerialNo = request.ItemSerialNo;
            hasChanges = true;
        }
       





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


        if (request.ActivityControlPersonnelId.HasValue)
        {
            ticket.ActivityControlPersonnelId = request.ActivityControlPersonnelId;
            hasChanges = true;
        }

        if (request.ActivityControlCommanderId.HasValue)
        {
            ticket.ActivityControlCommanderId = request.ActivityControlCommanderId;
            hasChanges = true;
        }

        if (request.ActivityControlDate.HasValue)
        {
            ticket.ActivityControlDate = request.ActivityControlDate;
            hasChanges = true;
        }

        if (!string.IsNullOrWhiteSpace(request.ActivityControlResult))
        {
            ticket.ActivityControlResult = request.ActivityControlResult;
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
        // Step 1: Query database with anonymous type (EF Core can translate this)
        var users = await _context.Users
            .Where(u => u.IsActive && (u.Role == UserRole.Editor || u.Role == UserRole.Admin))
            .OrderBy(u => u.DisplayName)
            .Select(u => new
            {
                u.Id,
                u.DisplayName,
                u.Department,
                RankCode = u.MilitaryRank != null ? u.MilitaryRank.DisplayName : null,
                Role = u.Role.ToString()
            })
            .ToListAsync();

        // Step 2: Map to PersonnelOption in memory
        var personnelOptions = users.Select(u => new PersonnelOption(
            u.Id,
            u.DisplayName,
            u.Department,
            u.RankCode,
            u.Role
        )).ToList();

        return Ok(personnelOptions);
    }

    public record PersonnelOption(
            long Id,
            string DisplayName,
            string? Department,
            string? RankCode,
            string Role
        );

    private async Task<string> GenerateNextExternalCodeAsync()
    {
        var now = DateTime.UtcNow;
        var year = now.Year;
        var month = now.Month;

        // Pattern to match: AKF-YYYY-MM-
        var monthPrefix = $"AKF-{year:D4}-{month:D2}-";

        // Find the last ticket created in this year-month
        var lastTicket = await _context.Tickets
            .Where(t => t.ExternalCode.StartsWith(monthPrefix))
            .OrderByDescending(t => t.Id)
            .Select(t => t.ExternalCode)
            .FirstOrDefaultAsync();

        int nextNumber = 1;

        if (lastTicket != null)
        {
            // Extract the serial number from the last ticket
            // Format: AKF-2024-04-5 -> extract "5"
            var parts = lastTicket.Split('-');
            if (parts.Length == 4 && int.TryParse(parts[3], out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"{monthPrefix}{nextNumber}";
    }

}


