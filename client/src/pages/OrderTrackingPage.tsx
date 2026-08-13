import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { fetchOrderByTracking } from '../services/api';
import { TrackingMap } from '../components/TrackingMap';
import { Package, Search, MapPin, Truck, CheckCircle2, Clock } from 'lucide-react';

interface OrderTrackingPageProps {
  trackingNumber: string;
  onBack: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ trackingNumber, onBack }) => {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrderByTracking(trackingNumber).then(setOrder);
  }, [trackingNumber]);

  if (!order) {
    return (
      <div className="p-12 text-center text-slate-400 animate-fadeIn">
        <Package className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
        <p className="text-base font-semibold">Loading tracking data for #{trackingNumber}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-white font-semibold flex items-center space-x-1">
          <span>← Back to Dashboard</span>
        </button>
        <span className="text-xs font-mono bg-slate-800 text-emerald-400 px-3 py-1 rounded-full border border-slate-700">
          Tracking #{order.trackingNumber}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Package Details</span>
            <h3 className="text-lg font-bold text-white mt-1">{order.packageDescription}</h3>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <p><strong className="text-slate-400">Weight:</strong> {order.packageWeightKg} kg</p>
            <p><strong className="text-slate-400">Shipping Fee:</strong> {order.shippingFee} ETB</p>
            <p><strong className="text-slate-400">Payment Status:</strong> {order.payment?.status} ({order.payment?.method})</p>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Status Audit History</h4>
            <div className="space-y-2 text-xs">
              {order.statusHistories.map((h, idx) => (
                <div key={idx} className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{h.status}</span>
                    <span className="text-[10px] text-slate-500">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{h.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <Truck className="w-4 h-4 text-blue-400" />
            <span>Live GPS Map Tracking</span>
          </h3>
          <TrackingMap
            pickupLat={order.pickupLatitude}
            pickupLng={order.pickupLongitude}
            pickupAddress={order.pickupAddress}
            dropoffLat={order.dropoffLatitude}
            dropoffLng={order.dropoffLongitude}
            dropoffAddress={order.dropoffAddress}
            driverLat={order.driver?.currentLatitude}
            driverLng={order.driver?.currentLongitude}
            driverName={order.driver?.user?.fullName}
            trackingNumber={order.trackingNumber}
          />
        </div>
      </div>
    </div>
  );
};
