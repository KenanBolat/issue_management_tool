using Api.DTOs;
using Domain.Entities;
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
    public class MilitaryRanksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<MilitaryRanksController> _logger;

        public MilitaryRanksController(AppDbContext context, ILogger<MilitaryRanksController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private long GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return long.Parse(userIdClaim!);
        }

        /// <summary>
        /// Get all military ranks
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<MilitaryRankListItem>>> GetMilitaryRanks(
            [FromQuery] bool includeInactive = false)
        {
            var query = _context.MilitaryRanks.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(r => r.IsActive);
            }

            var ranks = await query
                .OrderBy(r => r.SortOrder)
                .ToListAsync();

            var result = ranks.Select(r => new MilitaryRankListItem(
                r.Id,
                r.Code,
                r.DisplayName,
                r.Description,
                r.SortOrder
            )).ToList();

            return Ok(result);
        }

        /// <summary>
        /// Get military rank by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<MilitaryRankDetail>> GetMilitaryRank(int id)
        {
            var rank = await _context.MilitaryRanks.FindAsync(id);

            if (rank == null)
                return NotFound();

            var result = new MilitaryRankDetail(
                rank.Id,
                rank.Code,
                rank.DisplayName,
                rank.Description,
                rank.SortOrder            );

            return Ok(result);
        }

        /// <summary>
        /// Create new military rank
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<MilitaryRankDetail>> CreateMilitaryRank(
            [FromBody] CreateMilitaryRankRequest request)
        {
            // Validate uniqueness of code
            if (await _context.MilitaryRanks.AnyAsync(r => r.Code == request.Code))
            {
                return BadRequest(new { message = "Bu kod zaten kullanılıyor" });
            }

            // Get max sort order if not provided
            var sortOrder = request.SortOrder ?? 
                (await _context.MilitaryRanks.MaxAsync(r => (int?)r.SortOrder) ?? 0) + 1;

            var rank = new MilitaryRank
            {
                Code = request.Code,
                DisplayName = request.DisplayName,
                Description = request.Description,
                SortOrder = sortOrder,
                IsActive = true
            };

            _context.MilitaryRanks.Add(rank);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Military rank created: {rank.DisplayName} by user {GetCurrentUserId()}");

            var result = new MilitaryRankDetail(
                rank.Id,
                rank.Code,
                rank.DisplayName,
                rank.Description,
                rank.SortOrder
            );

            return CreatedAtAction(nameof(GetMilitaryRank), new { id = rank.Id }, result);
        }

        /// <summary>
        /// Update military rank
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<MilitaryRankDetail>> UpdateMilitaryRank(
            int id,
            [FromBody] UpdateMilitaryRankRequest request)
        {
            var rank = await _context.MilitaryRanks.FindAsync(id);

            if (rank == null)
                return NotFound();

            // Validate code uniqueness
            if (!string.IsNullOrEmpty(request.Code) && request.Code != rank.Code)
            {
                if (await _context.MilitaryRanks.AnyAsync(r => r.Code == request.Code && r.Id != id))
                {
                    return BadRequest(new { message = "Bu kod zaten kullanılıyor" });
                }
                rank.Code = request.Code;
            }

            if (!string.IsNullOrEmpty(request.DisplayName))
                rank.DisplayName = request.DisplayName;

            if (request.Description != null)
                rank.Description = request.Description;

            if (request.SortOrder.HasValue)
                rank.SortOrder = request.SortOrder.Value;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Military rank updated: {rank.DisplayName} by user {GetCurrentUserId()}");

            var result = new MilitaryRankDetail(
                rank.Id,
                rank.Code,
                rank.DisplayName,
                rank.Description,
                rank.SortOrder
            );

            return Ok(result);
        }

        /// <summary>
        /// Delete military rank
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteMilitaryRank(int id)
        {
            var rank = await _context.MilitaryRanks.FindAsync(id);

            if (rank == null)
                return NotFound();

            // Check if rank is in use
            var inUse = await _context.Users.AnyAsync(u => u.MilitaryRankId == id);
            if (inUse)
            {
                return BadRequest(new { message = "Bu rütbe kullanımda olduğu için silinemiyor" });
            }

            _context.MilitaryRanks.Remove(rank);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Military rank deleted: {rank.DisplayName} by user {GetCurrentUserId()}");

            return Ok(new { message = "Rütbe silindi" });
        }

        /// <summary>
        /// Activate military rank
        /// </summary>
        [HttpPost("{id}/activate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ActivateMilitaryRank(int id)
        {
            var rank = await _context.MilitaryRanks.FindAsync(id);

            if (rank == null)
                return NotFound();

            rank.IsActive = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rütbe aktifleştirildi" });
        }

        /// <summary>
        /// Deactivate military rank
        /// </summary>
        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeactivateMilitaryRank(int id)
        {
            var rank = await _context.MilitaryRanks.FindAsync(id);

            if (rank == null)
                return NotFound();

            rank.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rütbe pasifleştirildi" });
        }
    }
}