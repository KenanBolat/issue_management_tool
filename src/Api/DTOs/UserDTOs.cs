using System.Reflection.PortableExecutable;

namespace Api.DTOs;

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
    DateTime CreatedAt,
    string? Position
);

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
    List<UserPermissionItem> Permission,
    string? Position
);

public record UserPermissionItem(
    string PermissionType,
    bool CanView,
    bool CanCreate,
    bool CanEdit,
    bool CanDelete
);

public record MilitaryRankItem(int Id, string Code, string DisplayName);

public record CreateUserRequest(
    string Email,
    string Password,
    string DisplayName,
    string Role,
    string Affiliation,
    string? Department,
    int? MilitaryRankId,
    string? PhoneNumber,
    string? Position
);

public record UpdateUserRequest(
    string? DisplayName,
    string? Role,
    string? Affiliation,
    string? Department,
    int? MilitaryRankId,
    string? PhoneNumber,
    bool? IsActive,
    string? Position,
    string? NewPassword
);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record GrantPermissionRequest(
    string PermissionType,
    bool CanView,
    bool CanCreate,
    bool CanEdit,
    bool CanDelete
);
