using Microsoft.EntityFrameworkCore;
using DeliTrack.Api.Models;

namespace DeliTrack.Api.Data
{
    public class DeliTrackDbContext : DbContext
    {
        public DeliTrackDbContext(DbContextOptions<DeliTrackDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<CustomerProfile> Customers => Set<CustomerProfile>();
        public DbSet<DriverProfile> Drivers => Set<DriverProfile>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
        public DbSet<DriverLocationLog> DriverLocationLogs => Set<DriverLocationLog>();
        public DbSet<Notification> Notifications => Set<Notification>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User -> Customer (1 to 1)
            modelBuilder.Entity<User>()
                .HasOne(u => u.CustomerProfile)
                .WithOne(c => c.User)
                .HasForeignKey<CustomerProfile>(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> Driver (1 to 1)
            modelBuilder.Entity<User>()
                .HasOne(u => u.DriverProfile)
                .WithOne(d => d.User)
                .HasForeignKey<DriverProfile>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Customer -> Orders (1 to Many)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany()
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Driver -> Orders (1 to Many, Nullable)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Driver)
                .WithMany()
                .HasForeignKey(o => o.DriverId)
                .OnDelete(DeleteBehavior.SetNull);

            // Order -> Payment (1 to 1)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Payment)
                .WithOne(p => p.Order)
                .HasForeignKey<Payment>(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order -> OrderItems (1 to Many)
            modelBuilder.Entity<Order>()
                .HasMany(o => o.Items)
                .WithOne(i => i.Order)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order -> StatusHistories
            modelBuilder.Entity<Order>()
                .HasMany(o => o.StatusHistories)
                .WithOne(h => h.Order)
                .HasForeignKey(h => h.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique index for tracking number
            modelBuilder.Entity<Order>()
                .HasIndex(o => o.TrackingNumber)
                .IsUnique();

            // Seed Initial Data (Admin, Customer, Driver, Dispatcher, Sample Orders)
            SeedInitialData(modelBuilder);
        }

        private void SeedInitialData(ModelBuilder modelBuilder)
        {
            // Seed Users (Passwords are pre-hashed for demo: "password123")
            // Simple hash representation: "HASH_password123"
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, FullName = "System Admin", Email = "admin@delitrack.com", PasswordHash = "HASH_password123", Role = UserRole.Admin, PhoneNumber = "+251911000001", CreatedAt = DateTime.UtcNow },
                new User { Id = 2, FullName = "Yad (Customer)", Email = "yad@gmail.com", PasswordHash = "HASH_password123", Role = UserRole.Customer, PhoneNumber = "+251911000002", CreatedAt = DateTime.UtcNow },
                new User { Id = 3, FullName = "Abebe Kebede (Driver)", Email = "abebe@delitrack.com", PasswordHash = "HASH_password123", Role = UserRole.Driver, PhoneNumber = "+251911000003", CreatedAt = DateTime.UtcNow },
                new User { Id = 4, FullName = "Dawit Dispatcher", Email = "dispatcher@delitrack.com", PasswordHash = "HASH_password123", Role = UserRole.Dispatcher, PhoneNumber = "+251911000004", CreatedAt = DateTime.UtcNow }
            );

            modelBuilder.Entity<CustomerProfile>().HasData(
                new CustomerProfile { Id = 1, UserId = 2, DefaultAddress = "Bole Medhanialem, Addis Ababa", City = "Addis Ababa", TotalOrders = 5 }
            );

            modelBuilder.Entity<DriverProfile>().HasData(
                new DriverProfile
                {
                    Id = 1,
                    UserId = 3,
                    VehicleType = "Motorcycle",
                    VehiclePlateNumber = "AA-3-98234",
                    CapacityKg = 30.0,
                    CurrentActiveCapacityKg = 2.5,
                    IsAvailable = true,
                    CurrentLatitude = 9.0300,
                    CurrentLongitude = 38.7400,
                    TotalDeliveriesCompleted = 142,
                    Rating = 4.9,
                    NationalIdNumber = "ETH-9823145-AA",
                    PassportNumber = "EP-0982314",
                    FinFanNumber = "FIN-9823-1049-2810",
                    FaydaIdFrontUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
                    FaydaIdBackUrl = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
                    SelfieUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                    IdDocumentUrl = "id_docs/driver_1_kebele_id.pdf",
                    IsVerified = true,
                    VerificationStatus = "VERIFIED"
                }
            );

            modelBuilder.Entity<Order>().HasData(
                new Order
                {
                    Id = 1,
                    TrackingNumber = "ORD-1024",
                    CustomerId = 1,
                    DriverId = 1,
                    Status = OrderStatus.IN_TRANSIT,
                    PickupAddress = "Arba Minch Central",
                    PickupCity = "Arba Minch",
                    PickupLatitude = 6.0367,
                    PickupLongitude = 37.5500,
                    DropoffAddress = "Siga Meda, Addis Ababa",
                    DropoffCity = "Addis Ababa",
                    DropoffLatitude = 9.0200,
                    DropoffLongitude = 38.7500,
                    PackageWeightKg = 2.5,
                    PackageDescription = "Electronics & Documents Box",
                    ShippingFee = 450.00m,
                    EstimatedDeliveryTime = DateTime.UtcNow.AddHours(2),
                    CreatedAt = DateTime.UtcNow.AddHours(-3),
                    UpdatedAt = DateTime.UtcNow.AddMinutes(-30)
                },
                new Order
                {
                    Id = 2,
                    TrackingNumber = "ORD-1025",
                    CustomerId = 1,
                    DriverId = null,
                    Status = OrderStatus.PENDING,
                    PickupAddress = "Kazanchis, Addis Ababa",
                    PickupCity = "Addis Ababa",
                    PickupLatitude = 9.0180,
                    PickupLongitude = 38.7650,
                    DropoffAddress = "Sarbet, Addis Ababa",
                    DropoffCity = "Addis Ababa",
                    DropoffLatitude = 8.9950,
                    DropoffLongitude = 38.7300,
                    PackageWeightKg = 5.0,
                    PackageDescription = "Fresh Coffee Beans (10 Bags)",
                    ShippingFee = 200.00m,
                    EstimatedDeliveryTime = DateTime.UtcNow.AddHours(4),
                    CreatedAt = DateTime.UtcNow.AddMinutes(-45),
                    UpdatedAt = DateTime.UtcNow.AddMinutes(-45)
                }
            );

            modelBuilder.Entity<Payment>().HasData(
                new Payment { Id = 1, OrderId = 1, Amount = 450.00m, Method = PaymentMethod.Telebirr, Status = PaymentStatus.PAID, TransactionId = "TLB-98342112", CreatedAt = DateTime.UtcNow.AddHours(-3) },
                new Payment { Id = 2, OrderId = 2, Amount = 200.00m, Method = PaymentMethod.Cash, Status = PaymentStatus.PENDING, TransactionId = "CSH-PENDING", CreatedAt = DateTime.UtcNow.AddMinutes(-45) }
            );

            modelBuilder.Entity<OrderStatusHistory>().HasData(
                new OrderStatusHistory { Id = 1, OrderId = 1, Status = OrderStatus.CONFIRMED, Note = "Order confirmed by dispatcher", UpdatedByRole = "Dispatcher", Timestamp = DateTime.UtcNow.AddHours(-3) },
                new OrderStatusHistory { Id = 2, OrderId = 1, Status = OrderStatus.ASSIGNED, Note = "Assigned to driver Abebe Kebede", UpdatedByRole = "Dispatcher", Timestamp = DateTime.UtcNow.AddHours(-2) },
                new OrderStatusHistory { Id = 3, OrderId = 1, Status = OrderStatus.PICKED_UP, Note = "Package picked up at Arba Minch Central", UpdatedByRole = "Driver", Timestamp = DateTime.UtcNow.AddHours(-1) },
                new OrderStatusHistory { Id = 4, OrderId = 1, Status = OrderStatus.IN_TRANSIT, Note = "Driver is en route to Siga Meda, Addis Ababa", UpdatedByRole = "Driver", Timestamp = DateTime.UtcNow.AddMinutes(-30) }
            );
        }
    }
}
