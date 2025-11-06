using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("ticket_response_personnel")]
    public class TicketResponsePersonnel
    {
        public long TicketId { get; set; }
        public Ticket Ticket { get; set; } = null!;

        public long UserId { get; set; }
        public User User { get; set; } = null!;
    }
}