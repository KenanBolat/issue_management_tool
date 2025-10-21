using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Auth;
using Infrastructure.Data;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtTokenService _tokenService;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthController(AppDbContext context, JwtTokenService jwtTokenService)
        {
            _context = context;
            _tokenService = jwtTokenService;
            _passwordHasher = new PasswordHasher<User>();
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

            if (result == PasswordVerificationResult.Failed)
                return Unauthorized(new { message = "Invalid credentials" });

            var token = _tokenService.GenerateToken(user);

            return Ok(new LoginResponse(token, user.Email, user.DisplayName, user.Role.ToString()));
        }

        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserResponse>> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "Email already exists" });

            if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
                return BadRequest(new { message = "Invalid role" });

            var user = new User
            {
                Email = request.Email,
                DisplayName = request.DisplayName,
                Role = role,
                CreatedAt = DateTime.UtcNow
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new UserResponse(user.Id, user.Email, user.DisplayName, user.Role.ToString()));
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserResponse>> GetCurrentUser()
        {
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound();

            return Ok(new UserResponse(user.Id, user.Email, user.DisplayName, user.Role.ToString()));
        }



    }
}