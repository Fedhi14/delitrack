import React, { useState, useEffect } from 'react';
import { DashboardStats, Order } from '../types';
import { fetchDashboardStats, fetchOrders } from '../services/api';
import { ShieldCheck, Package, TrendingUp, Users, DollarSign, Clock, Truck, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchDashboardStats().then(setStats);
    fetchOrders().then(setRecentOrders);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <span>Admin Executive Dashboard</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Platform analytics, revenue monitoring, driver performance, and audit reports.</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
          <span className="text-xs font-semibold text-emerald-400">System Healthy & Operational</span>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Orders</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white block">{stats.totalOrders.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-400 font-semibold">↑ +12.4% from last month</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-white block">{stats.totalRevenue.toLocaleString()} ETB</span>
            <span className="text-[11px] text-emerald-400 font-semibold">↑ +18.2% gross revenue</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>In Transit</span>
              <Truck className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white block">{stats.inTransitOrders}</span>
            <span className="text-[11px] text-slate-400 font-medium">Active fleet deliveries</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Avg Delivery Time</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-white block">{stats.averageDeliveryTimeMinutes} mins</span>
            <span className="text-[11px] text-emerald-400 font-semibold">↓ -4.2 mins efficiency</span>
          </div>
        </div>
      )}

      {/* Orders Breakdown Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Orders', count: stats?.totalOrders || 1245, color: 'text-white bg-slate-800' },
          { label: 'Pending', count: stats?.pendingOrders || 42, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
          { label: 'In Transit', count: stats?.inTransitOrders || 18, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
          { label: 'Delivered', count: stats?.deliveredOrders || 1102, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
          { label: 'Cancelled', count: stats?.cancelledOrders || 83, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
        ].map((item, idx) => (
          <div key={idx} className={`p-4 rounded-xl border border-slate-800 ${item.color} flex flex-col justify-between`}>
            <span className="text-xs font-medium text-slate-400">{item.label}</span>
            <span className="text-xl font-bold mt-2">{item.count}</span>
          </div>
        ))}
      </div>

      {/* Recent Orders & System Activity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <span>Platform Delivery Activity</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Tracking #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentOrders.map(ord => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-white">{ord.trackingNumber}</td>
                  <td className="py-3 px-4">{ord.customer?.user?.fullName || 'Yad'}</td>
                  <td className="py-3 px-4">{ord.driver?.user?.fullName || 'Unassigned'}</td>
                  <td className="py-3 px-4 text-slate-400">{ord.pickupCity} ➔ {ord.dropoffCity}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{ord.shippingFee} ETB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
