using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Api.Hubs;


namespace Api.Services
{
    public class NotificationService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<NotificationService> _logger;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(AppDbContext context, ILogger<NotificationService> logger, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
        }

        /// <summary>
        /// Create a new ticket notification
        /// </summary>
        public async Task<Notification> CreateNewTicketNotification(Ticket ticket, long createdByUserId)
        {

            var userExists = await _context.Users.AnyAsync(u => u.Id == createdByUserId);

            if (!userExists)
            {
                _logger.LogError($"Cannot create notification: User with ID {createdByUserId} does not exist");
                throw new InvalidOperationException($"User with ID {createdByUserId} not found. Cannot create notification.");
            }
            var notification = new Notification
            {
                Type = NotificationType.NewTicket,
                Priority = ticket.IsBlocking ? NotificationPriority.High : NotificationPriority.Normal,
                TicketId = ticket.Id,
                Title = "Yeni Sorun Oluşturuldu",
                Message = $"#{ticket.ExternalCode}: {ticket.Title}",
                ActionUrl = $"/tickets/{ticket.Id}",
                CreatedByUserId = createdByUserId,
                IsGlobal = true, // All users can see new tickets
                RequiresAction = false,
                IsResolved = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Created new ticket notification for ticket #{ticket.ExternalCode}");

            await _hubContext.Clients.All.SendAsync("NewNotification", new
            {
                id = notification.Id,
                type = notification.Type.ToString(),
                priority = notification.Priority.ToString(),
                ticketId = notification.TicketId,
                ticketCode = ticket.ExternalCode,
                title = notification.Title,
                message = notification.Message,
                actionUrl = notification.ActionUrl,
                createdAt = notification.CreatedAt,
                isGlobal = notification.IsGlobal
            });

            return notification;
        }

        /// <summary>
        /// Create a progress request notification
        /// </summary>
        public async Task<Notification> CreateProgressRequestNotification(
            long ticketId,
            long requestedByUserId,
            long? targetUserId = null,
            string? message = null)
        {
            var ticket = await _context.Tickets
                .Include(t => t.CreatedBy)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
                throw new Exception("Ticket not found");


            var progressRequest = new ProgressRequest
            {
                TicketId = ticketId,
                RequestedByUserId = requestedByUserId,
                TargetUserId = targetUserId ?? ticket.CreatedById,
                RequestMessage = message,
                RequestedAt = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(7),
                IsResponded = false,
                Status = "Pending"
            };
            _context.ProgressRequests.Add(progressRequest);
            await _context.SaveChangesAsync();


            var notification = new Notification
            {
                Type = NotificationType.ProgressRequest,
                Priority = NotificationPriority.Normal,
                TicketId = ticketId,
                Title = "Bilgi Raporu Talep Edildi",
                Message = message ?? $"#{ticket.ExternalCode} için bilgi raporu talep edildi",
                ActionUrl = $"/tickets/{ticketId}",
                CreatedByUserId = requestedByUserId,
                TargetUserId = targetUserId ?? ticket.CreatedById, // Target ticket owner by default
                RequiresAction = true,
                IsResolved = false,
                IsGlobal = true,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(7) // Expires in 7 days
            };




            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            progressRequest.NotificationId = notification.Id;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Created progress request for ticket #{ticket.ExternalCode}");


            var targetUser = targetUserId ?? ticket.CreatedById;
            await _hubContext.Clients.Group($"user_{targetUser}").SendAsync("NewNotification", new
            {
                id = notification.Id,
                type = notification.Type.ToString(),
                priority = notification.Priority.ToString(),
                ticketId = notification.TicketId,
                ticketCode = ticket.ExternalCode,
                title = notification.Title,
                message = notification.Message,
                actionUrl = notification.ActionUrl,
                createdAt = notification.CreatedAt,
                requiresAction = notification.RequiresAction,
                targetUserId = notification.TargetUserId
            });


            return notification;
        }

        /// <summary>
        /// Mark notification as read by user
        /// </summary>
        public async Task<bool> MarkAsRead(long notificationId, long userId, string? readFrom = null)
        {
            // Check if already read
            var existingRead = await _context.NotificationReads
                .AnyAsync(nr => nr.NotificationId == notificationId && nr.UserId == userId);

            if (existingRead)
                return false; // Already marked as read

            var notificationRead = new NotificationRead
            {
                NotificationId = notificationId,
                UserId = userId,
                ReadAt = DateTime.UtcNow,
                ReadFrom = readFrom
            };

            _context.NotificationReads.Add(notificationRead);
            await _context.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// Mark multiple notifications as read
        /// </summary>
        public async Task<int> MarkMultipleAsRead(List<long> notificationIds, long userId)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => notificationIds.Contains(n.Id))
                .Where(n => !n.NotificationReads.Any(nr => nr.UserId == userId))
                .ToListAsync();

            var reads = unreadNotifications.Select(n => new NotificationRead
            {
                NotificationId = n.Id,
                UserId = userId,
                ReadAt = DateTime.UtcNow
            }).ToList();

            _context.NotificationReads.AddRange(reads);
            await _context.SaveChangesAsync();

            return reads.Count;
        }

        /// <summary>
        /// Get unread notification count for user
        /// </summary>
        public async Task<int> GetUnreadCount(long userId)
        {
            return await _context.Notifications
                .Where(n => !n.IsResolved)
                .Where(n => n.IsGlobal || n.TargetUserId == userId || n.CreatedByUserId == userId)
                .Where(n => !n.NotificationReads.Any(nr => nr.UserId == userId))
                .CountAsync();
        }

        /// <summary>
        /// Get notifications for user with pagination
        /// </summary>
        public async Task<List<Notification>> GetUserNotifications(
            long userId,
            string? type = null,
            bool? unreadOnly = null,
            int page = 1,
            int pageSize = 20)
        {
            var query = _context.Notifications
                .Include(n => n.Ticket)
                .Include(n => n.CreatedBy)
                .Include(n => n.NotificationReads)
                .Include(n => n.NotificationActions)
                .Where(n => n.IsGlobal || n.TargetUserId == userId || n.CreatedByUserId == userId)
                .Where(n => !n.IsResolved || n.ResolvedAt > DateTime.UtcNow.AddDays(-7))
                .AsQueryable();

            // Filter by type
            if (!string.IsNullOrEmpty(type) && Enum.TryParse<NotificationType>(type, out var notifType))
            {
                query = query.Where(n => n.Type == notifType);
            }

            // Filter unread only
            if (unreadOnly == true)
            {
                query = query.Where(n => !n.NotificationReads.Any(nr => nr.UserId == userId));
            }

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        /// <summary>
        /// Resolve notification (mark as completed)
        /// </summary>
        public async Task<bool> ResolveNotification(long notificationId, long userId, string? actionType = null, string? notes = null)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId);

            if (notification == null)
                return false;

            notification.IsResolved = true;
            notification.ResolvedAt = DateTime.UtcNow;
            notification.ResolvedByUserId = userId;

            // Track the action
            var action = new NotificationAction
            {
                NotificationId = notificationId,
                UserId = userId,
                ActionType = actionType ?? "Resolved",
                Notes = notes,
                PerformedAt = DateTime.UtcNow
            };

            _context.NotificationActions.Add(action);
            await _context.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// Get notification statistics
        /// </summary>
        public async Task<NotificationStats> GetStats(long userId)
        {
            var allNotifications = await _context.Notifications
                .Include(n => n.NotificationReads)
                .Where(n => n.IsGlobal || n.TargetUserId == userId || n.CreatedByUserId == userId)
                .Where(n => !n.IsResolved)
                .ToListAsync();

            return new NotificationStats
            {
                TotalUnread = allNotifications.Count(n => !n.NotificationReads.Any(nr => nr.UserId == userId)),
                NewTickets = allNotifications.Count(n => n.Type == NotificationType.NewTicket && !n.NotificationReads.Any(nr => nr.UserId == userId)),
                ProgressRequests = allNotifications.Count(n => n.Type == NotificationType.ProgressRequest && !n.NotificationReads.Any(nr => nr.UserId == userId)),
                RequiresAction = allNotifications.Count(n => n.RequiresAction && !n.NotificationReads.Any(nr => nr.UserId == userId)),
                HighPriority = allNotifications.Count(n => n.Priority >= NotificationPriority.High && !n.NotificationReads.Any(nr => nr.UserId == userId))
            };
        }
    }

    public class NotificationStats
    {
        public int TotalUnread { get; set; }
        public int NewTickets { get; set; }
        public int ProgressRequests { get; set; }
        public int RequiresAction { get; set; }
        public int HighPriority { get; set; }
    }
}