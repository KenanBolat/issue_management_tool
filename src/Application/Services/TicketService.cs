using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;


namespace Application.Services
{
    public class TicketService
    {
        private readonly AppDbContext _context;
        private readonly SummaryBuilder _summaryBuilder;

        public TicketService(AppDbContext context, SummaryBuilder summaryBuilder)
        {
            _context = context;
            _summaryBuilder = summaryBuilder;
        }

        public async Task<Ticket> CreateTicketAync(Ticket ticket, long userID)
        {
            ticket.CreatedById = userID;
            ticket.CreatedAt = DateTime.UtcNow;
            ticket.UpdatedAt = DateTime.UtcNow;

            _context.Tickets.Add(ticket);

            var action = new TicketAction
            {
                Ticket = ticket,
                ActionType = ActionType.Create,
                ToStatus = ticket.Status,
                PerformedById = userID,
                PerformedAt = DateTime.UtcNow,
                Notes = "Ticket created"
            };
            _context.TicketActions.Add(action);
            await _context.SaveChangesAsync();

            return ticket;
        }



        public async Task<Ticket> GetTicketByIdAsync(long ticketId)
        {
            return await _context.Tickets
                .Include(t => t.CreatedBy)
                .Include(t => t.LastUpdatedBy)
                .Include(t => t.CI)
                .Include(t => t.Component)
                .Include(t => t.Subsystem)
                .Include(t => t.System)
                .Include(t => t.Actions.OrderByDescending(a => a.PerformedAt)).ThenInclude(a => a.PerformedBy)
                .Include(t => t.Comments.OrderByDescending(c => c.CreatedAt)).ThenInclude(c => c.CreatedBy)
                .Include(t => t.Attachments)
                .Include(t => t.CIJobs.OrderByDescending(j => j.CreatedAt))
                .FirstOrDefaultAsync(t => t.Id == ticketId && !t.IsDeleted);

        }

        public async Task<bool> ChangeStatusAsync(long ticketId, TicketStatus toStatus,
        string? notes, ConfirmationStatus? confirmationStatus, long userId)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null) return false;

            if (!IsValidTransition(ticket.Status, toStatus))
                throw new InvalidOperationException(
                    $"Invalid status transition from {ticket.Status} to {toStatus}");

            var action = new TicketAction
            {
                TicketId = ticketId,
                ActionType = ActionType.StatusChange,
                FromStatus = ticket.Status,
                ToStatus = toStatus,
                Notes = notes,
                PerformedById = userId,
                PerformedAt = DateTime.UtcNow
            };

            ticket.Status = toStatus;
            if (confirmationStatus.HasValue)
                ticket.ConfirmationStatus = confirmationStatus;

            ticket.LastUpdatedById = userId;
            ticket.UpdatedAt = DateTime.UtcNow;

            if (toStatus == TicketStatus.CLOSED)
            {
                ticket.ResolutionDate = DateTime.UtcNow;
                await SummarizeTicketAsync(ticketId);
            }

            _context.TicketActions.Add(action);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task SummarizeTicketAsync(long ticketId)
        {
            var ticket = await GetTicketByIdAsync(ticketId);
            if (ticket == null) return;

            var summary = _summaryBuilder.BuildSummary(ticket);
            ticket.Description = summary;
            ticket.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        private static bool IsValidTransition(TicketStatus from, TicketStatus to)
        {
            return (from, to) switch
            {
                (TicketStatus.OPEN, TicketStatus.PAUSED or TicketStatus.CONFIRMED
                    or TicketStatus.CLOSED or TicketStatus.CANCELLED) => true,
                (TicketStatus.PAUSED, TicketStatus.OPEN or TicketStatus.CONFIRMED
                    or TicketStatus.CANCELLED) => true,
                (TicketStatus.CONFIRMED, TicketStatus.OPEN or TicketStatus.PAUSED
                    or TicketStatus.CLOSED or TicketStatus.CANCELLED) => true,
                (TicketStatus.CLOSED, TicketStatus.REOPENED) => true,
                (TicketStatus.REOPENED, TicketStatus.OPEN or TicketStatus.CONFIRMED
                    or TicketStatus.CLOSED or TicketStatus.CANCELLED) => true,
                _ => false
            };
        }
    }
}