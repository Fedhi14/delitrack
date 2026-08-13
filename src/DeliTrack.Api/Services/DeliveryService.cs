using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using DeliTrack.Api.Data;
using DeliTrack.Api.DTOs;
using DeliTrack.Api.Hubs;
using DeliTrack.Api.Models;

namespace DeliTrack.Api.Services
{
    public interface IDeliveryService
    {
        Task<Order> CreateOrderAsync(int customerUserId, CreateOrderRequestDto dto);
        Task<List<Order>> GetOrdersAsync(UserRole role, int userId, OrderStatus? statusFilter = null);
        Task<Order?> GetOrderByTrackingNumberAsync(string trackingNumber);
        Task<Order> AssignDriverAsync(int orderId, int driverId, string assignedByRole);
        Task<Order> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus, string note, int currentUserId, UserRole currentRole);
        Task<Order> CancelOrderAsync(int orderId, int currentUserId, UserRole currentRole);
        Task UpdateDriverLocationAsync(int driverUserId, double lat, double lng, int? activeOrderId);
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<List<DriverProfile>> GetDriversAsync();
        Task ToggleDriverAvailabilityAsync(int driverUserId, bool isAvailable);
        Task<Order> ConfirmPaymentAsync(int orderId);
        Task<DriverProfile> VerifyDriverAsync(int driverId, bool approve);
        Task<DriverProfile> SubmitDriverKycAsync(int driverUserId, DriverKycRequestDto dto);
    }

    public class DeliveryService : IDeliveryService
    {
        private readonly DeliTrackDbContext _db;
        private readonly IHubContext<TrackingHub, ITrackingClient> _hubContext;

        public DeliveryService(DeliTrackDbContext db, IHubContext<TrackingHub, ITrackingClient> hubContext)
        {
            _db = db;
            _hubContext = hubContext;
        }

        public async Task<Order> CreateOrderAsync(int customerUserId, CreateOrderRequestDto dto)
        {
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == customerUserId);
            if (customer == null)
            {
                // Create profile if missing
                customer = new CustomerProfile { UserId = customerUserId, DefaultAddress = dto.PickupAddress, City = dto.PickupCity };
                _db.Customers.Add(customer);
                await _db.SaveChangesAsync();
            }

            var trackingNumber = $"ORD-{Random.Shared.Next(1000, 9999)}";
            while (await _db.Orders.AnyAsync(o => o.TrackingNumber == trackingNumber))
            {
                trackingNumber = $"ORD-{Random.Shared.Next(1000, 9999)}";
            }

            var shippingFee = 100 + (decimal)(dto.PackageWeightKg * 20.0);

            int? assignedDriverId = null;
            OrderStatus initialStatus = OrderStatus.PENDING;

            if (dto.PreferredDriverId.HasValue)
            {
                var prefDriver = await _db.Drivers.FirstOrDefaultAsync(d => d.Id == dto.PreferredDriverId.Value && d.IsVerified);
                if (prefDriver != null)
                {
                    assignedDriverId = prefDriver.Id;
                    initialStatus = OrderStatus.ASSIGNED;
                }
            }

            var order = new Order
            {
                TrackingNumber = trackingNumber,
                CustomerId = customer.Id,
                DriverId = assignedDriverId,
                Status = initialStatus,
                PickupAddress = dto.PickupAddress,
                PickupCity = dto.PickupCity,
                PickupLatitude = dto.PickupLatitude,
                PickupLongitude = dto.PickupLongitude,
                DropoffAddress = dto.DropoffAddress,
                DropoffCity = dto.DropoffCity,
                DropoffLatitude = dto.DropoffLatitude,
                DropoffLongitude = dto.DropoffLongitude,
                PackageWeightKg = dto.PackageWeightKg,
                PackageDescription = dto.PackageDescription,
                ShippingFee = shippingFee,
                EstimatedDeliveryTime = DateTime.UtcNow.AddHours(3),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (dto.Items != null && dto.Items.Any())
            {
                foreach (var item in dto.Items)
                {
                    order.Items.Add(new OrderItem
                    {
                        ItemName = item.ItemName,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice
                    });
                }
            }

            order.Payment = new Payment
            {
                Amount = shippingFee,
                Method = dto.PaymentMethod,
                Status = dto.PaymentMethod == PaymentMethod.Cash ? PaymentStatus.PENDING : PaymentStatus.PAID,
                TransactionId = dto.PaymentMethod == PaymentMethod.Cash ? "CSH-PENDING" : $"TXN-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
                CreatedAt = DateTime.UtcNow
            };

            order.StatusHistories.Add(new OrderStatusHistory
            {
                Status = OrderStatus.PENDING,
                Note = "Order created by customer",
                UpdatedByRole = "Customer",
                Timestamp = DateTime.UtcNow
            });

            if (assignedDriverId.HasValue)
            {
                order.StatusHistories.Add(new OrderStatusHistory
                {
                    Status = OrderStatus.ASSIGNED,
                    Note = "Directly assigned to customer's preferred verified driver",
                    UpdatedByRole = "Customer",
                    Timestamp = DateTime.UtcNow
                });
            }

            customer.TotalOrders++;

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            // Real-time Notification to Dispatchers and Admins
            await _hubContext.Clients.Group("Role_Dispatcher")
                .ReceiveNotification("New Order Received", $"Order #{order.TrackingNumber} created.", order.Id);
            await _hubContext.Clients.Group("Role_Admin")
                .ReceiveNotification("New Order Received", $"Order #{order.TrackingNumber} created.", order.Id);

            return order;
        }

        public async Task<List<Order>> GetOrdersAsync(UserRole role, int userId, OrderStatus? statusFilter = null)
        {
            IQueryable<Order> query = _db.Orders
                .Include(o => o.Customer).ThenInclude(c => c!.User)
                .Include(o => o.Driver).ThenInclude(d => d!.User)
                .Include(o => o.Payment)
                .Include(o => o.Items)
                .Include(o => o.StatusHistories);

            if (role == UserRole.Customer)
            {
                query = query.Where(o => o.Customer != null && o.Customer.UserId == userId);
            }
            else if (role == UserRole.Driver)
            {
                query = query.Where(o => o.Driver != null && o.Driver.UserId == userId);
            }

            if (statusFilter.HasValue)
            {
                query = query.Where(o => o.Status == statusFilter.Value);
            }

            return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        }

        public async Task<Order?> GetOrderByTrackingNumberAsync(string trackingNumber)
        {
            return await _db.Orders
                .Include(o => o.Customer).ThenInclude(c => c!.User)
                .Include(o => o.Driver).ThenInclude(d => d!.User)
                .Include(o => o.Payment)
                .Include(o => o.Items)
                .Include(o => o.StatusHistories.OrderBy(h => h.Timestamp))
                .Include(o => o.LocationLogs.OrderByDescending(l => l.RecordedAt).Take(10))
                .FirstOrDefaultAsync(o => o.TrackingNumber.ToUpper() == trackingNumber.ToUpper());
        }

        public async Task<Order> AssignDriverAsync(int orderId, int driverId, string assignedByRole)
        {
            var order = await _db.Orders.Include(o => o.Driver).FirstOrDefaultAsync(o => o.Id == orderId)
                ?? throw new InvalidOperationException($"Order #{orderId} not found.");

            var driver = await _db.Drivers.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == driverId)
                ?? throw new InvalidOperationException($"Driver #{driverId} not found.");

            // Business Rule 1: Capacity Check
            if (driver.CurrentActiveCapacityKg + order.PackageWeightKg > driver.CapacityKg)
            {
                throw new InvalidOperationException(
                    $"Cannot assign order. Driver's vehicle capacity limit ({driver.CapacityKg}kg) would be exceeded. Current active weight: {driver.CurrentActiveCapacityKg}kg, Order weight: {order.PackageWeightKg}kg."
                );
            }

            if (!driver.IsAvailable)
            {
                throw new InvalidOperationException("Selected driver is currently set as Unavailable.");
            }

            order.DriverId = driver.Id;
            order.Status = OrderStatus.ASSIGNED;
            order.UpdatedAt = DateTime.UtcNow;

            driver.CurrentActiveCapacityKg += order.PackageWeightKg;

            order.StatusHistories.Add(new OrderStatusHistory
            {
                Status = OrderStatus.ASSIGNED,
                Note = $"Assigned to driver {driver.User?.FullName ?? "Driver"} ({driver.VehicleType} - {driver.VehiclePlateNumber})",
                UpdatedByRole = assignedByRole,
                Timestamp = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();

            // Real-time updates
            await _hubContext.Clients.Group($"Order_{order.TrackingNumber}")
                .ReceiveOrderStatusUpdate(order.TrackingNumber, order.Status.ToString(), $"Assigned to driver {driver.User?.FullName}", DateTime.UtcNow);

            if (driver.User != null)
            {
                await _hubContext.Clients.User(driver.User.Id.ToString())
                    .ReceiveNotification("New Delivery Assigned", $"You have been assigned Order #{order.TrackingNumber}.", order.Id);
            }

            return order;
        }

        public async Task<Order> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus, string note, int currentUserId, UserRole currentRole)
        {
            var order = await _db.Orders
                .Include(o => o.Driver).ThenInclude(d => d!.User)
                .Include(o => o.Customer).ThenInclude(c => c!.User)
                .FirstOrDefaultAsync(o => o.Id == orderId)
                ?? throw new InvalidOperationException($"Order #{orderId} not found.");

            // Business Rule 3: Only assigned driver, ordering customer (for confirmation), or Dispatcher/Admin can update status
            if (currentRole == UserRole.Driver)
            {
                if (order.Driver == null || order.Driver.UserId != currentUserId)
                {
                    throw new UnauthorizedAccessException("Only the assigned driver can update this delivery status.");
                }
            }
            else if (currentRole == UserRole.Customer)
            {
                if (newStatus != OrderStatus.DELIVERED)
                {
                    throw new UnauthorizedAccessException("Customers can only confirm delivery receipt.");
                }
                if (order.Customer == null || order.Customer.UserId != currentUserId)
                {
                    throw new UnauthorizedAccessException("Only the customer who placed this order can confirm receipt.");
                }
            }

            // Business Rule 4: Workflow sequence validation
            ValidateStatusTransition(order.Status, newStatus, currentRole);

            var isFirstTimeDelivered = (newStatus == OrderStatus.DELIVERED && order.Status != OrderStatus.DELIVERED);

            order.Status = newStatus;
            order.UpdatedAt = DateTime.UtcNow;

            // Handle capacity and total completed counts on completion
            if (isFirstTimeDelivered || newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.FAILED || newStatus == OrderStatus.RETURNED)
            {
                if (order.Driver != null)
                {
                    order.Driver.CurrentActiveCapacityKg = Math.Max(0.0, order.Driver.CurrentActiveCapacityKg - order.PackageWeightKg);
                    if (isFirstTimeDelivered)
                    {
                        order.Driver.TotalDeliveriesCompleted++;
                    }
                }
            }

            var statusNote = string.IsNullOrWhiteSpace(note) ? GetDefaultStatusNote(newStatus) : note;
            order.StatusHistories.Add(new OrderStatusHistory
            {
                Status = newStatus,
                Note = statusNote,
                UpdatedByRole = currentRole.ToString(),
                Timestamp = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();

            // Real-time broadcast
            await _hubContext.Clients.Group($"Order_{order.TrackingNumber}")
                .ReceiveOrderStatusUpdate(order.TrackingNumber, newStatus.ToString(), statusNote, DateTime.UtcNow);

            if (order.Customer?.User != null)
            {
                await _hubContext.Clients.User(order.Customer.User.Id.ToString())
                    .ReceiveNotification($"Order Update: #{order.TrackingNumber}", $"Status changed to {newStatus}.", order.Id);
            }

            return order;
        }

        public async Task<Order> CancelOrderAsync(int orderId, int currentUserId, UserRole currentRole)
        {
            var order = await _db.Orders
                .Include(o => o.Driver)
                .FirstOrDefaultAsync(o => o.Id == orderId)
                ?? throw new InvalidOperationException($"Order #{orderId} not found.");

            // Business Rule 2: Completed / In-transit orders cannot be cancelled by Customer
            if (currentRole == UserRole.Customer)
            {
                if (order.Status == OrderStatus.PICKED_UP || order.Status == OrderStatus.IN_TRANSIT || order.Status == OrderStatus.DELIVERED)
                {
                    throw new InvalidOperationException($"Cannot cancel order in state '{order.Status}'. Packages picked up or in transit cannot be cancelled by customer.");
                }
            }

            if (order.Status == OrderStatus.DELIVERED || order.Status == OrderStatus.CANCELLED)
            {
                throw new InvalidOperationException($"Order is already {order.Status}.");
            }

            order.Status = OrderStatus.CANCELLED;
            order.UpdatedAt = DateTime.UtcNow;

            if (order.Driver != null)
            {
                order.Driver.CurrentActiveCapacityKg = Math.Max(0.0, order.Driver.CurrentActiveCapacityKg - order.PackageWeightKg);
            }

            order.StatusHistories.Add(new OrderStatusHistory
            {
                Status = OrderStatus.CANCELLED,
                Note = "Order cancelled",
                UpdatedByRole = currentRole.ToString(),
                Timestamp = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();

            await _hubContext.Clients.Group($"Order_{order.TrackingNumber}")
                .ReceiveOrderStatusUpdate(order.TrackingNumber, OrderStatus.CANCELLED.ToString(), "Order cancelled", DateTime.UtcNow);

            return order;
        }

        public async Task UpdateDriverLocationAsync(int driverUserId, double lat, double lng, int? activeOrderId)
        {
            var driver = await _db.Drivers.FirstOrDefaultAsync(d => d.UserId == driverUserId);
            if (driver != null)
            {
                driver.CurrentLatitude = lat;
                driver.CurrentLongitude = lng;
                driver.LastLocationUpdate = DateTime.UtcNow;

                if (activeOrderId.HasValue)
                {
                    var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == activeOrderId.Value);
                    if (order != null)
                    {
                        order.LocationLogs.Add(new DriverLocationLog
                        {
                            DriverId = driver.Id,
                            Latitude = lat,
                            Longitude = lng,
                            RecordedAt = DateTime.UtcNow
                        });

                        await _hubContext.Clients.Group($"Order_{order.TrackingNumber}")
                            .ReceiveDriverLocationUpdate(order.TrackingNumber, driver.Id, lat, lng, DateTime.UtcNow);
                    }
                }

                await _db.SaveChangesAsync();
            }
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var totalOrders = await _db.Orders.CountAsync();
            var pendingOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.PENDING || o.Status == OrderStatus.CONFIRMED);
            var inTransitOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.PICKED_UP || o.Status == OrderStatus.IN_TRANSIT);
            var deliveredOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.DELIVERED);
            var cancelledOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.CANCELLED);
            var paidAmounts = await _db.Payments.Where(p => p.Status == PaymentStatus.PAID).Select(p => p.Amount).ToListAsync();
            var totalRevenue = paidAmounts.Sum();

            var availableDrivers = await _db.Drivers.CountAsync(d => d.IsAvailable);
            var activeDrivers = await _db.Drivers.CountAsync(d => d.CurrentActiveCapacityKg > 0);

            return new DashboardStatsDto
            {
                TotalOrders = totalOrders,
                PendingOrders = pendingOrders,
                InTransitOrders = inTransitOrders,
                DeliveredOrders = deliveredOrders,
                CancelledOrders = cancelledOrders,
                TotalRevenue = totalRevenue,
                AvailableDrivers = availableDrivers,
                ActiveDrivers = activeDrivers,
                AverageDeliveryTimeMinutes = 45.0
            };
        }

        public async Task<List<DriverProfile>> GetDriversAsync()
        {
            return await _db.Drivers
                .Include(d => d.User)
                .OrderByDescending(d => d.IsAvailable)
                .ToListAsync();
        }

        public async Task ToggleDriverAvailabilityAsync(int driverUserId, bool isAvailable)
        {
            var driver = await _db.Drivers.FirstOrDefaultAsync(d => d.UserId == driverUserId);
            if (driver != null)
            {
                driver.IsAvailable = isAvailable;
                await _db.SaveChangesAsync();
            }
        }

        public async Task<Order> ConfirmPaymentAsync(int orderId)
        {
            var order = await _db.Orders.Include(o => o.Payment).FirstOrDefaultAsync(o => o.Id == orderId)
                ?? throw new InvalidOperationException($"Order #{orderId} not found.");

            if (order.Payment != null)
            {
                order.Payment.Status = PaymentStatus.PAID;
                order.Payment.TransactionId = $"CSH-CONFIRMED-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
                await _db.SaveChangesAsync();
            }

            return order;
        }

        public async Task<DriverProfile> VerifyDriverAsync(int driverId, bool approve)
        {
            var driver = await _db.Drivers.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == driverId)
                ?? throw new InvalidOperationException($"Driver #{driverId} not found.");

            driver.IsVerified = approve;
            driver.VerificationStatus = approve ? "VERIFIED" : "REJECTED";
            await _db.SaveChangesAsync();

            return driver;
        }

        public async Task<DriverProfile> SubmitDriverKycAsync(int driverUserId, DriverKycRequestDto dto)
        {
            var driver = await _db.Drivers.Include(d => d.User).FirstOrDefaultAsync(d => d.UserId == driverUserId)
                ?? throw new InvalidOperationException($"Driver profile for User #{driverUserId} not found.");

            driver.FinFanNumber = dto.FinFanNumber;
            driver.FaydaIdFrontUrl = dto.FaydaIdFrontUrl;
            driver.FaydaIdBackUrl = dto.FaydaIdBackUrl;
            driver.SelfieUrl = dto.SelfieUrl;
            driver.VerificationStatus = "PENDING_VERIFICATION";
            driver.IsVerified = false;

            await _db.SaveChangesAsync();
            return driver;
        }

        private static void ValidateStatusTransition(OrderStatus current, OrderStatus next, UserRole role)
        {
            // Business Rule 4: Sequential Status Transition Checks
            if (current == OrderStatus.DELIVERED)
            {
                // Allow Customer confirmation acknowledgment on an already delivered order
                if (next == OrderStatus.DELIVERED && role == UserRole.Customer)
                {
                    return;
                }
                throw new InvalidOperationException("Completed/Delivered orders cannot be altered.");
            }

            if (next == OrderStatus.DELIVERED)
            {
                if (current != OrderStatus.IN_TRANSIT && current != OrderStatus.PICKED_UP)
                {
                    throw new InvalidOperationException($"Cannot mark order as DELIVERED directly from state '{current}'. The order must be PICKED_UP and IN_TRANSIT first.");
                }
            }
        }

        private static string GetDefaultStatusNote(OrderStatus status) => status switch
        {
            OrderStatus.CONFIRMED => "Order confirmed by dispatcher",
            OrderStatus.ASSIGNED => "Driver assigned to package",
            OrderStatus.PICKED_UP => "Driver has picked up the package",
            OrderStatus.IN_TRANSIT => "Package is in transit to destination",
            OrderStatus.DELIVERED => "Package successfully delivered to customer",
            OrderStatus.CANCELLED => "Delivery order cancelled",
            OrderStatus.FAILED => "Delivery attempt failed",
            OrderStatus.RETURNED => "Package returned to hub",
            _ => "Status updated"
        };
    }
}
