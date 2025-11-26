using Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class Notification
    {
        [Column("id")]
        public long Id {get; set;}

        [Column("notification_type")]
        public NotificationType Type {get; set; }

        [Column("notification_priority")]
        public NotificationPriority Priority {get; set; } 
        
        
        [Column("ticket_id")]
        public long TicketId {get; set; }

        [Column("title")]
        public string Title {get; set; } = string.Empty;
        [Column("message")]
        public string Message {get; set; } = string.Empty;
        [Column("action_url")]
        public string? ActionUrl {get; set; }
        [Column("created_by_user_id")]
        public long CreatedByUserId { get; set; }


        // Targeting
        [Column("is_global")]
        public bool IsGlobal { get; set; }          // If true, all users see it
        [Column("target_user_id")]
        public long? TargetUserId { get; set; }     // Specific user target
        [Column("target_user")]
        public User? TargetUser { get; set; }
        [Column("target_role")]
        public string? TargetRole { get; set; }     // Target specific role (Admin, Editor, Viewer, etc.)
        
        // Status tracking
        [Column("requires_action")]
        public bool RequiresAction { get; set; }
        [Column("is_resolved")]
        public bool IsResolved { get; set; }
        [Column("resolved_at")]
        public DateTime? ResolvedAt { get; set; }
        [Column("resolved_by_user_id")]
        public long? ResolvedByUserId { get; set; }


        public User? ResolvedBy { get; set; }
        public User CreatedBy { get; set; } = null!;
        public Ticket Ticket {get; set; } = null!; 



        
        // Metadata
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        [Column("expires_at")]
        public DateTime? ExpiresAt { get; set; }
        
        // Navigation properties
        public ICollection<NotificationRead> NotificationReads { get; set; } = new List<NotificationRead>();
        public ICollection<NotificationAction> NotificationActions { get; set; } = new List<NotificationAction>();

    }

}
