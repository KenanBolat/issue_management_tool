using Domain.Entities;

namespace Domain.Entities
{
    public class Attachment
    {
        public long Id { get; set; }

        public long TicketId { get; set; }
        public string FileName { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        public long Size { get; set; }
        public string StoragePath { get; set; } = null!;
        public long UploadedById { get; set; }
        public DateTime UploadedAt { get; set; }
        public Ticket Ticket { get; set; } = null!;
        public User UploadedBy { get; set; } = null!;

    }
}