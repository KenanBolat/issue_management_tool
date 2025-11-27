using Api.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketPausesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TicketPausesController> _logger;

        public TicketPausesController(AppDbContext context, ILogger<TicketPausesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private long GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return long.Parse(userIdClaim!);
        }

        // GET: /api/TicketPauses
        [HttpGet]
        public async Task<ActionResult<List<TicketPauseListItem>>> GetAllPauses(
            [FromQuery] bool? activeOnly = null)
        {
            var query = _context.TicketPauses
                .Include(tp => tp.Ticket)
                .Include(tp => tp.PausedByUser)
                .Include(tp => tp.ResumedByUser)
                .AsQueryable();

            if (activeOnly == true)
            {
                query = query.Where(tp => tp.ResumedAt == null);
            }

            var pauses = await query
                .OrderByDescending(tp => tp.PausedAt)
                .ToListAsync();

            var result = pauses.Select(tp => new TicketPauseListItem(
                tp.Id,
                tp.TicketId,
                tp.Ticket.ExternalCode,
                tp.PausedAt,
                tp.ResumedAt,
                tp.PauseReason,
                tp.ResumeNotes,
                tp.PausedByUser.DisplayName,
                tp.ResumedByUser?.DisplayName,
                tp.ResumedAt == null,
                CalculateDurationDays(tp.PausedAt, tp.ResumedAt)
            )).ToList();

            return Ok(result);
        }

        // GET: /api/TicketPauses/ticket/{ticketId}
        [HttpGet("ticket/{ticketId}")]
        public async Task<ActionResult<List<TicketPauseDetail>>> GetTicketPauses(long ticketId)
        {
            var pauses = await _context.TicketPauses
                .Include(tp => tp.Ticket)
                .Include(tp => tp.PausedByUser)
                .Include(tp => tp.ResumedByUser)
                .Where(tp => tp.TicketId == ticketId)
                .OrderByDescending(tp => tp.PausedAt)
                .ToListAsync();

            var result = pauses.Select(tp => new TicketPauseDetail(
                tp.Id,
                tp.TicketId,
                tp.Ticket.ExternalCode,
                tp.Ticket.Title,
                tp.PausedAt,
                tp.ResumedAt,
                tp.PauseReason,
                tp.ResumeNotes,
                tp.PausedByUserId,
                tp.PausedByUser.DisplayName,
                tp.ResumedByUserId,
                tp.ResumedByUser?.DisplayName,
                tp.CreatedAt
            )).ToList();

            return Ok(result);
        }

        // GET: /api/TicketPauses/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TicketPauseDetail>> GetPause(long id)
        {
            var pause = await _context.TicketPauses
                .Include(tp => tp.Ticket)
                .Include(tp => tp.PausedByUser)
                .Include(tp => tp.ResumedByUser)
                .FirstOrDefaultAsync(tp => tp.Id == id);

            if (pause == null)
                return NotFound();

            var result = new TicketPauseDetail(
                pause.Id,
                pause.TicketId,
                pause.Ticket.ExternalCode,
                pause.Ticket.Title,
                pause.PausedAt,
                pause.ResumedAt,
                pause.PauseReason,
                pause.ResumeNotes,
                pause.PausedByUserId,
                pause.PausedByUser.DisplayName,
                pause.ResumedByUserId,
                pause.ResumedByUser?.DisplayName,
                pause.CreatedAt
            );

            return Ok(result);
        }

        // POST: /api/TicketPauses
        [HttpPost]
        [Authorize(Roles = "Editor,Admin")]
        public async Task<ActionResult<TicketPauseDetail>> CreatePause([FromBody] CreateTicketPauseRequest request)
        {
            var ticket = await _context.Tickets.FindAsync(request.TicketId);
            
            if (ticket == null)
                return NotFound(new { message = "Ticket bulunamadı" });

            if (ticket.Status == TicketStatus.PAUSED)
                return BadRequest(new { message = "Ticket zaten duraklatılmış durumda" });

            var userId = GetCurrentUserId();

            // Create pause record
            var pause = new TicketPause
            {
                TicketId = request.TicketId,
                PausedByUserId = userId,
                PausedAt = DateTime.UtcNow,
                PauseReason = request.PauseReason,
                CreatedAt = DateTime.UtcNow
            };

            _context.TicketPauses.Add(pause);

            // Update ticket status
            ticket.Status = TicketStatus.PAUSED;
            ticket.UpdatedAt = DateTime.UtcNow;
            ticket.LastUpdatedById = userId;

            // Log action
            var action = new TicketAction
            {
                TicketId = request.TicketId,
                ActionType = ActionType.StatusChange,
                FromStatus = ticket.Status,
                ToStatus = TicketStatus.PAUSED,
                Notes = $"Duraklama Sebebi: {request.PauseReason}",
                PerformedById = userId,
                PerformedAt = DateTime.UtcNow
            };

            _context.TicketActions.Add(action);

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Ticket {request.TicketId} paused by user {userId}");

            // Return created pause
            var createdPause = await GetPause(pause.Id);
            return CreatedAtAction(nameof(GetPause), new { id = pause.Id }, createdPause.Value);
        }

        // POST: /api/TicketPauses/{id}/resume
        [HttpPost("{id}/resume")]
        [Authorize(Roles = "Editor,Admin")]
        public async Task<ActionResult> ResumePause(long id, [FromBody] ResumeTicketPauseRequest request)
        {
            var pause = await _context.TicketPauses
                .Include(tp => tp.Ticket)
                .FirstOrDefaultAsync(tp => tp.Id == id);

            if (pause == null)
                return NotFound(new { message = "Pause kaydı bulunamadı" });

            if (pause.ResumedAt.HasValue)
                return BadRequest(new { message = "Bu pause zaten sonlandırılmış" });

            var userId = GetCurrentUserId();

            // Update pause record
            pause.ResumedAt = DateTime.UtcNow;
            pause.ResumedByUserId = userId;
            pause.ResumeNotes = request.ResumeNotes;

            // Update ticket status back to OPEN
            pause.Ticket.Status = TicketStatus.OPEN;
            pause.Ticket.UpdatedAt = DateTime.UtcNow;
            pause.Ticket.LastUpdatedById = userId;

            // Log action
            var action = new TicketAction
            {
                TicketId = pause.TicketId,
                ActionType = ActionType.StatusChange,
                FromStatus = TicketStatus.PAUSED,
                ToStatus = TicketStatus.OPEN,
                Notes = request.ResumeNotes ?? "Duraklama sonlandırıldı",
                PerformedById = userId,
                PerformedAt = DateTime.UtcNow
            };

            _context.TicketActions.Add(action);

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Pause {id} resumed by user {userId}");

            return Ok(new { message = "Duraklama sonlandırıldı" });
        }

        // PUT: /api/TicketPauses/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Editor,Admin")]
        public async Task<ActionResult> UpdatePause(long id, [FromBody] UpdateTicketPauseRequest request)
        {
            var pause = await _context.TicketPauses.FindAsync(id);

            if (pause == null)
                return NotFound();

            pause.PauseReason = request.PauseReason;
            pause.ResumeNotes = request.ResumeNotes;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Pause bilgileri güncellendi" });
        }

        // DELETE: /api/TicketPauses/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeletePause(long id)
        {
            var pause = await _context.TicketPauses.FindAsync(id);

            if (pause == null)
                return NotFound();

            _context.TicketPauses.Remove(pause);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Pause kaydı silindi" });
        }

        private int CalculateDurationDays(DateTime start, DateTime? end)
        {
            var endDate = end ?? DateTime.UtcNow;
            return (int)(endDate - start).TotalDays;
        }
    }
}