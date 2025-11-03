using Domain.Enums;

using System.ComponentModel.DataAnnotations.Schema;
using System.Net.Http.Headers;


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

        //Tespit-Detection 
        [Column("detection_data")]
        public DateTime? DetectionData { get; set; }
        public DateTime? DetectionContractorNotifiedAt { get; set; }
        public NotificationMethod[]? DetectionNotificationMethods { get; set; }
        public long? DetectionDetectedByUserId { get; set; }
        public User? DetectionDetectedByUser { get; set; }
        

        //Mudahele-Response
        
        [Column("response_date")]
        public DateTime? ResponseDate {get; set; }

        [Column("response_resolved_at")]
        public DateTime? ResponseResolvedAt { get; set; }
        public ICollection<TicketResponsePersonnel> ResponsePersonnel { get; set; } = new List<TicketResponsePersonnel>(); 

        // ---------------------------
        // Join entities for multiselect users in "Müdahale"
        // ---------------------------
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
}