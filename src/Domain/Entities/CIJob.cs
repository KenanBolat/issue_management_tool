using Domain.Enums;

namespace Domain.Entities
{
    public class CIJob
    {
        public long Id { get; set; }
        public long TicketId { get; set; }
        public string CiRunId { get; set; } = null!;
        public CIJobStatus Status { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public Ticket Ticket { get; set; } = null!;
    }
}