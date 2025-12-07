namespace Api.DTOs;

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    string accessToken,
    string refreshToken,
    string Email,
    string DisplayName,
    string Role,
    long Id
);

public record RefreshTokenRequest(string RefreshToken);

public record RefreshTokenResponse(string AccessToken, string RefreshToken);

public record RegisterRequest(string Email, string Password, string DisplayName, string Role);

public record UserResponse(long Id, string Email, string DisplayName, string Role);
