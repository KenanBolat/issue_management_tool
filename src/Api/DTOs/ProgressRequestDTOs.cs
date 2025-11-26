namespace Api.DTOs
{
    public record ProgressRequestListItem(
        long Id,
        long TicketId,
        string TicketCode,
        string TicketTitle,
        long RequestedByUserId,
        string RequestedByName,
        long TargetUserId,
        string TargetUserName,
        string? RequestMessage,
        DateTime RequestedAt,
        DateTime? DueDate,
        bool IsResponded,
        DateTime? RespondedAt,
        string? RespondedByName,
        string Status,
        bool IsOverdue
    );

    public record ProgressRequestDetail(
        long Id,
        long TicketId,
        string TicketCode,
        string TicketTitle,
        long RequestedByUserId,
        string RequestedByName,
        long TargetUserId,
        string TargetUserName,
        string? RequestMessage,
        DateTime RequestedAt,
        DateTime? DueDate,
        bool IsResponded,
        DateTime? RespondedAt,
        long? RespondedByUserId,
        string? RespondedByName,
        long? ResponseActionId,
        string? ResponseText,
        string Status,
        long? NotificationId
    );

    public record RespondToProgressRequestDto(
        string ResponseText
    );
}