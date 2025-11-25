using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;  
using System.Security.Claims;

namespace Api.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
            
            _logger.LogInformation($"User {userName} (ID: {userId}) connected to NotificationHub. ConnectionId: {Context.ConnectionId}");
            
            // Add user to their personal group
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
            
            _logger.LogInformation($"User {userName} (ID: {userId}) disconnected from NotificationHub");
            
            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Client can ping to check connection
        /// </summary>
        public async Task Ping()
        {
            await Clients.Caller.SendAsync("Pong", DateTime.UtcNow);
        }
    }
}