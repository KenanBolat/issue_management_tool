using Domain.Enums;

namespace Domain.Entities
{
    public class TicketAction
    {
        public long Id { get; set; }
        public long TicketId { get; set; }
        public ActionType ActionType { get; set; }
        public TicketStatus? FromStatus { get; set; }
        public TicketStatus? ToStatus { get; set; }
        public string? Notes { get; set; }
        public long PerformedById { get; set; }
        public DateTime PerformedAt { get; set; }

        public Ticket Ticket { get; set; } = null!;
        public User PerformedBy { get; set; } = null!;
    }
}