import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

const getHubUrl = () => {
  if (import.meta.env.VITE_SIGNALR_HUB_URL) {
    return import.meta.env.VITE_SIGNALR_HUB_URL;
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    try {
      const apiUrl = new URL(import.meta.env.VITE_API_BASE_URL);
      const basePath = apiUrl.pathname.replace(/\/api\/?$/, '').replace(/\/$/, '');
      return `${apiUrl.origin}${basePath}/hubs/tracking`;
    } catch {
      // Fallbacks below handle malformed URLs.
    }
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/hubs/tracking`;
  }

  return 'http://localhost:5100/hubs/tracking';
};

export const getSignalRConnection = (): signalR.HubConnection => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(getHubUrl(), {
        accessTokenFactory: () => localStorage.getItem('delitrack_token') || '',
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
