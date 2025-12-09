using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("configuration")]
    public class Configuration
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("expiration_date")]
        public DateTime? ExpirationDate { get; set; }

        [Column("pdfreport_date")]
        public DateTime? PdfReportDate { get; set; } = DateTime.UtcNow;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_date")]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Column("updated_date")]
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

        [Column("updated_by_id")]
        public long? UpdatedById { get; set; }

        [Column("excel_date_time_format")]
        public string ExcelDateTimeFormat { get; set; } = "yyyy-MM-dd HH:mm:ss";

        [Column("excel_timezone")]
        public string ExcelTimezone { get; set; } = "Turkey Standard Time";

        // Navigation property
        public User? UpdatedBy { get; set; }
    }
}
