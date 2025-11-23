namespace Domain.Entities
{
    public class NotificationAction
    {
        public long Id { get; set; }
        
        public long NotificationId { get; set; }
        public Notification Notification { get; set; } = null!;
        
        public long UserId { get; set; }
        public User User { get; set; } = null!;
        
        public string ActionType { get; set; } = string.Empty;
        public string? ActionData { get; set; } 
        public string? Notes { get; set; }
        
        public DateTime PerformedAt { get; set; }
    }
}