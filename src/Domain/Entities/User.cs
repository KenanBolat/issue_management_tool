using Domain.Enums;

namespace Domain.Entities

{
    public class User
    {
        public long Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string DisplayName { get; set; }
        public UserRole Role { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; } 
        public bool IsActive { get; set; }

        public string? PhoneNumber { get; set; }
        public Affiliation? Affiliation { get; set; }
        public string? Department { get; set; }
        
        public int? MilitaryRankId { get; set; }
        public MilitaryRank? MilitaryRank { get; set; }
        public string? RankCode { get; set; }

        public string? PreferredLanguage { get; set; } = "tr-TR";   


        public long? CreatedById { get; set; }
        public long? LastUpdatedById { get; set; }
        public User? CreatedBy { get; set; }
        public User? LastUpdatedBy { get; set; }


        //Navigation Properties
        public ICollection<Ticket> CreatedTickets { get; set; } = new List<Ticket>();
        public ICollection<Ticket> UpdatedTickets { get; set; } = new List<Ticket>();
        public ICollection<TicketComment> TicketComments { get; set; } = new List<TicketComment>();
        public ICollection<TicketAction> TicketActions { get; set; } = new List<TicketAction>();

        //Permission Related 
        public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();



        


    }
}