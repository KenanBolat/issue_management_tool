namespace Api.DTOs;

public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string Email, string DisplayName, string Role);
public record RegisterRequest(string Email, string Password, string DisplayName, string Role);
public record UserResponse(long Id, string Email, string DisplayName, string Role);