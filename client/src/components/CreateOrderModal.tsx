import React, { useState } from 'react';
import { PaymentMethod } from '../types';
import { X, Package, MapPin, CreditCard, Scale } from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [pickupAddress, setPickupAddress] = useState('Arba Minch Central');
  const [pickupCity, setPickupCity] = useState('Arba Minch');
  const [dropoffAddress, setDropoffAddress] = useState('Siga Meda, Addis Ababa');
  const [dropoffCity, setDropoffCity] = useState('Addis Ababa');
  const [packageWeightKg, setPackageWeightKg] = useState(2.5);
  const [packageDescription, setPackageDescription] = useState('Electronics & Supplies');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Telebirr');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        pickupAddress,
        pickupCity,
        dropoffAddress,
        dropoffCity,
        packageWeightKg,
        packageDescription,
        paymentMethod,
        items: [{ itemName: packageDescription, quantity: 1, unitPrice: 150 }]
      });
      onClose();
    } catch (err) {
      console.error('Failed to create order', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Create New Delivery Order</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-200">
          {/* Pickup Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pickup Address & City</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Street / Landmark"
                className="col-span-2 bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                required
                value={pickupCity}
                onChange={(e) => setPickupCity(e.target.value)}
                placeholder="City"
                className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dropoff Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Dropoff (Destination) Address & City</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder="Recipient Address"
                className="col-span-2 bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                required
                value={dropoffCity}
                onChange={(e) => setDropoffCity(e.target.value)}
                placeholder="City"
                className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Weight & Description */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <Scale className="w-3.5 h-3.5 text-blue-400" />
                <span>Package Weight (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={packageWeightKg}
                onChange={(e) => setPackageWeightKg(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Payment Method</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Telebirr">Telebirr 📱</option>
                <option value="Cash">Cash on Delivery 💵</option>
                <option value="BankTransfer">Bank Transfer 🏦</option>
                <option value="Card">Debit / Credit Card 💳</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Package Contents / Notes</label>
            <textarea
              rows={2}
              value={packageDescription}
              onChange={(e) => setPackageDescription(e.target.value)}
              placeholder="e.g. Fragile electronics box, handle with care"
              className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Fee Summary */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
            <span className="text-slate-400">Estimated Shipping Fee:</span>
            <span className="text-emerald-400 font-bold text-sm">{(100 + packageWeightKg * 20).toFixed(2)} ETB</span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
