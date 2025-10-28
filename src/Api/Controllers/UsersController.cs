using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Domain.Entities;
using Domain.Enums;
using System.Security.Claims;
using Infrastructure.Auth;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UsersController> _logger;
        private readonly PasswordHasher<User> _passwordHasher;

        public UsersController(AppDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _passwordHasher = new PasswordHasher<User>();
            _logger = logger;
        }
        private long GetCurrentUserId() => long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);


        // GET: api/Users
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<UserListItem>>> GetUsers([FromQuery] bool includeInactive = false)
        {
            _logger.LogInformation("Fetching user list. IncludeInactive: {IncludeInactive}", includeInactive);

            var query = _context.Users.Include(u => u.MilitaryRank).AsQueryable();

            if (!includeInactive)
                query = query.Where(u => u.IsActive);

            var users = await query
                .OrderBy(u => u.DisplayName)
                .Select(u => new UserListItem(
                    u.Id,
                    u.Email,
                    u.DisplayName,
                    u.Role.ToString(), u.Affiliation.ToString(),
                    u.Department,
                    u.MilitaryRank != null ? u.MilitaryRank.DisplayName : null,
                    u.PhoneNumber,
                    u.IsActive,
                     u.CreatedAt))
                .ToListAsync();
            _logger.LogInformation("Retrieved {UserCount} users", users.Count);
            return Ok(users);
        }
        // GET: api/users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDetail>> GetUser(long id)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            _logger.LogInformation("Fetching user profile for ID: {RequestedUserId} by CurrentUserId: {CurrentUserId} with Role: {CurrentUserRole}",
            id,
            currentUserId,
            currentUserRole);

            if (id != currentUserId && currentUserRole != "Admin")
            {
                _logger.LogWarning("Unauthorized access attempt by UserId: {CurrentUserId} to access UserId: {RequestedUserId}", currentUserId, id);
                return Forbid();
            }

            var user = await _context.Users
                .Include(u => u.MilitaryRank)
                .Include(u => u.UserPermissions)
                .FirstOrDefaultAsync(u => u.Id == id);


            if (user == null)
            {
                _logger.LogWarning("User with ID: {RequestedUserId} not found", id);
                return NotFound();
            }

            var permissions = user.UserPermissions
            .Select(p => new UserPermissionItem(
                p.PermissionType.ToString(),
                p.CanView,
                p.CanCreate,
                p.CanEdit,
                p.CanDelete)).ToList();


            var detail = new UserDetail(
                user.Id,
                user.Email,
                user.DisplayName,
                user.Role.ToString(),
                user.Affiliation.ToString(),
                user.Department,
                user.MilitaryRankId,
                user.RankCode,
                user.PhoneNumber,
                user.PreferredLanguage,
                user.IsActive,
                user.CreatedAt,
                user.UpdatedAt,         
                permissions
                );
            return Ok(detail);
        }

        // GET: api/users/me (Get current user profile)
        [HttpGet("me")]
        public async Task<ActionResult<UserDetail>> GetMyProfile()
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("Fetching profile for current user ID: {CurrentUserId}", userId);
            return await GetUser(userId);
        }


        //POST: api/users (Admin only - Create new user)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDetail>> CreateUser([FromBody] CreateUserRequest request)
        {
            _logger.LogInformation("Creating new user with email: {Email}", request.Email);

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                _logger.LogWarning("Email already exists: {Email}", request.Email);
                return BadRequest(new { message = "Email already exists" });
            }

            //Validate Role
            if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
            {
                _logger.LogWarning("Invalid role provided: {Role}", request.Role);
                return BadRequest(new { message = "Invalid role" });
            }

            //Validate affiliation
            if (!Enum.TryParse<Affiliation>(request.Affiliation, true, out var affiliation))
            {
                _logger.LogWarning("Invalid affiliation provided: {Affiliation}", request.Affiliation);
                return BadRequest(new { message = "Invalid affiliation" });
            }

            var user = new User
            {
                Email = request.Email,
                DisplayName = request.DisplayName,
                Role = role,
                Affiliation = affiliation,
                Department = request.Department,
                MilitaryRankId = request.MilitaryRankId,
                PhoneNumber = request.PhoneNumber,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedById = GetCurrentUserId()
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
            _logger.LogInformation("Password hashed for new user: {Email}", request.Email);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            _logger.LogInformation("User created successfully with ID: {UserId} and Email {Email} ", user.Id, user.Email);

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, await GetUser(user.Id));
        }

        //PUT: api/users/{id} (Update user)
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(long id, [FromBody] UpdateUserRequest request)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            _logger.LogInformation("Updating user profile for ID: {RequestedUserId} by CurrentUserId: {CurrentUserId} with Role: {CurrentUserRole}",
            id,
            currentUserId,
            currentUserRole);

            if (id != currentUserId && currentUserRole != "Admin")
            {
                _logger.LogWarning("Unauthorized update attempt by UserId: {CurrentUserId} to access UserId: {RequestedUserId}", currentUserId, id);
                return Forbid();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User with ID: {RequestedUserId} not found", id);
                return NotFound();
            }

            //Update fields

            if (!string.IsNullOrEmpty(request.DisplayName)) user.DisplayName = request.DisplayName;
            if (!string.IsNullOrEmpty(request.PhoneNumber)) user.PhoneNumber = request.PhoneNumber;
            if (!string.IsNullOrEmpty(request.Department)) user.Department = request.Department;


            if (request.MilitaryRankId.HasValue)
            {
                var rank = await _context.MilitaryRanks.FindAsync(request.MilitaryRankId.Value);
                if (rank != null)
                {
                    user.MilitaryRankId = request.MilitaryRankId;
                    _logger.LogInformation("MilitaryRankId updated to {MilitaryRankId} for UserId: {UserId}", request.MilitaryRankId.Value, user.Id);
                }
                else
                {
                    _logger.LogWarning("Invalid MilitaryRankId provided: {MilitaryRankId}", request.MilitaryRankId.Value);

                }

            }


            // Only Admin can change role and affiliation
            if (currentUserRole == "Admin")
            {
                if (!string.IsNullOrEmpty(request.Role))
                {
                    if (Enum.TryParse<UserRole>(request.Role, true, out var newRole))
                    {
                        user.Role = newRole;
                        _logger.LogInformation("Role updated to {Role} for UserId: {UserId}", newRole, user.Id);
                    }
                    else
                    {
                        _logger.LogWarning("Invalid role provided: {Role}", request.Role);
                    }
                }

                if (!string.IsNullOrEmpty(request.Affiliation))
                {
                    if (Enum.TryParse<Affiliation>(request.Affiliation, true, out var newAffiliation))
                    {
                        user.Affiliation = newAffiliation;
                        _logger.LogInformation("Affiliation updated to {Affiliation} for UserId: {UserId}", newAffiliation, user.Id);
                    }
                    else
                    {
                        _logger.LogWarning("Invalid affiliation provided: {Affiliation}", request.Affiliation);
                    }
                }
            }





            user.UpdatedAt = DateTime.UtcNow;
            user.LastUpdatedById = currentUserId;
            await _context.SaveChangesAsync();


            _logger.LogInformation("User with ID: {UserId} updated successfully", user.Id);

            return NoContent();
        }

        // PUT : api/users/{id}/password (Change password)
        [HttpPut("{id}/password")]
        public async Task<ActionResult> ChangePassword(long id, [FromBody] ChangePasswordRequest request)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            _logger.LogInformation("Password change request for UserId: {RequestedUserId} by CurrentUserId: {CurrentUserId} with Role: {CurrentUserRole}",
            id,
            currentUserId,
            currentUserRole);


            if (id != currentUserId && currentUserRole != "Admin")
            {
                _logger.LogWarning("Unauthorized password change attempt by UserId: {CurrentUserId} for UserId: {RequestedUserId}", currentUserId, id);
                return Forbid();
            }


            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User with ID: {RequestedUserId} not found", id);
                return NotFound();
            }

            // if user is changing own password, verify current password
            if (id == currentUserId)
            {
                var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
                _logger.LogInformation("Current password verification result: {Result}", verifyResult);
                if (verifyResult == PasswordVerificationResult.Failed)
                {
                    _logger.LogWarning("Current password verification failed for UserId: {UserId}", user.Id);
                    return BadRequest(new { message = "Current password is incorrect" });
                }
            }
            else
            {
                _logger.LogInformation("Admin {currentUserId} user changing password for UserId: {UserId}", currentUserId, user.Id);
            }

            //Hash new password using same method as AuthController   
            user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            user.LastUpdatedById = currentUserId;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Password changed successfully for UserId: {UserId}", user.Id);

            return NoContent();
        }

        // DELATE: api/users/{id} (soft delete user - Admin only)

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteUser(long id)
        {
            _logger.LogInformation("Deleting user with ID: {UserId}", id);
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User with ID: {UserId} not found", id);
                return NotFound();
            }

            // Prevent deleting self 
            if (id == GetCurrentUserId())
            {
                _logger.LogWarning("User with ID: {UserId} attempted to delete themselves", id);
                return BadRequest(new { message = "You cannot delete your own account" });
            }
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            user.LastUpdatedById = GetCurrentUserId();
            await _context.SaveChangesAsync();
            _logger.LogInformation("User with ID: {UserId} marked as inactive", id);
            return NoContent();
        }

        //POST: api/users/{id}/permissions (Grant permissions to user - Admin only)
        [HttpPost("{id}/permissions")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> GrantPermissions(long id, [FromBody] GrantPermissionRequest request)
        {
            _logger.LogInformation("Admin {CurrentUserId} granting {PermissionType} permission to user {UserId}",
               GetCurrentUserId(), request.PermissionType, id);

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User with ID: {UserId} not found", id);
                return NotFound();
            }

            if (!Enum.TryParse<PermissionType>(request.PermissionType, true, out var permissionType))
            {
                _logger.LogWarning("Invalid permission type provided: {PermissionType}", request.PermissionType);
                return BadRequest(new { message = "Invalid permission type" });
            }

            //Check if permission already exists
            var existingPermission = await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == id && up.PermissionType == permissionType);

            if (existingPermission != null)
            {
                existingPermission.CanView = request.CanView;
                existingPermission.CanCreate = request.CanCreate;
                existingPermission.CanEdit = request.CanEdit;
                existingPermission.CanDelete = request.CanDelete;

                _logger.LogInformation("Updated existing {PermissionType} permission for user {UserId}", permissionType, id);
            }
            else
            {
                var permission = new UserPermission
                {
                    UserId = id,
                    PermissionType = permissionType,
                    CanView = request.CanView,
                    CanCreate = request.CanCreate,
                    CanEdit = request.CanEdit,
                    CanDelete = request.CanDelete,
                    GrantedAt = DateTime.UtcNow,
                    GrantedById = GetCurrentUserId()
                };

                _context.UserPermissions.Add(permission);
                _logger.LogInformation("Granted new {PermissionType} permission to user {UserId}", permissionType, id);
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }

        //DELETE: api/users/{id}/permissions/{permissionType} (Revoke permission - Admin only)
        [HttpDelete("{id}/permissions/{permissionType}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> RevokePermission(long id, string permissionType)
        {
            _logger.LogInformation("Admin {CurrentUserId} revoking {PermissionType} permission from user {UserId}",
               GetCurrentUserId(), permissionType, id);


            if (!Enum.TryParse<PermissionType>(permissionType, true, out var permission))
            {
                _logger.LogWarning("Invalid permission type provided: {PermissionType}", permissionType);
                return BadRequest(new { message = "Invalid permission type" });
            }

            var userPermission = await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == id && up.PermissionType == permission);

            if (userPermission == null)
            {
                _logger.LogWarning("Permission {PermissionType} for user {UserId} not found", permission, id);
                return NotFound();
            }

            _context.UserPermissions.Remove(userPermission);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Revoked {PermissionType} permission from user {UserId}", permission, id);
            return NoContent();
        }

        //GET: api/users/ranks (Get military ranks)
        [HttpGet("ranks")]
        public async Task<ActionResult<List<MilitaryRankItem>>> GetMilitaryRanks()
        {
            _logger.LogInformation("Fetching military ranks");
            var ranks = await _context.MilitaryRanks
                .Where(r => r.IsActive)
                .OrderBy(r => r.SortOrder)
                .Select(r => new MilitaryRankItem(r.Id, r.Code, r.DisplayName))
                .ToListAsync();
            _logger.LogInformation("Retrieved {RankCount} military ranks", ranks.Count);
            return Ok(ranks);
        }


    }
}

public record UserListItem(
        long Id,
        string Email,
        string DisplayName,
        string Role,
        string Affiliation,
        string? Department,
        string? MilitaryRank,
        string? PhoneNumber,
        bool IsActive,
        DateTime CreatedAt);


public record UserDetail(
        long Id,
        string Email,
        string DisplayName,
        string Role,
        string Affiliation,
        string? Department,
        int? MilitaryRankId,
        string? RankCode,
        string? PhoneNumber,
        string? PreferredLanguage,
        bool IsActive,
        DateTime CreatedAt,
        DateTime UpdatedAt,
        List<UserPermissionItem> Permission);

public record UserPermissionItem(
    string PermissionType,
    bool CanView,
    bool CanCreate,
    bool CanEdit,
    bool CanDelete);

public record MilitaryRankItem(int Id, string Code, string DisplayName);

public record CreateUserRequest(
    string Email,
    string Password,
    string DisplayName,
    string Role,
    string Affiliation,
    string? Department,
    int? MilitaryRankId,
    string? PhoneNumber);

public record UpdateUserRequest(
    string? DisplayName,
    string? Role,
    string? Affiliation,
    string? Department,
    int? MilitaryRankId,
    string? PhoneNumber,
    bool? IsActive);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);

public record GrantPermissionRequest(
    string PermissionType,
    bool CanView,
    bool CanCreate,
    bool CanEdit,
    bool CanDelete);
