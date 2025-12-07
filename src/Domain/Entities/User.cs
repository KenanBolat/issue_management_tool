using System.ComponentModel.DataAnnotations.Schema;
using Domain.Enums;

namespace Domain.Entities
{
    [Table("user")]
    public class User
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("password_hash")]
        public string PasswordHash { get; set; }

        [Column("display_name")]
        public string DisplayName { get; set; }

        [Column("role")]
        public UserRole Role { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; }

        [Column("phone_number")]
        public string? PhoneNumber { get; set; }

        [Column("affiliation")]
        public Affiliation? Affiliation { get; set; }

        [Column("department")]
        public string? Department { get; set; }

        [Column("military_rank_id")]
        public int? MilitaryRankId { get; set; }

        [Column("military_rank")]
        public MilitaryRank? MilitaryRank { get; set; }

        [Column("rank_code")]
        public string? RankCode { get; set; }

        [Column("preferred_language")]
        public string? PreferredLanguage { get; set; } = "tr-TR";

        [Column("position")]
        public UserPosition? Position { get; set; }

        [Column("created_by_id")]
        public long? CreatedById { get; set; }

        [Column("last_updated_by_id")]
        public long? LastUpdatedById { get; set; }

        [Column("created_by")]
        public User? CreatedBy { get; set; }

        [Column("last_updated_by")]
        public User? LastUpdatedBy { get; set; }

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        //Navigation Properties
        public ICollection<Ticket> CreatedTickets { get; set; } = new List<Ticket>();
        public ICollection<Ticket> UpdatedTickets { get; set; } = new List<Ticket>();
        public ICollection<TicketComment> TicketComments { get; set; } = new List<TicketComment>();
        public ICollection<TicketAction> TicketActions { get; set; } = new List<TicketAction>();

        //Permission Related
        public ICollection<UserPermission> UserPermissions { get; set; } =
            new List<UserPermission>();
    }
}
