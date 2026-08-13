using System.ComponentModel.DataAnnotations;
using DeliTrack.Api.Models;

namespace DeliTrack.Api.DTOs
{
    public class LoginRequestDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequestDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Customer;
        public string Address { get; set; } = string.Empty;
        public string VehicleType { get; set; } = "Motorcycle";
        public string VehiclePlateNumber { get; set; } = string.Empty;
        public double CapacityKg { get; set; } = 30.0;
        public string NationalIdNumber { get; set; } = string.Empty;
        public string PassportNumber { get; set; } = string.Empty;
        public string FinFanNumber { get; set; } = string.Empty;
        public string FaydaIdFrontUrl { get; set; } = string.Empty;
        public string FaydaIdBackUrl { get; set; } = string.Empty;
        public string SelfieUrl { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public int? ProfileId { get; set; }
        public bool IsVerified { get; set; } = false;
        public string VerificationStatus { get; set; } = "UNVERIFIED";
    }

    public class DriverResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string VehicleType { get; set; } = "Motorcycle";
        public string VehiclePlateNumber { get; set; } = string.Empty;
        public bool IsAvailable { get; set; } = true;
        public double Rating { get; set; } = 5.0;
        public int TotalDeliveriesCompleted { get; set; } = 0;
        public string NationalIdNumber { get; set; } = string.Empty;
        public string PassportNumber { get; set; } = string.Empty;
        public string FinFanNumber { get; set; } = string.Empty;
        public string FaydaIdFrontUrl { get; set; } = string.Empty;
        public string FaydaIdBackUrl { get; set; } = string.Empty;
        public string SelfieUrl { get; set; } = string.Empty;
        public bool IsVerified { get; set; } = false;
        public string VerificationStatus { get; set; } = "UNVERIFIED";
    }

    public class DriverKycRequestDto
    {
        [Required]
        public string FinFanNumber { get; set; } = string.Empty;
        public string FaydaIdFrontUrl { get; set; } = string.Empty;
        public string FaydaIdBackUrl { get; set; } = string.Empty;
        public string SelfieUrl { get; set; } = string.Empty;
    }

    public class CreateOrderRequestDto
    {
        [Required]
        public string PickupAddress { get; set; } = string.Empty;
        public string PickupCity { get; set; } = "Addis Ababa";
        public double PickupLatitude { get; set; } = 9.0300;
        public double PickupLongitude { get; set; } = 38.7400;

        [Required]
        public string DropoffAddress { get; set; } = string.Empty;
        public string DropoffCity { get; set; } = "Addis Ababa";
        public double DropoffLatitude { get; set; } = 8.9800;
        public double DropoffLongitude { get; set; } = 38.7900;

        public double PackageWeightKg { get; set; } = 2.5;
        public string PackageDescription { get; set; } = string.Empty;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Telebirr;
        public int? PreferredDriverId { get; set; }
        public List<CreateOrderItemDto> Items { get; set; } = new();
    }

    public class CreateOrderItemDto
    {
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; } = 0.00m;
    }

    public class AssignDriverDto
    {
        [Required]
        public int DriverId { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        [Required]
        public OrderStatus NewStatus { get; set; }
        public string Note { get; set; } = string.Empty;
    }

    public class DriverLocationUpdateDto
    {
        [Required]
        public double Latitude { get; set; }
        [Required]
        public double Longitude { get; set; }
        public int? CurrentOrderId { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int InTransitOrders { get; set; }
        public int DeliveredOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public int AvailableDrivers { get; set; }
        public int ActiveDrivers { get; set; }
        public double AverageDeliveryTimeMinutes { get; set; }
    }
}
