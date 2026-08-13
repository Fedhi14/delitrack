import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { fetchOrders, createOrder, cancelOrder, updateOrderStatus } from '../services/api';
import { TrackingMap } from '../components/TrackingMap';
import { CreateOrderWizard } from '../components/CreateOrderWizard';
import { Package, MapPin, Clock, Truck, PlusCircle, CheckCircle2, Circle, AlertCircle, XCircle } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    const data = await fetchOrders();
    setOrders(data);
    const active = data.find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED') || data[0] || null;
    setActiveOrder(active);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrder = async (orderData: any) => {
    const newOrd = await createOrder(orderData);
    setNotification(`🎉 Order #${newOrd.trackingNumber} successfully created!`);
    await loadData();
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrder(orderId);
      setNotification(`Order cancelled successfully.`);
      await loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot cancel order in current state.');
    }
  };

  const calculateProgressPercent = (status: OrderStatus): number => {
    switch (status) {
      case 'PENDING': return 15;
      case 'CONFIRMED': return 35;
      case 'ASSIGNED': return 50;
      case 'PICKED_UP': return 65;
      case 'IN_TRANSIT': return 85;
      case 'DELIVERED': return 100;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Hello, Yad <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Track your active deliveries and manage order history.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Delivery Request</span>
        </button>
      </div>

      {/* Main Grid: Active Delivery & Interactive Live Map */}
      {activeOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Delivery Card */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Active Delivery</span>
                <span className="text-xs text-slate-400 font-mono font-bold">{activeOrder.trackingNumber}</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{activeOrder.packageDescription}</h4>
                    <span className="text-xs text-slate-400">Weight: {activeOrder.packageWeightKg} kg</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-slate-300 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">{activeOrder.pickupCity}</span>
                  <span className="text-slate-500">➔</span>
                  <span className="font-semibold text-white">{activeOrder.dropoffCity}</span>
                </div>

                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Status Progress</span>
                    <span className="text-emerald-400 font-bold">{calculateProgressPercent(activeOrder.status)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${calculateProgressPercent(activeOrder.status)}%` }}
                    />
                  </div>
                </div>

                {/* Driver Info */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Assigned Driver</span>
                      <span className="text-sm font-bold text-white">{activeOrder.driver?.user?.fullName || 'Assigning...'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Est. Delivery</span>
                    <span className="text-xs font-semibold text-emerald-400">Today, 5:30 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Stepper */}
            <div className="border-t border-slate-800 pt-4">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Order Timeline</h5>
              <div className="space-y-2 text-xs">
                {[
                  { status: 'PENDING', label: 'Order created' },
                  { status: 'CONFIRMED', label: 'Confirmed' },
                  { status: 'ASSIGNED', label: 'Driver assigned' },
                  { status: 'PICKED_UP', label: 'Picked up' },
                  { status: 'IN_TRANSIT', label: 'In transit' },
                  { status: 'DELIVERED', label: 'Delivered' }
                ].map((step, idx) => {
                  const isDone = calculateProgressPercent(activeOrder.status) >= calculateProgressPercent(step.status as OrderStatus);
                  const isCurrent = activeOrder.status === step.status;
                  return (
                    <div key={idx} className="flex items-center space-x-2.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Circle className="w-4 h-4 text-blue-400 animate-pulse fill-blue-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                      )}
                      <span className={isDone ? 'text-slate-200 font-medium' : isCurrent ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Customer Actions: Cancel or Confirm Delivery */}
              <div className="mt-4 space-y-2">
                {(() => {
                  const isDeliveredByDriver = activeOrder.status === 'DELIVERED' || activeOrder.statusHistories?.some(h => h.status === 'DELIVERED');
                  const isCustomerConfirmed = activeOrder.statusHistories?.some(h => h.updatedByRole === 'Customer' && h.note.toLowerCase().includes('received'));

                  if (isCustomerConfirmed) {
                    return (
                      <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Package Receipt Confirmed by Customer</span>
                      </div>
                    );
                  }

                  if (isDeliveredByDriver) {
                    return (
                      <button
                        onClick={async () => {
                          try {
                            await updateOrderStatus(activeOrder.id, 'DELIVERED', 'Confirmed received by customer');
                            setNotification('✅ Thank you! You have confirmed receipt of your order.');
                            await loadData();
                            setTimeout(() => setNotification(null), 5000);
                          } catch (err: any) {
                            alert(err.response?.data?.message || 'Could not confirm delivery.');
                          }
                        }}
                        className="w-full text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 animate-bounce"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Driver Delivered: Confirm Package Receipt ✅</span>
                      </button>
                    );
                  }

                  if (activeOrder.status === 'IN_TRANSIT' || activeOrder.status === 'PICKED_UP' || activeOrder.status === 'ASSIGNED') {
                    return (
                      <button
                        disabled
                        className="w-full text-xs bg-slate-800 text-slate-500 border border-slate-700 py-2.5 rounded-xl font-semibold opacity-60 cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Waiting for driver to deliver package...</span>
                      </button>
                    );
                  }

                  if (activeOrder.status === 'PENDING' || activeOrder.status === 'CONFIRMED') {
                    return (
                      <button
                        onClick={() => handleCancelOrder(activeOrder.id)}
                        className="w-full text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:bg-rose-500/10 py-2 rounded-xl transition font-semibold"
                      >
                        Cancel Order
                      </button>
                    );
                  }

                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Interactive OpenStreetMap Leaflet GPS Map */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Live Route GPS Map</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Arba Minch ➔ Addis Ababa</span>
            </div>
            <TrackingMap
              pickupLat={activeOrder.pickupLatitude}
              pickupLng={activeOrder.pickupLongitude}
              pickupAddress={activeOrder.pickupAddress}
              dropoffLat={activeOrder.dropoffLatitude}
              dropoffLng={activeOrder.dropoffLongitude}
              dropoffAddress={activeOrder.dropoffAddress}
              driverLat={activeOrder.driver?.currentLatitude}
              driverLng={activeOrder.driver?.currentLongitude}
              driverName={activeOrder.driver?.user?.fullName}
              trackingNumber={activeOrder.trackingNumber}
            />
          </div>
        </div>
      )}

      {/* Delivery History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Delivery History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Tracking #</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-white">{ord.trackingNumber}</td>
                  <td className="py-3 px-4">{ord.packageDescription} ({ord.packageWeightKg}kg)</td>
                  <td className="py-3 px-4 text-slate-400">{ord.pickupCity} ➔ {ord.dropoffCity}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-400">{ord.shippingFee} ETB</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      ord.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      ord.status === 'IN_TRANSIT' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      ord.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setActiveOrder(ord)}
                      className="text-xs text-blue-400 hover:underline font-semibold"
                    >
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modernized Order Creation Wizard */}
      <CreateOrderWizard
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
};
