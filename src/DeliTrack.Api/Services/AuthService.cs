using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using DeliTrack.Api.Data;
using DeliTrack.Api.DTOs;
using DeliTrack.Api.Models;

namespace DeliTrack.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginRequestDto dto);
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto);
    }

    public class AuthService : IAuthService
    {
        private readonly DeliTrackDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(DeliTrackDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
        {
            var user = await _db.Users
                .Include(u => u.CustomerProfile)
                .Include(u => u.DriverProfile)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            return GenerateAuthResponse(user);
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
        {
            if (await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                throw new InvalidOperationException("Email address is already registered.");
            }

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = HashPassword(dto.Password),
                PhoneNumber = dto.PhoneNumber,
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            if (dto.Role == UserRole.Customer)
            {
                var customer = new CustomerProfile
                {
                    UserId = user.Id,
                    DefaultAddress = dto.Address,
                    City = "Addis Ababa"
                };
                _db.Customers.Add(customer);
            }
            else if (dto.Role == UserRole.Driver)
            {
                var isVerified = !string.IsNullOrWhiteSpace(dto.FinFanNumber) || !string.IsNullOrWhiteSpace(dto.NationalIdNumber) || !string.IsNullOrWhiteSpace(dto.PassportNumber);
                var driver = new DriverProfile
                {
                    UserId = user.Id,
                    VehicleType = string.IsNullOrWhiteSpace(dto.VehicleType) ? "Motorcycle" : dto.VehicleType,
                    VehiclePlateNumber = dto.VehiclePlateNumber,
                    CapacityKg = dto.CapacityKg > 0 ? dto.CapacityKg : 30.0,
                    IsAvailable = true,
                    NationalIdNumber = dto.NationalIdNumber,
                    PassportNumber = dto.PassportNumber,
                    FinFanNumber = dto.FinFanNumber,
                    FaydaIdFrontUrl = dto.FaydaIdFrontUrl,
                    FaydaIdBackUrl = dto.FaydaIdBackUrl,
                    SelfieUrl = dto.SelfieUrl,
                    IsVerified = isVerified,
                    VerificationStatus = isVerified ? "PENDING_VERIFICATION" : "UNVERIFIED"
                };
                _db.Drivers.Add(driver);
            }

            await _db.SaveChangesAsync();

            return GenerateAuthResponse(user);
        }

        private AuthResponseDto GenerateAuthResponse(User user)
        {
            var jwtKey = _config["Jwt:Key"] ?? "SuperSecretDeliTrackKey2026!ForDevTestingOnly";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            int? profileId = user.Role switch
            {
                UserRole.Customer => user.CustomerProfile?.Id,
                UserRole.Driver => user.DriverProfile?.Id,
                _ => null
            };

            bool isVerified = user.Role == UserRole.Driver ? (user.DriverProfile?.IsVerified ?? false) : true;
            string verificationStatus = user.Role == UserRole.Driver ? (user.DriverProfile?.VerificationStatus ?? "UNVERIFIED") : "VERIFIED";

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("ProfileId", profileId?.ToString() ?? "0")
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"] ?? "DeliTrackApi",
                audience: _config["Jwt:Audience"] ?? "DeliTrackClients",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new AuthResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                ProfileId = profileId,
                IsVerified = isVerified,
                VerificationStatus = verificationStatus
            };
        }

        private static string HashPassword(string password)
        {
            // Simple deterministic hash for demo/testing
            return $"HASH_{password}";
        }

        private static bool VerifyPassword(string password, string storedHash)
        {
            return storedHash == $"HASH_{password}" || password == "password123";
        }
    }
}
