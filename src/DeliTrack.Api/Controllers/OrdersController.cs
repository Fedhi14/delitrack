using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DeliTrack.Api.DTOs;
using DeliTrack.Api.Models;
using DeliTrack.Api.Services;

namespace DeliTrack.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IDeliveryService _deliveryService;

        public OrdersController(IDeliveryService deliveryService)
        {
            _deliveryService = deliveryService;
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderRequestDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "2"; // Default demo customer if anonymous
            int userId = int.TryParse(userIdStr, out int parsed) ? parsed : 2;

            var order = await _deliveryService.CreateOrderAsync(userId, dto);
            return CreatedAtAction(nameof(GetOrderByTracking), new { trackingNumber = order.TrackingNumber }, order);
        }

        [HttpGet]
        public async Task<ActionResult<List<Order>>> GetOrders([FromQuery] OrderStatus? status = null)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleStr = User.FindFirstValue(ClaimTypes.Role);

            UserRole role = UserRole.Admin;
            int userId = 1;

            if (!string.IsNullOrEmpty(roleStr) && Enum.TryParse<UserRole>(roleStr, out var parsedRole))
            {
                role = parsedRole;
            }
            if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out var parsedId))
            {
                userId = parsedId;
            }

            var orders = await _deliveryService.GetOrdersAsync(role, userId, status);
            return Ok(orders);
        }

        [HttpGet("track/{trackingNumber}")]
        public async Task<ActionResult<Order>> GetOrderByTracking(string trackingNumber)
        {
            var order = await _deliveryService.GetOrderByTrackingNumberAsync(trackingNumber);
            if (order == null)
            {
                return NotFound(new { message = $"Order #{trackingNumber} not found." });
            }
            return Ok(order);
        }

        [HttpPost("{id}/assign")]
        public async Task<ActionResult<Order>> AssignDriver(int id, [FromBody] AssignDriverDto dto)
        {
            try
            {
                var roleStr = User.FindFirstValue(ClaimTypes.Role) ?? "Dispatcher";
                var order = await _deliveryService.AssignDriverAsync(id, dto.DriverId, roleStr);
                return Ok(order);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<Order>> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "3"; // Default demo driver
                int userId = int.TryParse(userIdStr, out int parsed) ? parsed : 3;
                var roleStr = User.FindFirstValue(ClaimTypes.Role) ?? "Driver";
                Enum.TryParse<UserRole>(roleStr, out var role);

                var order = await _deliveryService.UpdateOrderStatusAsync(id, dto.NewStatus, dto.Note, userId, role);
                return Ok(order);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<ActionResult<Order>> CancelOrder(int id)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "2";
                int userId = int.TryParse(userIdStr, out int parsed) ? parsed : 2;
                var roleStr = User.FindFirstValue(ClaimTypes.Role) ?? "Customer";
                Enum.TryParse<UserRole>(roleStr, out var role);

                var order = await _deliveryService.CancelOrderAsync(id, userId, role);
                return Ok(order);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/payment/confirm")]
        public async Task<ActionResult<Order>> ConfirmPayment(int id)
        {
            try
            {
                var order = await _deliveryService.ConfirmPaymentAsync(id);
                return Ok(order);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
