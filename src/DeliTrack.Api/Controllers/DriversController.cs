using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using DeliTrack.Api.DTOs;
using DeliTrack.Api.Models;
using DeliTrack.Api.Services;

namespace DeliTrack.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DriversController : ControllerBase
    {
        private readonly IDeliveryService _deliveryService;

        public DriversController(IDeliveryService deliveryService)
        {
            _deliveryService = deliveryService;
        }

        [HttpGet]
        public async Task<ActionResult<List<DriverResponseDto>>> GetDrivers()
        {
            var drivers = await _deliveryService.GetDriversAsync();
            var dtos = drivers.Select(d => new DriverResponseDto
            {
                Id = d.Id,
                UserId = d.UserId,
                FullName = d.User?.FullName ?? "Driver",
                PhoneNumber = d.User?.PhoneNumber ?? string.Empty,
                Email = d.User?.Email ?? string.Empty,
                VehicleType = d.VehicleType,
                VehiclePlateNumber = d.VehiclePlateNumber,
                IsAvailable = d.IsAvailable,
                Rating = d.Rating,
                TotalDeliveriesCompleted = d.TotalDeliveriesCompleted,
                NationalIdNumber = d.NationalIdNumber,
                PassportNumber = d.PassportNumber,
                FinFanNumber = d.FinFanNumber,
                FaydaIdFrontUrl = d.FaydaIdFrontUrl,
                FaydaIdBackUrl = d.FaydaIdBackUrl,
                SelfieUrl = d.SelfieUrl,
                IsVerified = d.IsVerified,
                VerificationStatus = d.VerificationStatus
            }).ToList();

            return Ok(dtos);
        }

        [HttpPost("location")]
        public async Task<IActionResult> UpdateLocation([FromBody] DriverLocationUpdateDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "3";
            int userId = int.TryParse(userIdStr, out int parsed) ? parsed : 3;

            await _deliveryService.UpdateDriverLocationAsync(userId, dto.Latitude, dto.Longitude, dto.CurrentOrderId);
            return Ok(new { message = "Driver location updated successfully." });
        }

        [HttpPost("availability")]
        public async Task<IActionResult> ToggleAvailability([FromBody] bool isAvailable)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "3";
            int userId = int.TryParse(userIdStr, out int parsed) ? parsed : 3;

            await _deliveryService.ToggleDriverAvailabilityAsync(userId, isAvailable);
            return Ok(new { message = $"Availability updated to {isAvailable}." });
        }

        [HttpPost("kyc")]
        public async Task<IActionResult> SubmitKyc([FromBody] DriverKycRequestDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "3";
            int userId = int.TryParse(userIdStr, out int parsed) ? parsed : 3;

            var driver = await _deliveryService.SubmitDriverKycAsync(userId, dto);
            return Ok(new { message = "Driver KYC documents submitted successfully.", isVerified = driver.IsVerified, status = driver.VerificationStatus });
        }
    }
}
