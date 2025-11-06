using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("ticket_response_personnel")]
    public class TicketResponsePersonnel
    {   
        [Column("ticket_id")]
        public long TicketId { get; set; }
        public Ticket Ticket { get; set; } = null!;

        [Column("user_id")]
        public long UserId { get; set; }
        public User User { get; set; } = null!;
    }
}