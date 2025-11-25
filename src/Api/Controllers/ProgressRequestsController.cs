using Api.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProgressRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ProgressRequestsController> _logger;

        public ProgressRequestsController(AppDbContext context, ILogger<ProgressRequestsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private long GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return long.Parse(userIdClaim!);
        }

        /// <summary>
        /// Get all progress requests (paginated)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<ProgressRequestListItem>>> GetProgressRequests(
            [FromQuery] string? status = null,
            [FromQuery] bool? myRequests = null,
            [FromQuery] bool? assignedToMe = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var userId = GetCurrentUserId();

            var query = _context.ProgressRequests
                .Include(pr => pr.Ticket)
                .Include(pr => pr.RequestedBy)
                .Include(pr => pr.TargetUser)
                .Include(pr => pr.RespondedBy)
                .AsQueryable();

            // Filter by status
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(pr => pr.Status == status);
            }

            // Filter: my requests
            if (myRequests == true)
            {
                query = query.Where(pr => pr.RequestedByUserId == userId);
            }

            // Filter: assigned to me
            if (assignedToMe == true)
            {
                query = query.Where(pr => pr.TargetUserId == userId);
            }

            var progressRequests = await query
                .OrderByDescending(pr => pr.RequestedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = progressRequests.Select(pr => new ProgressRequestListItem(
                pr.Id,
                pr.TicketId,
                pr.Ticket.ExternalCode,
                pr.Ticket.Title,
                pr.RequestedByUserId,
                pr.RequestedBy.DisplayName,
                pr.TargetUserId,
                pr.TargetUser.DisplayName,
                pr.RequestMessage,
                pr.RequestedAt,
                pr.DueDate,
                pr.IsResponded,
                pr.RespondedAt,
                pr.RespondedBy?.DisplayName,
                pr.Status,
                pr.DueDate.HasValue && pr.DueDate.Value < DateTime.UtcNow && !pr.IsResponded
            )).ToList();

            return Ok(result);
        }

        /// <summary>
        /// Get progress request by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProgressRequestDetail>> GetProgressRequest(long id)
        {
            var progressRequest = await _context.ProgressRequests
                .Include(pr => pr.Ticket)
                .Include(pr => pr.RequestedBy)
                .Include(pr => pr.TargetUser)
                .Include(pr => pr.RespondedBy)
                .Include(pr => pr.ResponseAction)
                .FirstOrDefaultAsync(pr => pr.Id == id);

            if (progressRequest == null)
                return NotFound();

            var result = new ProgressRequestDetail(
                progressRequest.Id,
                progressRequest.TicketId,
                progressRequest.Ticket.ExternalCode,
                progressRequest.Ticket.Title,
                progressRequest.RequestedByUserId,
                progressRequest.RequestedBy.DisplayName,
                progressRequest.TargetUserId,
                progressRequest.TargetUser.DisplayName,
                progressRequest.RequestMessage,
                progressRequest.RequestedAt,
                progressRequest.DueDate,
                progressRequest.IsResponded,
                progressRequest.RespondedAt,
                progressRequest.RespondedByUserId,
                progressRequest.RespondedBy?.DisplayName,
                progressRequest.ResponseActionId,
                progressRequest.ResponseAction?.Notes,
                progressRequest.Status,
                progressRequest.NotificationId
            );

            return Ok(result);
        }

        /// <summary>
        /// Respond to a progress request
        /// </summary>
        [HttpPost("{id}/respond")]
        public async Task<ActionResult> RespondToProgressRequest(
            long id,
            [FromBody] RespondToProgressRequestDto dto)
        {
            var userId = GetCurrentUserId();

            var progressRequest = await _context.ProgressRequests
                .Include(pr => pr.Ticket)
                .Include(pr => pr.Notification)
                .FirstOrDefaultAsync(pr => pr.Id == id);

            if (progressRequest == null)
                return NotFound(new { message = "Progress request not found" });

            // Check if user is the target
            if (progressRequest.TargetUserId != userId)
                return Forbid();

            // Check if already responded
            if (progressRequest.IsResponded)
                return BadRequest(new { message = "Already responded to this request" });

            // Create a ticket action for the response
            var ticketAction = new TicketAction
            {
                TicketId = progressRequest.TicketId,
                ActionType = ActionType.Edit,
                PerformedById = userId,
                PerformedAt = DateTime.UtcNow,
                Notes = $"[İlerleme Raporu] {dto.ResponseText}"
            };

            _context.TicketActions.Add(ticketAction);
            await _context.SaveChangesAsync();

            // Update progress request
            progressRequest.IsResponded = true;
            progressRequest.RespondedAt = DateTime.UtcNow;
            progressRequest.RespondedByUserId = userId;
            progressRequest.ResponseActionId = ticketAction.Id;
            progressRequest.Status = "Responded";

            // Resolve the notification
            if (progressRequest.Notification != null)
            {
                progressRequest.Notification.IsResolved = true;
                progressRequest.Notification.ResolvedAt = DateTime.UtcNow;
                progressRequest.Notification.ResolvedByUserId = userId;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"User {userId} responded to progress request {id}");

            return Ok(new { message = "İlerleme raporu gönderildi", actionId = ticketAction.Id });
        }

        /// <summary>
        /// Cancel a progress request
        /// </summary>
        [HttpPost("{id}/cancel")]
        public async Task<ActionResult> CancelProgressRequest(long id)
        {
            var userId = GetCurrentUserId();

            var progressRequest = await _context.ProgressRequests
                .Include(pr => pr.Notification)
                .FirstOrDefaultAsync(pr => pr.Id == id);

            if (progressRequest == null)
                return NotFound();

            // Only the requester can cancel
            if (progressRequest.RequestedByUserId != userId)
                return Forbid();

            progressRequest.Status = "Cancelled";

            // Resolve notification
            if (progressRequest.Notification != null)
            {
                progressRequest.Notification.IsResolved = true;
                progressRequest.Notification.ResolvedAt = DateTime.UtcNow;
                progressRequest.Notification.ResolvedByUserId = userId;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "İlerleme talebi iptal edildi" });
        }

        /// <summary>
        /// Get statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetStats()
        {
            var userId = GetCurrentUserId();

            var myRequests = await _context.ProgressRequests
                .Where(pr => pr.RequestedByUserId == userId)
                .ToListAsync();

            var assignedToMe = await _context.ProgressRequests
                .Where(pr => pr.TargetUserId == userId)
                .ToListAsync();

            var stats = new
            {
                MyRequestsTotal = myRequests.Count,
                MyRequestsPending = myRequests.Count(pr => pr.Status == "Pending"),
                MyRequestsResponded = myRequests.Count(pr => pr.Status == "Responded"),
                
                AssignedToMeTotal = assignedToMe.Count,
                AssignedToMePending = assignedToMe.Count(pr => pr.Status == "Pending"),
                AssignedToMeOverdue = assignedToMe.Count(pr => 
                    pr.Status == "Pending" && pr.DueDate.HasValue && pr.DueDate.Value < DateTime.UtcNow)
            };

            return Ok(stats);
        }
    }
}