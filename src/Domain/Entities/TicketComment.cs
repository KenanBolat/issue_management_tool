using System.Reflection;
using Domain.Entities;


namespace Domain.Entities
{
    public class TicketComment
    {
        public long Id { get; set; }
        public long TicketId { get; set; }
        public string Body { get; set; } = null!; 
        public long CreatedById { get; set; }
        public DateTime CreatedAt { get; set; }
        public Ticket Ticket { get; set; } = null!;
        public User CreatedBy { get; set; } = null!;

    }
}