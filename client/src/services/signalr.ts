import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export const getSignalRConnection = (): signalR.HubConnection => {
  if (!connection) {
    const token = localStorage.getItem('delitrack_token') || '';
    connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/tracking', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }
  return connection;
};

export const startSignalR = async () => {
  const conn = getSignalRConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    try {
      await conn.start();
      console.log('SignalR Connected Successfully to DeliTrack TrackingHub');
    } catch (err) {
      console.warn('SignalR Connection Error (Backend server might be offline):', err);
    }
  }
};
