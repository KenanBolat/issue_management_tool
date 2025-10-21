using Domain.Enums;



namespace Domain.Entities
{
    public class Ticket
    {
        public long Id { get; set; }
        public string ExternalCode { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public bool IsBlocking { get; set; }
        public TicketStatus Status { get; set; }
        public ConfirmationStatus? ConfirmationStatus { get; set; }
        public bool TechnicalReportRequired { get; set; }

        public long? CIId { get; set; }
        public long? ComponentId { get; set; }
        public long? SubsystemId { get; set; }
        public long? SystemId { get; set; }

        public string? ItemDescription { get; set; }
        public string? ItemId { get; set; }
        public string? ItemSerialNo { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ReactionTime { get; set; }
        public DateTime? ResolutionTime { get; set; }

        public long CreatedById { get; set; }
        public long? LastUpdatedById { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; }

        public User CreatedBy { get; set; } = null!;
        public User? LastUpdatedBy { get; set; }
        public ConfigurationItem? CI { get; set; }
        public Component? Component { get; set; }
        public Subsystem? Subsystem { get; set; }
        public SystemEntity? System { get; set; }
        public ICollection<TicketAction> Actions { get; set; } = new List<TicketAction>();
        public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
        public ICollection<CIJob> CIJobs { get; set; } = new List<CIJob>();
    }
}