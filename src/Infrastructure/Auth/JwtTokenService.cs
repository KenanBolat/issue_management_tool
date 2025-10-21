using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

using Domain.Entities; 

namespace Infrastructure.Auth
{
    public class JwtTokenService
    {
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _expirationMinutes;

        public JwtTokenService(IConfiguration configuration)
        {
            _secretKey = configuration["Jwt:SecretKey"] ?? throw new ArgumentNullException("Jwt: SecretKey");
            _issuer = configuration["Jwt:Issuer"] ?? throw new ArgumentNullException("Jwt: Issuer");
            _audience = configuration["Jwt:Audience"] ?? throw new ArgumentNullException("Jwt: Audience");
            _expirationMinutes = int.Parse(configuration["Jwt:ExpirationMinutes"] ?? "60");
        }

        public string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.DisplayName),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_expirationMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


    }
}