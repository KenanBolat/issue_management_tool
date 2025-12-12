using System.ComponentModel.DataAnnotations.Schema;
using Domain.Enums;

namespace Domain.Entities
{
    [Table("progress_request_update")]
    public class ProgressRequestUpdate
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("progress_request_id")]
        public long ProgressRequestId { get; set; }

        [Column("progress_request")]
        public ProgressRequest ProgressRequest { get; set; } = null!;

        [Column("updated_by_user_id")]
        public long UpdatedByUserId { get; set; }

        [Column("updated_by")]
        public User UpdatedBy { get; set; } = null!;

        [Column("progress_info")]
        public string? ProgressInfo { get; set; }

        [Column("progress_percentage")]
        public int? ProgressPercentage { get; set; }

        [Column("estimated_completion")]
        public DateTime? EstimatedCompletion { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Column("notification_id")]
        public long? NotificationId { get; set; }

        [Column("notification")]
        public Notification? Notification { get; set; }
    }
}
