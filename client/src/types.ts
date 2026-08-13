export type UserRole = 'Customer' | 'Driver' | 'Dispatcher' | 'Admin';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED'
  | 'RETURNED';

export type PaymentMethod = 'Cash' | 'BankTransfer' | 'Telebirr' | 'Card';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: string;
}

export interface CustomerProfile {
  id: number;
  userId: number;
  user?: User;
  defaultAddress: string;
  city: string;
  totalOrders: number;
}

export interface DriverProfile {
  id: number;
  userId: number;
  user?: User;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  vehicleType: string;
  vehiclePlateNumber: string;
  capacityKg: number;
  currentActiveCapacityKg: number;
  isAvailable: boolean;
  currentLatitude: number;
  currentLongitude: number;
  lastLocationUpdate: string;
  totalDeliveriesCompleted: number;
  rating: number;
  nationalIdNumber?: string;
  passportNumber?: string;
  finFanNumber?: string;
  faydaIdFrontUrl?: string;
  faydaIdBackUrl?: string;
  selfieUrl?: string;
  isVerified?: boolean;
  verificationStatus?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: OrderStatus;
  note: string;
  updatedByRole: string;
  timestamp: string;
}

export interface DriverLocationLog {
  id: number;
  orderId: number;
  driverId: number;
  latitude: number;
  longitude: number;
  recordedAt: string;
}

export interface Order {
  id: number;
  trackingNumber: string;
  customerId: number;
  customer?: CustomerProfile;
  driverId?: number;
  driver?: DriverProfile;
  status: OrderStatus;
  pickupAddress: string;
  pickupCity: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  packageWeightKg: number;
  packageDescription: string;
  shippingFee: number;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment?: Payment;
  statusHistories: OrderStatusHistory[];
  locationLogs?: DriverLocationLog[];
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  availableDrivers: number;
  activeDrivers: number;
  averageDeliveryTimeMinutes: number;
}
