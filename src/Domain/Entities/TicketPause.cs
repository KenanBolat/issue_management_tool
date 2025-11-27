using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("ticket_pause")]
    public class TicketPause
    {
        [Column("id")]
        public long Id { get; set; }
        
        [Column("ticket_id")]
        public long TicketId { get; set; }
        
        [Column("paused_by_user_id")]
        public long PausedByUserId { get; set; }
        
        [Column("paused_at")]
        public DateTime PausedAt { get; set; }
        
        [Column("resumed_at")]
        public DateTime? ResumedAt { get; set; }
        
        [Column("resumed_by_user_id")]
        public long? ResumedByUserId { get; set; }
        
        [Column("pause_reason")]
        public string PauseReason { get; set; } = null!;
        
        [Column("resume_notes")]
        public string? ResumeNotes { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        // Navigation properties
        public Ticket Ticket { get; set; } = null!;
        public User PausedByUser { get; set; } = null!;
        public User? ResumedByUser { get; set; }
    }
}