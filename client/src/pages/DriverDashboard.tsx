import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { fetchOrders, updateOrderStatus, confirmPayment } from '../services/api';
import { AuditTimeline } from '../components/AuditTimeline';
import { WithdrawalModal } from '../components/WithdrawalModal';
import { DriverKycModal } from '../components/DriverKycModal';
import { Truck, MapPin, Package, CheckCircle2, Navigation, AlertCircle, User, DollarSign, Award, Clock, Landmark, ArrowUpRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface WithdrawalRecord {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  reference: string;
  date: string;
}

export const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isGpsSimulating, setIsGpsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'deliveries' | 'earnings'>('deliveries');
  
  // Modals state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchOrders();
      setDeliveries(data);
      const active = data.find(o => o.status === 'ASSIGNED' || o.status === 'PICKED_UP' || o.status === 'IN_TRANSIT') || data[0] || null;
      setActiveDelivery(active);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (newStatus: OrderStatus, note: string) => {
    if (!activeDelivery) return;
    try {
      const updated = await updateOrderStatus(activeDelivery.id, newStatus, note);
      setActiveDelivery(updated);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot transition status.');
    }
  };

  const handleConfirmPayment = async (orderId: number) => {
    try {
      await confirmPayment(orderId);
      setNotification('Cash payment confirmed successfully!');
      await loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm payment.');
    }
  };

  const handleWithdrawSuccess = (withdrawal: WithdrawalRecord) => {
    setWithdrawals([withdrawal, ...withdrawals]);
    setNotification(`🎉 Payout request for ${withdrawal.amount} ETB to ${withdrawal.bankName} submitted! Ref: ${withdrawal.reference}`);
    setTimeout(() => setNotification(null), 6000);
  };

  const completedDeliveries = deliveries.filter(d => d.status === 'DELIVERED');
  const grossEarnings = completedDeliveries.reduce((sum, d) => sum + (d.shippingFee * 0.8), 0); // 80% payout commission
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const availableBalance = Math.max(0, grossEarnings - totalWithdrawn);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Unverified Account Warning Banner */}
      {!user?.isVerified && (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Account Unverified — Fayda KYC Required</h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Submit your Fayda National ID (FIN/FAN) & Live Selfie to verify your account and start receiving customer orders!
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5 flex-shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Your Account 🛡️</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 p-6 rounded-2xl border border-blue-900/50 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center font-bold text-xl shadow-inner">
            🚗
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">Driver Console</h1>
              {user?.isVerified ? (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED DRIVER ✅
                </span>
              ) : (
                <button
                  onClick={() => setIsKycModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition shadow"
                >
                  <Clock className="w-3 h-3" /> Verify Your Account 🛡️
                </button>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Assigned deliveries: <span className="text-emerald-400 font-bold">{deliveries.length}</span> | Vehicle: Motorcycle (AA-3-98234)
            </p>
          </div>
        </div>

        {/* Tab Navigation & Status */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'deliveries' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Deliveries
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'earnings' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Earnings & Withdraw
            </button>
          </div>

          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              isAvailable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
            <span>{isAvailable ? 'Available' : 'Busy'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'earnings' ? (
        <div className="space-y-6">
          {/* Earnings Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 uppercase font-semibold">Available Balance</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-emerald-400">{availableBalance.toFixed(2)} ETB</h3>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={availableBalance <= 0}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Withdraw to Bank 🏦</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold block">Total Withdrawn</span>
              <h3 className="text-2xl font-bold text-white">{totalWithdrawn.toFixed(2)} ETB</h3>
              <span className="text-[10px] text-slate-500">{withdrawals.length} Payout Requests</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold block">Completed Trips</span>
              <h3 className="text-2xl font-bold text-white">{completedDeliveries.length}</h3>
              <span className="text-[10px] text-slate-500">Gross: {grossEarnings.toFixed(2)} ETB</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold block">Driver Score</span>
              <h3 className="text-2xl font-bold text-amber-400">4.9 ★</h3>
              <span className="text-[10px] text-slate-500">Top Rated Courier</span>
            </div>
          </div>

          {/* Payout History Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Landmark className="w-5 h-5 text-emerald-400" />
              <span>Bank Payout & Withdrawal History</span>
            </h3>

            {withdrawals.length === 0 ? (
              <p className="text-xs text-slate-500">No bank withdrawal payouts requested yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 uppercase text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Reference #</th>
                      <th className="py-3 px-4">Destination Bank / Wallet</th>
                      <th className="py-3 px-4">Account Number</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {withdrawals.map(w => (
                      <tr key={w.id}>
                        <td className="py-3 px-4 font-mono font-bold text-white">{w.reference}</td>
                        <td className="py-3 px-4 font-semibold text-slate-200">{w.bankName}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{w.accountNumber}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{w.amount.toFixed(2)} ETB</td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(w.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            PROCESSING / PAID
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">Completed Deliveries Breakdown</h3>
            {completedDeliveries.length === 0 ? (
              <p className="text-xs text-slate-500">No completed trips recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 uppercase text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Tracking #</th>
                      <th className="py-3 px-4">Route</th>
                      <th className="py-3 px-4">Package</th>
                      <th className="py-3 px-4">Payout (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {completedDeliveries.map(d => (
                      <tr key={d.id}>
                        <td className="py-3 px-4 font-mono font-bold text-white">{d.trackingNumber}</td>
                        <td className="py-3 px-4">{d.pickupCity} ➔ {d.dropoffCity}</td>
                        <td className="py-3 px-4">{d.packageDescription}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{(d.shippingFee * 0.8).toFixed(2)} ETB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Main Deliveries View */
        activeDelivery && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">Active Delivery Job</span>
                  <h3 className="text-lg font-bold text-white mt-1">{activeDelivery.trackingNumber}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {activeDelivery.status}
                </span>
              </div>

              {/* Package & Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2">
                  <span className="text-xs text-slate-400 uppercase font-semibold block">Customer Details</span>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">{activeDelivery.customer?.user?.fullName || 'Customer'}</span>
                  </div>
                  <p className="text-xs text-slate-400">Phone: {activeDelivery.customer?.user?.phoneNumber || '+251911000000'}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2">
                  <span className="text-xs text-slate-400 uppercase font-semibold block">Payment & Fee</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{activeDelivery.shippingFee} ETB</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeDelivery.payment?.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {activeDelivery.payment?.method} ({activeDelivery.payment?.status || 'PENDING'})
                    </span>
                  </div>
                  {activeDelivery.payment?.status !== 'PAID' && (
                    <button
                      onClick={() => handleConfirmPayment(activeDelivery.id)}
                      className="w-full mt-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 rounded-lg transition"
                    >
                      Collect Cash Payment 💵
                    </button>
                  )}
                </div>
              </div>

              {/* Workflow Step Buttons */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Delivery Actions Workflow</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    disabled={activeDelivery.status !== 'ASSIGNED'}
                    onClick={() => handleStatusChange('PICKED_UP', 'Package picked up at origin')}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition border ${
                      activeDelivery.status === 'ASSIGNED'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-400 shadow-lg'
                        : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    1. Picked Up 📦
                  </button>

                  <button
                    disabled={activeDelivery.status !== 'PICKED_UP'}
                    onClick={() => handleStatusChange('IN_TRANSIT', 'En route to customer destination')}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition border ${
                      activeDelivery.status === 'PICKED_UP'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-400 shadow-lg'
                        : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    2. Start Delivery 🚚
                  </button>

                  <button
                    disabled={activeDelivery.status !== 'IN_TRANSIT'}
                    onClick={() => handleStatusChange('IN_TRANSIT', 'Arrived at dropoff address')}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition border ${
                      activeDelivery.status === 'IN_TRANSIT'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-400 shadow-lg'
                        : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    3. Arrived 📍
                  </button>

                  <button
                    disabled={activeDelivery.status !== 'IN_TRANSIT'}
                    onClick={() => handleStatusChange('DELIVERED', 'Package successfully handed over to customer')}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition border ${
                      activeDelivery.status === 'IN_TRANSIT'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 shadow-lg'
                        : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    4. Delivered ✅
                  </button>
                </div>
              </div>

              {/* Audit Timeline */}
              {activeDelivery.statusHistories && (
                <div className="border-t border-slate-800 pt-4">
                  <AuditTimeline histories={activeDelivery.statusHistories} />
                </div>
              )}
            </div>

            {/* Sidebar Jobs */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Assigned Orders ({deliveries.length})</h3>
              <div className="space-y-3">
                {deliveries.map(ord => (
                  <div
                    key={ord.id}
                    onClick={() => setActiveDelivery(ord)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      activeDelivery?.id === ord.id
                        ? 'bg-slate-800 border-blue-500/50 shadow-md'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono font-bold text-xs text-white">{ord.trackingNumber}</span>
                      <span className="text-[10px] font-bold text-emerald-400">{ord.status}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">{ord.packageDescription}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* Withdrawal Modal Dialog */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={availableBalance}
        onWithdrawSuccess={handleWithdrawSuccess}
      />

      {/* Driver Fayda KYC Modal */}
      <DriverKycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        onKycSubmitted={() => {
          setNotification('🎉 Your Fayda ID & Selfie verification documents have been submitted to Admin for approval!');
          setTimeout(() => setNotification(null), 5000);
        }}
      />
    </div>
  );
};
