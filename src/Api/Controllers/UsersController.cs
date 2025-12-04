using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Domain.Entities;
using Domain.Enums;
using System.Security.Claims;
using Api.Services;
using Api.DTOs;
using Microsoft.AspNetCore.Authentication;


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
        private readonly ICacheService _cache;
        private readonly ISystemServiceManager _serviceManager;



        public UsersController(AppDbContext context, ILogger<UsersController> logger, ICacheService cache, ISystemServiceManager serviceManager)
        {
            _context = context;
            _passwordHasher = new PasswordHasher<User>();
            _logger = logger;
            _cache = cache;
            _serviceManager = serviceManager;

        }
        private long GetCurrentUserId() => long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);


        private static string GetPositionDisplayName(UserPosition position)
        {
            return position switch
            {
                UserPosition.MissionPlanningEngineer => "Görev Planlama Mühendisi",
                UserPosition.ImageProcessingEngineer => "Görüntü İşleme Mühendisi",
                UserPosition.NetworkInfrastructureEngineer => "Ağ Altyapı Mühendisi",
                UserPosition.AntennaSystemResponsible => "Anten Sistem Sorumlusu",
                UserPosition.FieldCoordinator => "Saha Koordinatörü",
                UserPosition.FlightCommandControlEngineer => "U. Komuta Kntrl. Mühendisi",
                UserPosition.FlightDynamicsEngineer => "Uçuş Dinamikleri Mühendisi",
                UserPosition.SatellitePayloadEngineer => "Uydu Faydalı Yük Mühendisi",
                UserPosition.SatellitePlatformEngineer => "Uydu Platform Mühendisi",
                UserPosition.SDTSystemResponsible => "SDT Sistem Sorumlusu",
                UserPosition.AselsanSystemResponsible => "Aselsan Sistem Sorumlusu",
                UserPosition.TubitakSystemResponsible => "Tübitak Sistem Sorumlusu",
                UserPosition.CryptoBSystemResponsible => "Kripto-B Sistem Sorumlusu",
                UserPosition.TPZSystemResponsible => "TPZ Sistem Sorumlusu",
                UserPosition.GKTInformationSystems => "GKT Bilgi Sistemleri",
                UserPosition.GKTSatelliteOperations => "GKT Uydu Operasyonları",
                UserPosition.GKTDataProcessing => "GKT Veri İşleme",
                UserPosition.GKTMissionPlanning => "GKT Görev Planlama",
                UserPosition.GKTAntenna => "GKT Anten",
                _ => position.ToString()
            };
        }


        // GET: api/system/health
        [HttpGet("health")]
        public async Task<ActionResult<List<ServiceHealthItem>>> GetHealth()
        {
            var result = new List<ServiceHealthItem>();

            // ---- DB ----
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                if (canConnect)
                {
                    result.Add(new ServiceHealthItem(
                        Name: "db",
                        Status: "Running",
                        Description: "Database connection OK",
                        CanStart: false));
                }
                else
                {
                    result.Add(new ServiceHealthItem(
                        Name: "db",
                        Status: "Stopped",
                        Description: "Database not reachable",
                        CanStart: true));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DB health check failed");
                result.Add(new ServiceHealthItem(
                    Name: "db",
                    Status: "Error",
                    Description: "Exception while connecting to DB",
                    CanStart: true));
            }

            try
            {
                var ok = await _cache.IsAvailableAsync();
                if (ok)
                {
                    result.Add(new ServiceHealthItem(
                        Name: "redis",
                        Status: "Running",
                        Description: "Redis cache reachable",
                        CanStart: false));
                }
                else
                {
                    result.Add(new ServiceHealthItem(
                        Name: "redis",
                        Status: "Error",
                        Description: "Redis not reachable",
                        CanStart: true));
                }
            }
            catch (Exception ex)
            {
                // this should be rare; IsAvailableAsync already handles most issues
                _logger.LogError(ex, "Redis health check unexpected failure");
                result.Add(new ServiceHealthItem(
                    Name: "redis",
                    Status: "Error",
                    Description: "Redis health check crashed",
                    CanStart: true));
            }


            // ---- Backup ----
            try
            {
                // For now, just ask a service manager; you can implement this with Docker or HTTP.
                var backupStatus = await _serviceManager.GetStatusAsync("backup");

                result.Add(new ServiceHealthItem(
                    "backup",
                    backupStatus.Status,     // "Running" / "Stopped" / "Error"
                    backupStatus.Description,
                    backupStatus.CanStart));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Backup health check failed");
                result.Add(new ServiceHealthItem(
                    "backup",
                    "Error",
                    "Backup service unreachable",
                    CanStart: true));
            }

            return Ok(result);
        }

         // POST: api/system/services/{name}/start
        [HttpPost("services/{name}/start")]
        public async Task<ActionResult<ServiceCommandResponse>> StartService(string name)
        {

            
            _logger.LogInformation("Start request for service {Service}", name);

            var res = await _serviceManager.StartAsync(name);
            return Ok(new ServiceCommandResponse(name, res.Result, res.Message));
        }

        // POST: api/system/services/{name}/restart
        [HttpPost("services/{name}/restart")]
        public async Task<ActionResult<ServiceCommandResponse>> RestartService(string name)
        {
            _logger.LogInformation("Restart request for service {Service}", name);

            var res = await _serviceManager.RestartAsync(name);
            return Ok(new ServiceCommandResponse(name, res.Result, res.Message));
        }


        // POST: api/system/redis/flush
        [HttpPost("redis/flush")]
        public async Task<ActionResult<ServiceCommandResponse>> FlushRedis()
        {
            _logger.LogWarning("Redis flush requested by {User}",
                User.Identity?.Name ?? "unknown");

            // You can implement FlushAll/FlushDB inside ICacheService,
            // or use StackExchange.Redis directly.
            await _cache.ClearPrefixAsync(""); // or a specific namespace

            return Ok(new ServiceCommandResponse(
                "redis",
                "Flushed",
                "Redis cache cleared."));
        }

        
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
                    u.CreatedAt,
                    u.Position.HasValue ? GetPositionDisplayName(u.Position.Value) : null
                    ))
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
                permissions,
                // user.Position.HasValue ? GetPositionDisplayName(user.Position.Value) : null
                user.Position?.ToString()
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
                CreatedById = GetCurrentUserId(),
                Position = string.IsNullOrEmpty(request.Position) ? null : Enum.Parse<UserPosition>(request.Position)
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
            _logger.LogInformation("Password hashed for new user: {Email}", request.Email);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            _logger.LogInformation("User created successfully with ID: {UserId} and Email {Email} ", user.Id, user.Email);

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, await GetUser(user.Id));
        }


        /// <summary>
        /// PUT: api/users/{id} (Update user)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(long id, [FromBody] UpdateUserRequest request)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            _logger.LogInformation(
                "Updating user profile for ID: {RequestedUserId} by CurrentUserId: {CurrentUserId} with Role: {CurrentUserRole}",
                id,
                currentUserId,
                currentUserRole
            );

            // Authorization check
            if (id != currentUserId && currentUserRole != "Admin")
            {
                _logger.LogWarning(
                    "Unauthorized update attempt by UserId: {CurrentUserId} to access UserId: {RequestedUserId}",
                    currentUserId,
                    id
                );
                return Forbid();
            }

            // Include MilitaryRank to check affiliation properly
            var user = await _context.Users
                .Include(u => u.MilitaryRank)
                .FirstOrDefaultAsync(u => u.Id == id);


            if (user == null)
            {
                _logger.LogWarning("User with ID: {RequestedUserId} not found", id);
                return NotFound();
            }

            var oldAffiliation = user.Affiliation;

            // Update basic fields
            if (!string.IsNullOrEmpty(request.DisplayName))
                user.DisplayName = request.DisplayName;

            if (!string.IsNullOrEmpty(request.PhoneNumber))
                user.PhoneNumber = request.PhoneNumber;

            if (!string.IsNullOrEmpty(request.Department))
                user.Department = request.Department;

            if (!string.IsNullOrEmpty(request.Position))
            {
                if (Enum.TryParse<UserPosition>(request.Position, out var position))
                    user.Position = position;
            }

            if (!string.IsNullOrEmpty(request.NewPassword))
            {
                // Validate password
                if (request.NewPassword.Length < 6)
                {
                    return BadRequest(new { message = "Şifre en az 6 karakter olmalıdır" });
                }

                user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
                _logger.LogInformation($"Password updated for user {id} by user {GetCurrentUserId()}");
            }
            if (currentUserRole == "Admin")
            {
                // Update Role
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

                // Update Affiliation
                if (!string.IsNullOrEmpty(request.Affiliation))
                {
                    if (Enum.TryParse<Affiliation>(request.Affiliation, true, out var newAffiliation))
                    {
                        user.Affiliation = newAffiliation;
                        _logger.LogInformation(
                            "Affiliation updated from {OldAffiliation} to {NewAffiliation} for UserId: {UserId}",
                            oldAffiliation,
                            newAffiliation,
                            user.Id
                        );

                        if (oldAffiliation == Affiliation.Airforce && newAffiliation != Affiliation.Airforce)
                        {
                            user.MilitaryRankId = null;
                            _logger.LogInformation(
                                "Cleared MilitaryRankId for UserId: {UserId} due to affiliation change from Military to {NewAffiliation}",
                                user.Id,
                                newAffiliation
                            );
                        }
                    }
                    else
                    {
                        _logger.LogWarning("Invalid affiliation provided: {Affiliation}", request.Affiliation);
                    }
                }
            }

            // Only process military rank if current affiliation is Military (after potential update above)
            if (user.Affiliation == Affiliation.Airforce)
            {
                if (request.MilitaryRankId.HasValue)
                {
                    var rank = await _context.MilitaryRanks.FindAsync(request.MilitaryRankId.Value);
                    if (rank != null)
                    {
                        user.MilitaryRankId = request.MilitaryRankId;
                        _logger.LogInformation(
                            "MilitaryRankId updated to {MilitaryRankId} for UserId: {UserId}",
                            request.MilitaryRankId.Value,
                            user.Id
                        );
                    }
                    else
                    {
                        _logger.LogWarning(
                            "Invalid MilitaryRankId provided: {MilitaryRankId}",
                            request.MilitaryRankId.Value
                        );
                    }
                }
            }
            else
            {
                if (user.MilitaryRankId != null)
                {
                    user.MilitaryRankId = null;
                    _logger.LogInformation(
                        "Cleared MilitaryRankId for UserId: {UserId} because affiliation is {Affiliation} (not Military)",
                        user.Id,
                        user.Affiliation
                    );
                }
            }

            // Update metadata
            user.UpdatedAt = DateTime.UtcNow;
            user.LastUpdatedById = currentUserId;

            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                // Validate password
                if (request.NewPassword.Length < 6)
                {
                    return BadRequest(new { message = "Şifre en az 6 karakter olmalıdır" });
                }

                user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
                _logger.LogInformation($"Password updated for user {id} by admin {GetCurrentUserId()}");
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("User with ID: {UserId} updated successfully", user.Id);

            return NoContent();
        }

        [HttpGet("positions")]
        public ActionResult<List<object>> GetPositions()
        {
            var positions = Enum.GetValues<UserPosition>()
                .Select(p => new
                {
                    value = p.ToString(),
                    label = GetPositionDisplayName(p)
                })
                .OrderBy(p => p.label)
                .ToList();

            return Ok(positions);
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
            const string cacheKey = "users:military-ranks";

            var cached = await _cache.GetAsync<List<MilitaryRankItem>>(cacheKey);
            if (cached != null)
            {
                _logger.LogInformation("Returning military ranks from cache");
                return Ok(cached);
            }



            var ranks = await _context.MilitaryRanks
                .Where(r => r.IsActive)
                .OrderBy(r => r.SortOrder)
                .Select(r => new MilitaryRankItem(r.Id, r.Code, r.DisplayName))
                .ToListAsync();
            _logger.LogInformation("Retrieved {RankCount} military ranks", ranks.Count);


            await _cache.SetAsync(cacheKey, ranks, TimeSpan.FromDays(365));

            return Ok(ranks);
        }

        /// <summary>
        /// Restore a soft-deleted user
        /// </summary>
        [HttpPost("{id}/restore")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RestoreUser(long id)
        {
            try
            {
                var user = await _context.Users
                    .IgnoreQueryFilters()  // Include deleted users
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                if (user.IsActive)
                {

                    _logger.LogInformation("User {UserId} restored by admin", user.IsActive);
                    return BadRequest(new { message = "User is not deleted" });
                }

                // Restore the user
                user.IsActive = true;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} restored by admin", id);

                return Ok(new { message = "User restored successfully", user });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring user {UserId}", id);
                return StatusCode(500, new { message = "Failed to restore user" });
            }
        }


    }
}
