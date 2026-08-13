using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DeliTrack.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum UserRole
    {
        Customer = 1,
        Driver = 2,
        Dispatcher = 3,
        Admin = 4
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum OrderStatus
    {
        PENDING = 1,
        CONFIRMED = 2,
        ASSIGNED = 3,
        PICKED_UP = 4,
        IN_TRANSIT = 5,
        DELIVERED = 6,
        CANCELLED = 7,
        FAILED = 8,
        RETURNED = 9
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum PaymentMethod
    {
        Cash = 1,
        BankTransfer = 2,
        Telebirr = 3,
        Card = 4
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum PaymentStatus
    {
        PENDING = 1,
        PAID = 2,
        FAILED = 3,
        REFUNDED = 4
    }

    public class User
    {
        public int Id { get; set; }
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        [Required]
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public CustomerProfile? CustomerProfile { get; set; }
        public DriverProfile? DriverProfile { get; set; }
    }

    public class CustomerProfile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string DefaultAddress { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public int TotalOrders { get; set; } = 0;
    }

    public class DriverProfile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string VehicleType { get; set; } = "Motorcycle"; // Motorbike, Van, Truck
        public string VehiclePlateNumber { get; set; } = string.Empty;
        public double CapacityKg { get; set; } = 50.0;
        public double CurrentActiveCapacityKg { get; set; } = 0.0;
        public bool IsAvailable { get; set; } = true;
        public double CurrentLatitude { get; set; } = 9.0300; // Addis Ababa default
        public double CurrentLongitude { get; set; } = 38.7400;
        public DateTime LastLocationUpdate { get; set; } = DateTime.UtcNow;
        public int TotalDeliveriesCompleted { get; set; } = 0;
        public double Rating { get; set; } = 5.0;

        // Identity Verification & Fayda KYC
        public string NationalIdNumber { get; set; } = string.Empty;
        public string PassportNumber { get; set; } = string.Empty;
        public string FinFanNumber { get; set; } = string.Empty;
        public string FaydaIdFrontUrl { get; set; } = string.Empty;
        public string FaydaIdBackUrl { get; set; } = string.Empty;
        public string SelfieUrl { get; set; } = string.Empty;
        public string IdDocumentUrl { get; set; } = string.Empty;
        public bool IsVerified { get; set; } = false;
        public string VerificationStatus { get; set; } = "UNVERIFIED";
    }

    public class Order
    {
        public int Id { get; set; }
        [Required]
        public string TrackingNumber { get; set; } = string.Empty; // e.g. ORD-1024
        
        public int CustomerId { get; set; }
        public CustomerProfile? Customer { get; set; }
        
        public int? DriverId { get; set; }
        public DriverProfile? Driver { get; set; }
        
        public OrderStatus Status { get; set; } = OrderStatus.PENDING;
        
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
        public decimal ShippingFee { get; set; } = 150.00m;
        
        public DateTime? EstimatedDeliveryTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Collections
        public List<OrderItem> Items { get; set; } = new();
        public Payment? Payment { get; set; }
        public List<OrderStatusHistory> StatusHistories { get; set; } = new();
        public List<DriverLocationLog> LocationLogs { get; set; } = new();
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        [JsonIgnore]
        public Order? Order { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; } = 0.00m;
    }

    public class Payment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        [JsonIgnore]
        public Order? Order { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; } = PaymentMethod.Telebirr;
        public PaymentStatus Status { get; set; } = PaymentStatus.PENDING;
        public string TransactionId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class OrderStatusHistory
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        [JsonIgnore]
        public Order? Order { get; set; }
        public OrderStatus Status { get; set; }
        public string Note { get; set; } = string.Empty;
        public string UpdatedByRole { get; set; } = "System";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class DriverLocationLog
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        [JsonIgnore]
        public Order? Order { get; set; }
        public int DriverId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    }

    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public int? OrderId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
