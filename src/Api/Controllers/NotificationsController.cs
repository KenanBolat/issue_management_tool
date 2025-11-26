using Api.DTOs;
using Api.Services;
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
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly NotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            AppDbContext context,
            NotificationService notificationService,
            ILogger<NotificationsController> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        private long GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return long.Parse(userIdClaim!);
        }

        /// <summary>
        /// Get all notifications for current user
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<NotificationListItem>>> GetNotifications(
            [FromQuery] string? type = null,
            [FromQuery] bool? unreadOnly = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();

            var notifications = await _notificationService.GetUserNotifications(
                userId, type, unreadOnly, page, pageSize);

            var result = notifications.Select(n => new NotificationListItem(
                n.Id,
                n.Type.ToString(),
                n.Priority.ToString(),
                n.TicketId,
                n.Ticket.ExternalCode,
                n.Title,
                n.Message,
                n.ActionUrl,
                n.CreatedBy.DisplayName,
                n.NotificationReads.Any(nr => nr.UserId == userId),
                n.RequiresAction,
                n.IsResolved,
                n.CreatedAt,
                n.ResolvedAt,
                n.NotificationReads.Count,
                n.NotificationActions.Count
            )).ToList();

            return Ok(result);
        }

        /// <summary>
        /// Get notification by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationDetail>> GetNotification(long id)
        {
            var userId = GetCurrentUserId();

            var notification = await _context.Notifications
                .Include(n => n.Ticket)
                .Include(n => n.CreatedBy)
                .Include(n => n.TargetUser)
                .Include(n => n.ResolvedBy)
                .Include(n => n.NotificationReads).ThenInclude(nr => nr.User)
                .Include(n => n.NotificationActions).ThenInclude(na => na.User)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (notification == null)
                return NotFound();

            // Check access
            if (!notification.IsGlobal && notification.TargetUserId != userId)
                return Forbid();

            var result = new NotificationDetail(
                notification.Id,
                notification.Type.ToString(),
                notification.Priority.ToString(),
                notification.TicketId,
                notification.Ticket.ExternalCode,
                notification.Ticket.Title,
                notification.Title,
                notification.Message,
                notification.ActionUrl,
                notification.CreatedByUserId,
                notification.CreatedBy.DisplayName,
                notification.TargetUserId,
                notification.TargetUser?.DisplayName,
                notification.TargetRole,
                notification.IsGlobal,
                notification.NotificationReads.Any(nr => nr.UserId == userId),
                notification.RequiresAction,
                notification.IsResolved,
                notification.CreatedAt,
                notification.ExpiresAt,
                notification.ResolvedAt,
                notification.ResolvedBy?.DisplayName,
                notification.NotificationReads.Select(nr => new NotificationReadItem(
                    nr.Id,
                    nr.UserId,
                    nr.User.DisplayName,
                    nr.ReadAt,
                    nr.ReadFrom
                )).ToList(),
                notification.NotificationActions.Select(na => new NotificationActionItem(
                    na.Id,
                    na.UserId,
                    na.User.DisplayName,
                    na.ActionType,
                    na.Notes,
                    na.PerformedAt
                )).ToList()
            );

            return Ok(result);
        }

        /// <summary>
        /// Get unread notification count
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            var count = await _notificationService.GetUnreadCount(userId);
            return Ok(count);
        }

        /// <summary>
        /// Get notification statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<NotificationStats>> GetStats()
        {
            var userId = GetCurrentUserId();
            var stats = await _notificationService.GetStats(userId);
            return Ok(stats);
        }

        /// <summary>
        /// Create a progress request notification
        /// </summary>
        [HttpPost("progress-request")]
        public async Task<ActionResult<NotificationDetail>> CreateProgressRequest(
            [FromBody] CreateProgressRequestDto dto)
        {
            var userId = GetCurrentUserId();

            try
            {
                var notification = await _notificationService.CreateProgressRequestNotification(
                    dto.TicketId,
                    userId,
                    dto.TargetUserId,
                    dto.Message
                );

                return Ok(new { id = notification.Id, message = "İlerleme talebi oluşturuldu" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating progress request");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Mark notification(s) as read
        /// </summary>
        [HttpPost("mark-read")]
        public async Task<ActionResult> MarkAsRead([FromBody] MarkAsReadDto dto)
        {
            var userId = GetCurrentUserId();

            var count = await _notificationService.MarkMultipleAsRead(dto.NotificationIds, userId);

            return Ok(new { markedCount = count, message = $"{count} bildirim okundu olarak işaretlendi" });
        }

        /// <summary>
        /// Mark single notification as read
        /// </summary>
        [HttpPost("{id}/mark-read")]
        public async Task<ActionResult> MarkSingleAsRead(long id, [FromQuery] string? readFrom = null)
        {
            var userId = GetCurrentUserId();

            var success = await _notificationService.MarkAsRead(id, userId, readFrom);

            if (success)
                return Ok(new { message = "Bildirim okundu olarak işaretlendi" });
            else
                return Ok(new { message = "Bildirim zaten okunmuş" });
        }

        /// <summary>
        /// Resolve notification
        /// </summary>
        [HttpPost("{id}/resolve")]
        public async Task<ActionResult> ResolveNotification(
            long id, 
            [FromBody] ResolveNotificationDto dto)
        {
            var userId = GetCurrentUserId();

            var success = await _notificationService.ResolveNotification(
                id, userId, dto.ActionType, dto.Notes);

            if (success)
                return Ok(new { message = "Bildirim çözümlendi" });
            else
                return NotFound(new { message = "Bildirim bulunamadı" });
        }
    }
}