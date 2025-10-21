using Domain.Entities;


namespace Domain.Entities
{
    public class TicketComment
    {
        public long Id { get; set; }
        public long TicketId { get; set; }
        public long Body { get; set; }
        public long CreatedById { get; set; }
        public DateTime CreatedAt { get; set; }
        public Ticket Ticket { get; set; } = null!;
        public User CreatedBy { get; set; } = null!;

    }
}