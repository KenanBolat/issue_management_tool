using Domain.Enums;

namespace Domain.Entities
{
    public class ProgressRequestUpdate
    {
        public long Id { get; set; }
        public long ProgressRequestId { get; set; }
        public ProgressRequest ProgressRequest { get; set; } = null!;
        public long UpdatedByUserId { get; set; }
        public User UpdatedBy { get; set; } = null!;
        public string? ProgressInfo { get; set; }
        public int? ProgressPercentage { get; set; }
        public DateTime? EstimatedCompletion { get; set; }
        public DateTime UpdatedAt { get; set; }
        public long? NotificationId { get; set; }
        public Notification? Notification { get; set; }
    }
}