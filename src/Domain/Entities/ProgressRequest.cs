using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class ProgressRequest
    {
        public long Id { get; set; }

        // Ticket reference
        [Column("ticket_id")]
        public long TicketId { get; set; }

        [Column("ticket")]
        public Ticket Ticket { get; set; } = null!;

        // Who requested the progress
        [Column("requested_by_user_id")]
        public long RequestedByUserId { get; set; }

        [Column("requested_by")]
        public User RequestedBy { get; set; } = null!;

        // Who should provide the progress (ticket owner by default)
        [Column("target_user_id")]
        public long TargetUserId { get; set; }

        [Column("target_user")]
        public User TargetUser { get; set; } = null!;

        [Column("progress_info")]
        public string? ProgressInfo { get; set; }

        [Column("progress_percentage")]
        public int? ProgressPercentage { get; set; }

        [Column("estimated_completion")]
        public DateTime? EstimatedCompletion { get; set; }

        // Request details
        [Column("request_message")]
        public string? RequestMessage { get; set; }

        [Column("requested_at")]
        public DateTime RequestedAt { get; set; }

        [Column("due_date")]
        public DateTime? DueDate { get; set; }

        // Response details
        [Column("is_responded")]
        public bool IsResponded { get; set; }

        [Column("responded_at")]
        public DateTime? RespondedAt { get; set; }

        [Column("responded_by_user_id")]
        public long? RespondedByUserId { get; set; }

        [Column("responded_by")]
        public User? RespondedBy { get; set; }

        // Link to the ticket action that contains the response
        [Column("response_action_id")]
        public long? ResponseActionId { get; set; }

        [Column("response_action")]
        public TicketAction? ResponseAction { get; set; }

        // Status
        [Column("status")]
        public string Status { get; set; } = "Pending"; // Pending, Responded, Overdue, Cancelled

        // Related notification
        [Column("notification_id")]
        public long? NotificationId { get; set; }

        [Column("notification")]
        public Notification? Notification { get; set; }

        public ICollection<ProgressRequestUpdate> Updates { get; set; } = new List<ProgressRequestUpdate>();
    }
}
