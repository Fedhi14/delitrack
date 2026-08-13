import React, { useState, useEffect } from 'react';
import { Order, DriverProfile } from '../types';
import { fetchOrders, fetchDrivers, assignDriver, confirmPayment, verifyDriver } from '../services/api';
import { AuditTimeline } from '../components/AuditTimeline';
import { ClipboardList, Truck, CheckCircle2, AlertTriangle, Clock, DollarSign, ShieldCheck, UserCheck, Check } from 'lucide-react';

export const DispatcherDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [auditOrder, setAuditOrder] = useState<Order | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const ords = await fetchOrders();
      const drvs = await fetchDrivers();
      setOrders(ords);
      setDrivers(drvs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [kycDriver, setKycDriver] = useState<DriverProfile | null>(null);

  const handleVerifyDriver = async (driverId: number, approve: boolean) => {
    try {
      await verifyDriver(driverId, approve);
      setNotification(`Driver #${driverId} verification status updated to ${approve ? 'VERIFIED' : 'REJECTED'}!`);
      setKycDriver(null);
      await loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update driver verification status.');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedDriverId) return;

    setErrorMessage(null);
    try {
      const updated = await assignDriver(selectedOrder.id, selectedDriverId);
      setNotification(`🎉 Driver successfully assigned to Order #${updated.trackingNumber}!`);
      setSelectedOrder(null);
      setSelectedDriverId(null);
      await loadData();
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to assign driver.');
    }
  };

  const handleConfirmPayment = async (orderId: number) => {
    try {
      await confirmPayment(orderId);
      setNotification(`Payment confirmed for Order #${orderId}`);
      await loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm payment.');
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

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <ClipboardList className="w-6 h-6 text-amber-400" />
            <span>Dispatcher Operations Center</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Manage incoming order assignments, monitor fleet capacity, and reassign deliveries.</p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold text-slate-300">
          <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            Pending Orders: <span className="text-amber-400 font-bold">{orders.filter(o => o.status === 'PENDING').length}</span>
          </div>
          <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            Available Drivers: <span className="text-emerald-400 font-bold">{drivers.filter(d => d.isAvailable).length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders Table & Driver Fleet Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incoming & Active Orders */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">All Orders & Operations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 uppercase text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Tracking #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Weight</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Assigned Driver</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      <button onClick={() => setAuditOrder(ord)} className="hover:underline text-blue-400">
                        {ord.trackingNumber}
                      </button>
                    </td>
                    <td className="py-3 px-3">{ord.customer?.user?.fullName || 'Customer'}</td>
                    <td className="py-3 px-3 text-blue-400 font-semibold">{ord.packageWeightKg} kg</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ord.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        ord.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        ord.status === 'IN_TRANSIT' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {ord.payment?.status === 'PAID' ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">PAID</span>
                      ) : (
                        <button
                          onClick={() => handleConfirmPayment(ord.id)}
                          className="text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2 py-0.5 rounded-full font-bold transition"
                        >
                          Confirm Cash
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {ord.driver?.user?.fullName || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-3 space-x-1">
                      <button
                        onClick={() => { setSelectedOrder(ord); setErrorMessage(null); }}
                        className="text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold transition"
                      >
                        {ord.driverId ? 'Reassign' : 'Assign'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Driver Availability & Capacity Panel */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Fleet Drivers ({drivers.length})</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </h3>

          <div className="space-y-3">
            {drivers.map(drv => (
              <div key={drv.id} className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white">{drv.fullName || drv.user?.fullName}</span>
                    {drv.isVerified ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> Pending ID
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    drv.isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {drv.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex justify-between items-center">
                  <span>Vehicle: {drv.vehicleType} ({drv.vehiclePlateNumber || 'N/A'})</span>
                  {drv.finFanNumber && (
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">FIN: {drv.finFanNumber}</span>
                  )}
                </div>

                <button
                  onClick={() => setKycDriver(drv)}
                  className={`w-full text-xs font-bold py-1.5 rounded-lg transition flex items-center justify-center space-x-1 border ${
                    !drv.isVerified
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{drv.isVerified ? 'Inspect Verified Fayda KYC 🆔' : 'Review & Verify Fayda KYC 🆔'}</span>
                </button>

                {/* Capacity Bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Active Weight Capacity</span>
                    <span className="text-emerald-400 font-bold">{drv.currentActiveCapacityKg} / {drv.capacityKg} kg</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (drv.currentActiveCapacityKg / drv.capacityKg) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Driver Assignment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Assign Driver to #{selectedOrder.trackingNumber}</h3>
            <p className="text-xs text-slate-400">Package Weight: <span className="text-emerald-400 font-bold">{selectedOrder.packageWeightKg} kg</span></p>

            {errorMessage && (
              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Driver</label>
                <select
                  required
                  value={selectedDriverId || ''}
                  onChange={(e) => setSelectedDriverId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Choose Available Driver --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id} disabled={!d.isAvailable}>
                      {d.user?.fullName} ({d.vehicleType}) - Cap: {d.currentActiveCapacityKg}/{d.capacityKg}kg {!d.isAvailable ? '(Unavailable)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-lg"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Timeline Modal */}
      {auditOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Audit Logs: #{auditOrder.trackingNumber}</h3>
              <button onClick={() => setAuditOrder(null)} className="text-slate-400 hover:text-white font-bold text-sm">
                ✕
              </button>
            </div>

            {auditOrder.statusHistories && <AuditTimeline histories={auditOrder.statusHistories} />}
          </div>
        </div>
      )}

      {/* Driver Fayda KYC Review Modal */}
      {kycDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Driver Fayda KYC Verification</h3>
                  <span className="text-xs text-slate-400">Review Identification documents & live selfie photo</span>
                </div>
              </div>
              <button onClick={() => setKycDriver(null)} className="text-slate-400 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            {/* Driver Details Summary */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Driver Name</span>
                <span className="text-white font-bold">{kycDriver.fullName || kycDriver.user?.fullName || 'Driver'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Phone Number</span>
                <span className="text-white font-mono">{kycDriver.phoneNumber || kycDriver.user?.phoneNumber || '+251911000000'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">FIN / FAN Number</span>
                <span className="text-emerald-400 font-mono font-bold">{kycDriver.finFanNumber || 'FIN-9823-1049-2810'}</span>
              </div>
            </div>

            {/* Document Photos Grid */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Verification Documents & Live Selfie</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Fayda Front */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-white block">1. Fayda ID Front Photo</span>
                  <div className="h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <img
                      src={kycDriver.faydaIdFrontUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'}
                      alt="Fayda Front"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Fayda Back */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-white block">2. Fayda ID Back Photo</span>
                  <div className="h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <img
                      src={kycDriver.faydaIdBackUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80'}
                      alt="Fayda Back"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Live Selfie */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-white block">3. Live Verification Selfie</span>
                  <div className="h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <img
                      src={kycDriver.selfieUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                      alt="Live Selfie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleVerifyDriver(kycDriver.id, false)}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold py-3 rounded-xl border border-rose-500/40 transition text-xs"
              >
                Reject KYC Verification ❌
              </button>

              <button
                type="button"
                onClick={() => handleVerifyDriver(kycDriver.id, true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition text-xs"
              >
                Approve Driver KYC ✅
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
