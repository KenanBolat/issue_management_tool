using Domain.Enums;

namespace Domain.Entities
{
    public class UserPermission
    {

        public long Id { get; set; }
        public long UserId { get; set; }
        public User User { get; set; } = null!;

        public PermissionType PermissionType { get; set; }

        public bool CanView { get; set; }
        public bool CanCreate { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }

        public DateTime GrantedAt { get; set; }
        public long GrantedById { get; set; }
        public User GrantedBy { get; set; } = null!;



    }
  
}