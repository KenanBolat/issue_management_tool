using Domain.Enums;

namespace Domain.Entities

{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string DisplayName { get; set; }
        public UserRole Role { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; } 

        public bool IsActive { get; set; }
        
    }
}