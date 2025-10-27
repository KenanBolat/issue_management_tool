namespace Domain.Entities
{
    public class MilitaryRank
    {
        public int Id { get; set; }
        public string Code { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string? Description { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}