using Microsoft.AspNetCore.SignalR;

namespace DeliTrack.Api.Hubs
{
    public interface ITrackingClient
    {
        Task ReceiveOrderStatusUpdate(string trackingNumber, string status, string note, DateTime timestamp);
        Task ReceiveDriverLocationUpdate(string trackingNumber, int driverId, double latitude, double longitude, DateTime timestamp);
        Task ReceiveNotification(string title, string message, int? orderId);
        Task ReceiveDashboardMetricsUpdate(object metrics);
    }

    public class TrackingHub : Hub<ITrackingClient>
    {
        public async Task JoinOrderTrackingGroup(string trackingNumber)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{trackingNumber}");
        }

        public async Task LeaveOrderTrackingGroup(string trackingNumber)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Order_{trackingNumber}");
        }

        public async Task JoinRoleGroup(string role)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Role_{role}");
        }

        public async Task UpdateDriverLocation(string trackingNumber, int driverId, double latitude, double longitude)
        {
            var timestamp = DateTime.UtcNow;
            await Clients.Group($"Order_{trackingNumber}")
                .ReceiveDriverLocationUpdate(trackingNumber, driverId, latitude, longitude, timestamp);
            
            // Also notify dispatchers & admins
            await Clients.Group("Role_Dispatcher")
                .ReceiveDriverLocationUpdate(trackingNumber, driverId, latitude, longitude, timestamp);
            await Clients.Group("Role_Admin")
                .ReceiveDriverLocationUpdate(trackingNumber, driverId, latitude, longitude, timestamp);
        }
    }
}
