import axios from 'axios';
import { Order, OrderStatus, DriverProfile, DashboardStats } from '../types';

const PRODUCTION_API = 'https://delitrack-app.onrender.com/api';
const LOCAL_API = 'http://localhost:5000/api';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? LOCAL_API
  : PRODUCTION_API;


const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('delitrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials: any) => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

export const register = async (userData: any) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

export const fetchOrders = async (status?: OrderStatus): Promise<Order[]> => {
  const res = await api.get<Order[]>('/orders', { params: { status } });
  return res.data;
};

export const fetchOrderByTracking = async (trackingNumber: string): Promise<Order> => {
  const res = await api.get<Order>(`/orders/track/${trackingNumber}`);
  return res.data;
};

export const createOrder = async (orderData: any): Promise<Order> => {
  const res = await api.post<Order>('/orders', orderData);
  return res.data;
};

export const assignDriver = async (orderId: number, driverId: number): Promise<Order> => {
  const res = await api.post<Order>(`/orders/${orderId}/assign`, { driverId });
  return res.data;
};

export const updateOrderStatus = async (orderId: number, newStatus: OrderStatus, note: string): Promise<Order> => {
  const res = await api.put<Order>(`/orders/${orderId}/status`, { newStatus, note });
  return res.data;
};

export const cancelOrder = async (orderId: number): Promise<Order> => {
  const res = await api.post<Order>(`/orders/${orderId}/cancel`);
  return res.data;
};

export const confirmPayment = async (orderId: number): Promise<Order> => {
  const res = await api.post<Order>(`/orders/${orderId}/payment/confirm`);
  return res.data;
};

export const fetchDrivers = async (): Promise<DriverProfile[]> => {
  const res = await api.get<DriverProfile[]>('/drivers');
  return res.data;
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get<DashboardStats>('/admin/stats');
  return res.data;
};

export const verifyDriver = async (driverId: number, approve: boolean = true) => {
  const res = await api.post(`/admin/drivers/${driverId}/verify?approve=${approve}`);
  return res.data;
};

export const submitDriverKyc = async (kycData: {
  finFanNumber: string;
  faydaIdFrontUrl?: string;
  faydaIdBackUrl?: string;
  selfieUrl?: string;
}) => {
  const res = await api.post('/drivers/kyc', kycData);
  return res.data;
};
