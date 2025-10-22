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

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtTokenService _tokenService;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, JwtTokenService tokenService, ILogger<AuthController> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = new PasswordHasher<User>();
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        _logger.LogInformation("=== Login Attempt ===");
        _logger.LogInformation($"Email: {request.Email}");
        _logger.LogInformation($"Password length: {request.Password?.Length ?? 0}");
        
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

        if (user == null)
        {
            _logger.LogWarning($"User not found or inactive: {request.Email}");
            return Unauthorized(new { message = "Invalid credentials" });
        }

        _logger.LogInformation($"User found - ID: {user.Id}, Email: {user.Email}");
        _logger.LogInformation($"Hash exists: {!string.IsNullOrEmpty(user.PasswordHash)}");
        _logger.LogInformation($"Hash length: {user.PasswordHash?.Length ?? 0}");
        _logger.LogInformation($"Password to verify: '{request.Password}'");
        
        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        _logger.LogInformation($"Verification result: {result}");
        
        if (result == PasswordVerificationResult.Failed)
        {
            _logger.LogWarning("Password verification FAILED");
            
            // Try to hash the provided password and log first 20 chars for comparison
            var testHash = _passwordHasher.HashPassword(user, request.Password);
            _logger.LogInformation($"Test hash (first 30 chars): {testHash.Substring(0, Math.Min(30, testHash.Length))}");
            _logger.LogInformation($"Stored hash (first 30 chars): {user.PasswordHash.Substring(0, Math.Min(30, user.PasswordHash.Length))}");
            
            return Unauthorized(new { message = "Invalid credentials" });
        }

        _logger.LogInformation("Login successful!");
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
            CreatedAt = DateTime.UtcNow,
            IsActive = true
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