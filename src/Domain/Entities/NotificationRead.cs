namespace Domain.Entities
{
    public class NotificationRead
    {
        public long Id { get; set; }
        
        public long NotificationId { get; set; }
        public Notification Notification { get; set; } = null!;
        
        public long UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime ReadAt { get; set; }
        public string? ReadFrom { get; set; } 
    }
}