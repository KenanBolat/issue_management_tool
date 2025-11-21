using Domain.Enums;

using System.ComponentModel.DataAnnotations.Schema;


namespace Domain.Entities
{
   [Table("ticket")]
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

        // New and/or replaced items
        [Column("new_item_description")]
        public string? NewItemDescription { get; set; }
        
        [Column("new_item_id")]
        public string? NewItemId { get; set; }
        
        [Column("new_item_serial_no")]
        public string? NewItemSerialNo { get; set; }

        // 
        [Column("hp_no")]
        public string? HpNo {get; set;}        

        [Column("tentative_solution_date")]
        public DateTime? TentativeSolutionDate { get; set; }


        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
        
        [Column("reaction_date")]
        public DateTime? ReactionDate { get; set; }
        
        [Column("resolution_date")]
        public DateTime? ResolutionDate { get; set; }

        [Column("created_by_id")]
        public long CreatedById { get; set; }
        
        [Column("last_updated_by_id")]
        public long? LastUpdatedById { get; set; }
        
        [Column("is_active")]
        public bool IsActive { get; set; } = true;
        
        [Column("is_deleted")]
        public bool IsDeleted { get; set; }

        // Detection fields
        [Column("detected_date")]
        public DateTime? DetectedDate { get; set; }
        
        [Column("detected_contractor_notified_at")]
        public DateTime? DetectedContractorNotifiedAt { get; set; }
        
        [Column("detected_notification_methods")]
        public NotificationMethod[]? DetectedNotificationMethods { get; set; }
        
        [Column("detected_by_user_id")]
        public long? DetectedByUserId { get; set; }

        // Response fields
        [Column("response_date")]
        public DateTime? ResponseDate { get; set; }
        
        [Column("response_resolved_at")]
        public DateTime? ResponseResolvedAt { get; set; }

        [Column("response_resolved_by_user_id")]
        public long? ResponseResolvedByUserId { get; set; }



        [Column("response_actions")]
        public string? ResponseActions { get; set; }

        // Activity Control fields - NEW
        [Column("activity_control_personnel_id")]
        public long? ActivityControlPersonnelId { get; set; }
        
        [Column("activity_control_commander_id")]
        public long? ActivityControlCommanderId { get; set; }
        
        [Column("activity_control_date")]
        public DateTime? ActivityControlDate { get; set; }
        
        [Column("activity_control_result")]
        public string? ActivityControlResult { get; set; }

        [Column("ttcoms_code")]
        public string? TtcomsCode { get; set; }
         
        // Activity Control Navigation Properties - NEW
        public User? ActivityControlPersonnel { get; set; }
        public User? ActivityControlCommander { get; set; }

        // 
        [Column("activity_control_status")]
        public ControlStatus? ActivityControlStatus { get; set; }


        // ============================================
        // Navigation Properties - NO [Column] attributes!
        // ============================================
        public User CreatedBy { get; set; } = null!;
        public User? LastUpdatedBy { get; set; }
        public User? DetectedByUser { get; set; }

        // Sub-contractor notification 
        [Column("sub_contractor")]
        public string? SubContractor { get; set; }
        [Column("sub_contractor_notified_at")]
        public DateTime? SubContractorNotifiedAt { get; set; }

        public ConfigurationItem? CI { get; set; }
        public Component? Component { get; set; }
        public Subsystem? Subsystem { get; set; }
        [Column("system_entity")]
        public SystemEntity? System { get; set; }

        // References - Collections never get [Column] attributes
        public ICollection<TicketAction> Actions { get; set; } = new List<TicketAction>();
        public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
        public ICollection<CIJob> CIJobs { get; set; } = new List<CIJob>();

        // Many-to-many relationship
        public ICollection<TicketResponsePersonnel> ResponseByUser { get; set; } = new List<TicketResponsePersonnel>();
        public ICollection<TicketResponseResolvedPersonnel> ResponseResolvedByUser { get; set; } = new List<TicketResponseResolvedPersonnel>();
    }
}