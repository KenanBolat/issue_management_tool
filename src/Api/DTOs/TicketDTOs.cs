namespace Api.DTOs;
    public record CreateTicketRequest(
    string Title,
    string Description,
    bool IsBlocking,
    string Status,
    bool TechnicalReportRequired,
    long? CIId,
    long? ComponentId,
    long? SubsystemId,
    long? SystemId);

public record ChangeStatusRequest(string ToStatus, string? Notes, string? ConfirmationStatus);
public record AddCommentRequest(string Body);

public record TicketListItem(
    long Id,
    string ExternalCode,
    string Title,
    string Status,
    bool IsBlocking,
    DateTime CreatedAt,
    string CreatedByName,
    bool HasCICompleted);

public record TicketDetail(
    long Id,
    string ExternalCode,
    string Title,
    string Description,
    bool IsBlocking,
    string Status,
    DateTime CreatedAt,
    List<TicketActionItem> Actions,
    List<CommentItem> Comments);

public record TicketActionItem(
    long Id,
    string ActionType,
    string? FromStatus,
    string? ToStatus,
    string? Notes,
    string PerformedByName,
    DateTime PerformedAt);

public record CommentItem(long Id, string Body, string CreatedByName, DateTime CreatedAt);
public record DashboardResponse(Dictionary<string, int> StatusCounts, List<TicketListItem> OngoingTickets);
