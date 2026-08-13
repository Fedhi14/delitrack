using Microsoft.AspNetCore.Mvc;
using DeliTrack.Api.DTOs;
using DeliTrack.Api.Services;

namespace DeliTrack.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IDeliveryService _deliveryService;

        public AdminController(IDeliveryService deliveryService)
        {
            _deliveryService = deliveryService;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetStats()
        {
            var stats = await _deliveryService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpPost("drivers/{id}/verify")]
        public async Task<IActionResult> VerifyDriver(int id, [FromQuery] bool approve = true)
        {
            try
            {
                var driver = await _deliveryService.VerifyDriverAsync(id, approve);
                return Ok(new { message = $"Driver status updated to {driver.VerificationStatus}.", driverId = driver.Id, isVerified = driver.IsVerified });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
