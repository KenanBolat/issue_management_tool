namespace Api.DTOs
{
    public record NotificationListItem(
        long Id,
        string Type,
        string Priority,
        long TicketId,
        string TicketCode,
        string Title,
        string Message,
        string? ActionUrl,
        string CreatedByName,
        bool IsRead,
        bool RequiresAction,
        bool IsResolved,
        DateTime CreatedAt,
        DateTime? ResolvedAt,
        int ReadCount,
        int ActionCount
    );

    public record NotificationDetail(
        long Id,
        string Type,
        string Priority,
        long TicketId,
        string TicketCode,
        string TicketTitle,
        string Title,
        string Message,
        string? ActionUrl,
        long CreatedByUserId,
        string CreatedByName,
        long? TargetUserId,
        string? TargetUserName,
        string? TargetRole,
        bool IsGlobal,
        bool IsRead,
        bool RequiresAction,
        bool IsResolved,
        DateTime CreatedAt,
        DateTime? ExpiresAt,
        DateTime? ResolvedAt,
        string? ResolvedByName,
        List<NotificationReadItem> Reads,
        List<NotificationActionItem> Actions
    );

    public record NotificationReadItem(
        long Id,
        long UserId,
        string UserName,
        DateTime ReadAt,
        string? ReadFrom
    );

    public record NotificationActionItem(
        long Id,
        long UserId,
        string UserName,
        string ActionType,
        string? Notes,
        DateTime PerformedAt
    );

    public record CreateProgressRequestDto(
        long TicketId,
        long? TargetUserId,
        string? Message
    );

    public record MarkAsReadDto(
        List<long> NotificationIds,
        string? ReadFrom
    );

    public record ResolveNotificationDto(
        string? ActionType,
        string? Notes
    );
}