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
                pr.ProgressInfo,
                pr.IsResponded,
                pr.RespondedAt,
                pr.RespondedBy?.DisplayName,
                pr.Status,
                pr.DueDate.HasValue && pr.DueDate.Value < DateTime.UtcNow && !pr.IsResponded,
                pr.ProgressPercentage, 
                pr.EstimatedCompletion
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
                progressRequest.ProgressInfo,
                progressRequest.IsResponded,
                progressRequest.RespondedAt,
                progressRequest.RespondedByUserId,
                progressRequest.RespondedBy?.DisplayName,
                progressRequest.ResponseActionId,
                progressRequest.ResponseAction?.Notes,
                progressRequest.Status,
                progressRequest.NotificationId,
                progressRequest.ProgressPercentage, 
                progressRequest.EstimatedCompletion
            );

            return Ok(result);
        }


        /// <summary>
        /// Provide progress update
        /// </summary>
        [HttpPost("{id}/update-progress")]
        [Authorize(Roles = "Editor,Admin")]
        public async Task<ActionResult> UpdateProgress(long id, [FromBody] UpdateProgressRequest request)
        {
            var progressRequest = await _context.ProgressRequests
                .Include(pr => pr.Ticket)
                .Include(pr => pr.RequestedBy)
                .FirstOrDefaultAsync(pr => pr.Id == id);

            if (progressRequest == null)
                return NotFound(new { message = "Progress request bulunamadı" });

            var userId = GetCurrentUserId();

            // ✅ Update progress information (no ResponseActionId needed)
            progressRequest.ProgressInfo = request.ProgressInfo;
            progressRequest.Status = "InProgress";
            progressRequest.ProgressPercentage = request.ProgressPercentage;

            if (request.EstimatedCompletion.HasValue)
            {
                progressRequest.EstimatedCompletion = DateTime.SpecifyKind(
                    request.EstimatedCompletion.Value,
                    DateTimeKind.Utc
                );
            }


            // Optional: Also create a ticket action for audit trail

            var auxiliaryContext =  $"{request.ProgressInfo} - % {request.ProgressPercentage} - Tahmini Tamamlanma: {request.EstimatedCompletion} ";

            var Comment = new TicketComment
            {
                TicketId = progressRequest.TicketId,
                Body = $"İlerleme Güncellendi: {auxiliaryContext}",
                CreatedById = userId,
                CreatedAt = DateTime.UtcNow
            };

            var action = new TicketAction
            {
                TicketId = progressRequest.TicketId,
                ActionType = ActionType.Comment,
                Notes = $"İlerleme Güncellendi: {auxiliaryContext}",
                PerformedById = userId,
                PerformedAt = DateTime.UtcNow
            };


            _context.TicketActions.Add(action);
            _context.TicketComments.Add(Comment);

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Progress updated for request {id} by user {userId}");

            return Ok(new { message = "İlerleme güncellendi" });
        }


        /// <summary>
        /// Respond to a progress request
        /// </summary>
        [HttpPost("{id}/respond")]
        [Authorize(Roles = "Editor,Admin")]
        public async Task<ActionResult> RespondToRequest(long id, [FromBody] RespondToProgressRequest request)
        {
            var progressRequest = await _context.ProgressRequests
                .Include(pr => pr.Ticket)
                .Include(pr => pr.RequestedBy)
                .FirstOrDefaultAsync(pr => pr.Id == id);

            if (progressRequest == null)
                return NotFound(new { message = "Progress request bulunamadı" });

            if (progressRequest.IsResponded)
                return BadRequest(new { message = "Bu talep zaten yanıtlanmış" });

            var userId = GetCurrentUserId();


            // ✅ Create ticket action FIRST
            var action = new TicketAction
            {
                TicketId = progressRequest.TicketId,
                ActionType = ActionType.Comment,
                Notes = $"İlerleme Talebi Yanıtlandı: {request.ResponseNotes}",
                PerformedById = userId,
                PerformedAt = DateTime.UtcNow
            };

            _context.TicketActions.Add(action);

            // Mark as responded

            progressRequest.IsResponded = true;
            progressRequest.RespondedAt = DateTime.UtcNow;
            progressRequest.RespondedByUserId = userId;
            progressRequest.ProgressInfo = request.ResponseNotes;
            // progressRequest.ResponseActionId = action.Id;  // ✅ Now this has a valid ID

            progressRequest.Status = "Responded";



            await _context.SaveChangesAsync();

            // Send notification
            // await _notificationService.CreateProgressResponseNotification(
            //     progressRequest.TicketId,
            //     progressRequest.RequestedByUserId,
            //     userId
            // );

            _logger.LogInformation($"Progress request {id} responded by user {userId}");

            return Ok(new { message = "Talep yanıtlandı" });
        }


        // POST: /api/ProgressRequests/{id}/cancel
        [HttpPost("{id}/cancel")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CancelRequest(long id)
        {
            var request = await _context.ProgressRequests.FindAsync(id);

            if (request == null)
                return NotFound();

            request.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Talep iptal edildi" });
        }

        // DELETE: /api/ProgressRequests/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteRequest(long id)
        {
            var request = await _context.ProgressRequests.FindAsync(id);

            if (request == null)
                return NotFound();

            _context.ProgressRequests.Remove(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Talep silindi" });
        }
    }
}