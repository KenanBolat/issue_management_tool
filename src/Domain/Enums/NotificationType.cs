namespace Domain.Enums
{
    public enum NotificationType
    {
        NewTicket = 0,              // New ticket created
        ProgressRequest = 1,        // Someone requested progress update
        TicketAssigned = 2,         // Ticket assigned to user
        StatusChanged = 3,          // Ticket status changed
        TicketClosed = 4,           // Ticket closed
        CommentAdded = 5,           // New comment added
        ProgressUpdated = 6,        // Progress was updated
        TicketBlocking = 7,         // Ticket marked as blocking
        DeadlineApproaching = 8,    // Deadline approaching
        TicketReopened = 9          // Ticket reopened
    }
}