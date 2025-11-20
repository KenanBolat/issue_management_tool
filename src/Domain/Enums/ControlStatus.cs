namespace Domain.Enums
{
    public enum ControlStatus
    {
        Submitted = 0,           // Teslim Edildi
        Approved = 1,            // Onaylandı
        ApprovedPrinted = 2,     // Onaylandı ve Basıldı
        Signed = 3,              // İmzalandı
        ClosedAndPayed = 4,      // Kapandı ve Ödendi
        Cancelled = 5            // İptal Edildi
    }
}