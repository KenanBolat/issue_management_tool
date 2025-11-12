using System.Reflection.PortableExecutable;

namespace Api.DTOs;

// Create a new ticket 
public record CreateTicketRequest(
        string Title,
        string Description,
        bool IsBlocking,
        string Status,
        bool TechnicalReportRequired,
        long? CIId,
        long? ComponentId,
        long? SubsystemId,
        long? SystemId,
        // Detection fields
        DateTime? DetectedDate,
        DateTime? DetectedContractorNotifiedAt,
        string[]? DetectedNotificationMethods,
        long? DetectedByUserId,
        // Response fields
        DateTime? ResponseDate,
        DateTime? ResponseResolvedAt,
        List<long>? ResponsePersonnelIds,
        string? ResponseActions, 

        // Activity control fields
        long? ActivityControlPersonnelId,
        long? ActivityControlCommanderId,
        DateTime? ActivityControlDate,
        string? ActivityControlResult);

// Change Status of the ticket 
public record ChangeStatusRequest(
    string ToStatus, 
    string? Notes, 
    string? ConfirmationStatus);

// Add comment and/or progress     
public record AddCommentRequest(
    string Body);

// List the available tickets in the system
public record TicketListItem(
        long Id,
        string ExternalCode,
        string Title,
        string Status,
        bool IsBlocking,
        DateTime CreatedAt,
        string CreatedByName,
        bool HasSuccessfulCIJob,
        bool IsActive,
        bool IsDeleted,
        DateTime? DetectDate,
        DateTime? ResponseDate,
        string? DetectedByUserName);

// Get the associated ticket detail
public record TicketDetail(
        long Id,
        string ExternalCode,
        string Title,
        string Description,
        bool IsBlocking,
        string Status,
        string? ConfirmationStatus,
        bool TechnicalReportRequired,
        DateTime CreatedAt,
        DateTime UpdatedAt,
        string CreatedByName,
        long CreatedById,
        string? LastUpdatedByName,
        long? LastUpdatedById,
        bool IsActive,
        bool IsDeleted,
        long? CIId,
        long? ComponentId,
        long? SubsystemId,
        long? SystemId,
        string? CIName,
        string? ComponentName,
        string? SubsystemName,
        string? SystemName,
        // Detection fields
        DateTime? DetectedDate,
        DateTime? DetectedContractorNotifiedAt,
        string[]? DetectedNotificationMethods,
        long? DetectedByUserId,
        string? DetectedByUserName,
        // Response fields
        DateTime? ResponseDate,
        DateTime? ResponseResolvedAt,
        List<ResponsePersonnelItem> ResponsePersonnel,
        string? ResponseActions, 

        // Activity control fields
        long? ActivityControlPersonnelId,
        long? ActivityControlCommanderId,
        DateTime? ActivityControlDate,
        string? ActivityControlResult,

        // Related data
        List<TicketActionItem> Actions,
        List<CommentItem> Comments
        );

// Response personnel item
public record ResponsePersonnelItem(
        long UserId,
        string DisplayName);

// Update the action taken on the selected ticket 
public record TicketActionItem(
        long Id,
        string ActionType,
        string? FromStatus,
        string? ToStatus,
        string? Notes,
        string PerformedByName,
        DateTime PerformedAt);

// Progress/Comment item
public record CommentItem(
        long Id,
        string Body,
        string CreatedByName, 
        DateTime CreatedAt);

// Get Dashboard result 
public record DashboardResponse(
        Dictionary<string, int> StatusCounts, 
        List<TicketListItem> OngoingTickets);

// Update ticket request
public record UpdateTicketRequest(
        string? Title,
        string? Description,
        bool? IsBlocking,
        bool? TechnicalReportRequired,
        long? CIId,
        long? ComponentId,
        long? SubsystemId,
        long? SystemId,
        // Detection fields
        DateTime? DetectedDate,
        DateTime? DetectedContractorNotifiedAt,
        string[]? DetectedNotificationMethods,
        long? DetectedByUserId,
        // Response fields
        DateTime? ResponseDate,
        DateTime? ResponseResolvedAt,
        List<long>? ResponsePersonnelIds,
        string? ResponseActions,

        // Activity control fields
        long? ActivityControlPersonnelId,
        long? ActivityControlCommanderId,
        DateTime? ActivityControlDate,
        string? ActivityControlResult,
        string? Status
        );
        


public record SystemOption(
        long Id,
        string? Name
);

public record SubsystemOption(
        long Id,
        string Name,
        long? SystemId
);


public record CIOption(
        long Id,
        string Name             
); 

public record ComponentOption( 
        long Id,
        string Name,
        long? SubsystemId
);