using Domain.Enums;

using System.ComponentModel.DataAnnotations.Schema;
using System.Net.Http.Headers;


namespace Domain.Entities
{
    public class Ticket
    {
        [Column("id")]
        public long Id { get; set; }
        [Column("external_code")]
        public string ExternalCode { get; set; } = null!;
        [Column("title")]
        public string Title { get; set; } = null!;
        [Column("description")]
        public string Description { get; set; } = null!;
        [Column("is_blocking")]
        public bool IsBlocking { get; set; }
        [Column("status")]
        public TicketStatus Status { get; set; }
        [Column("confirmation_status")]
        public ConfirmationStatus? ConfirmationStatus { get; set; }
        [Column("technical_report_required")]
        public bool TechnicalReportRequired { get; set; }

        [Column("ci_id")]
        public long? CIId { get; set; }
        [Column("component_id")]
        public long? ComponentId { get; set; }
        [Column("subsystem_id")]
        public long? SubsystemId { get; set; }
        [Column("system_id")]
        public long? SystemId { get; set; }

        [Column("item_description")]
        public string? ItemDescription { get; set; }
        [Column("item_id")]
        public string? ItemId { get; set; }
        [Column("item_serial_no")]
        public string? ItemSerialNo { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
        [Column("reaction_date")]
        public DateTime? ReactionDate { get; set; }
        [Column("resoluion_date")]
        public DateTime? ResolutionDate { get; set; }


        [Column("created_by_id")]
        public long CreatedById { get; set; }
        [Column("created_by")]
        public User CreatedBy { get; set; } = null!;
        [Column("last_updated_by_id")]
        public long? LastUpdatedById { get; set; }
        [Column("last_update_by")]
        public User? LastUpdatedBy { get; set; }
        [Column("is_active")]
        public bool IsActive { get; set; } = true;
        [Column("is_deleted")]
        public bool IsDeleted { get; set; }

        [Column("ci")]
        public ConfigurationItem? CI { get; set; }

        [Column("component")]
        public Component? Component { get; set; }
        [Column("subsystem")]
        public Subsystem? Subsystem { get; set; }
        [Column("system")]
        public SystemEntity? System { get; set; }
        [Column("actions")]
        public ICollection<TicketAction> Actions { get; set; } = new List<TicketAction>();
        [Column("comments")]
        public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
        [Column("attachments")]
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
        [Column("ci_jobs")]
        public ICollection<CIJob> CIJobs { get; set; } = new List<CIJob>();

        //Tespit-Detection 
        [Column("detect_date")]
        public DateTime? DetectDate { get; set; }
        [Column("detect_contractor_notified_at")]
        public DateTime? DetectContractorNotifiedAt { get; set; }
        [Column("detect_notification_methods")]
        public NotificationMethod[]? DetectNotificationMethods { get; set; }
        [Column("detect_by_user_id")]
        public long? DetectDetectedByUserId { get; set; }
        [Column("detect_by_user")]
        public User? DetectDetectedByUser { get; set; }



        //Mudahele-Response
        [Column("response_date")]
        public DateTime? ResponseDate { get; set; }
        [Column("response_resolved_at")]
        public DateTime? ResponseResolvedAt { get; set; }
        [Column("response_by_user")]
        public ICollection<TicketResponsePersonnel> ResponseByUser { get; set; } = new List<TicketResponsePersonnel>();

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