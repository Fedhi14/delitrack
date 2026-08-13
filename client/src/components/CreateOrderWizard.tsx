import React, { useState, useEffect } from 'react';
import { MapLocationPicker } from './MapLocationPicker';
import { ShoppingBag, MapPin, Truck, CreditCard, Plus, Trash2, ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { PaymentMethod, DriverProfile } from '../types';
import { fetchDrivers } from '../services/api';

interface CreateOrderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => Promise<void>;
}

interface ItemInput {
  itemName: string;
  quantity: number;
  unitPrice: number;
}

const LANDMARK_PRESETS = [
  { name: 'Merkato Commercial Market', city: 'Addis Ababa', lat: 9.0333, lng: 38.7400 },
  { name: 'Bole Medhanialem Mall Hub', city: 'Addis Ababa', lat: 8.9970, lng: 38.7880 },
  { name: 'Kazanchis Commercial Hub', city: 'Addis Ababa', lat: 9.0180, lng: 38.7650 },
  { name: 'Piassa Historical Center', city: 'Addis Ababa', lat: 9.0350, lng: 38.7520 },
  { name: 'Sarbet Area & Mall', city: 'Addis Ababa', lat: 8.9950, lng: 38.7300 },
  { name: 'Megenagna Station Hub', city: 'Addis Ababa', lat: 9.0200, lng: 38.8020 },
  { name: 'Hawassa Central Market', city: 'Hawassa', lat: 7.0621, lng: 38.4767 },
  { name: 'Bishoftu Hub', city: 'Bishoftu', lat: 8.7523, lng: 38.9785 },
  { name: 'Arba Minch Central', city: 'Arba Minch', lat: 6.0367, lng: 37.5500 },
];

export const CreateOrderWizard: React.FC<CreateOrderWizardProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState<DriverProfile[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

  // Form State
  const [category, setCategory] = useState('Store Shopping');
  const [items, setItems] = useState<ItemInput[]>([
    { itemName: 'Yirgacheffe Coffee Beans (1kg)', quantity: 2, unitPrice: 450 },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(100);

  // Locations State
  const [pickupAddress, setPickupAddress] = useState('Merkato Commercial Market, Addis Ababa');
  const [pickupCity, setPickupCity] = useState('Addis Ababa');
  const [pickupLat, setPickupLat] = useState(9.0333);
  const [pickupLng, setPickupLng] = useState(38.7400);

  const [dropoffAddress, setDropoffAddress] = useState('Bole Medhanialem, Addis Ababa');
  const [dropoffCity, setDropoffCity] = useState('Addis Ababa');
  const [dropoffLat, setDropoffLat] = useState(8.9970);
  const [dropoffLng, setDropoffLng] = useState(38.7880);

  // Package & Delivery
  const [packageWeightKg, setPackageWeightKg] = useState(3.5);
  const [packageDescription, setPackageDescription] = useState('Grocery & Coffee Shopping');
  const [urgency, setUrgency] = useState<'Standard' | 'Express'>('Standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Telebirr');

  useEffect(() => {
    fetchDrivers()
      .then(data => setAvailableDrivers(data))
      .catch(err => console.error(err));
  }, []);

  if (!isOpen) return null;

  // Add Item
  const handleAddItem = () => {
    if (newItemName.trim()) {
      setItems([...items, { itemName: newItemName.trim(), quantity: newItemQty, unitPrice: newItemPrice }]);
      setNewItemName('');
      setNewItemQty(1);
      setNewItemPrice(100);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Distance Calculation (Haversine Formula)
  const calculateDistanceKm = () => {
    const R = 6371; // Earth radius in km
    const dLat = ((dropoffLat - pickupLat) * Math.PI) / 180;
    const dLng = ((dropoffLng - pickupLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pickupLat * Math.PI) / 180) *
        Math.cos((dropoffLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(1, R * c);
  };

  const distanceKm = calculateDistanceKm();
  const itemsTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const baseShippingFee = 100 + distanceKm * 15 + packageWeightKg * 20;
  const shippingFee = urgency === 'Express' ? baseShippingFee * 1.4 : baseShippingFee;
  const grandTotal = itemsTotal + shippingFee;

  const recommendedVehicle = packageWeightKg > 30 ? 'Delivery Van (Heavy)' : 'Motorcycle (Fast & Agil)';

  const handleSubmitFinal = async () => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        pickupAddress,
        pickupCity,
        pickupLatitude: pickupLat,
        pickupLongitude: pickupLng,
        dropoffAddress,
        dropoffCity,
        dropoffLatitude: dropoffLat,
        dropoffLongitude: dropoffLng,
        packageWeightKg,
        packageDescription: packageDescription || `${category}: ${items.map(i => i.itemName).join(', ')}`,
        paymentMethod,
        preferredDriverId: selectedDriverId,
        items,
      };

      await onSubmit(orderPayload);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error submitting delivery request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-fadeIn">
        {/* Header & Stepper */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Modern Delivery Request
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Step {step} of 4: {step === 1 && 'What to Buy & Transport'}
              {step === 2 && 'Pickup & Dropoff Locations'}
              {step === 3 && 'Weight & Vehicle Selection'}
              {step === 4 && 'Payment & Final Review'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: CATEGORY & ITEMS */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Order Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Store Shopping', icon: '🛍️' },
                  { name: 'Coffee & Produce', icon: '☕' },
                  { name: 'Parcel / Documents', icon: '📦' },
                  { name: 'Pharmacy & Medical', icon: '💊' },
                ].map(cat => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      setPackageDescription(`${cat.name} Request`);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                      category === cat.name
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shopping List Builder */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Shopping List / Items breakdown
              </label>

              <div className="grid grid-cols-12 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <input
                  type="text"
                  placeholder="Item name (e.g. Fresh Coffee 1kg)"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="col-span-6 bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={newItemQty}
                  onChange={e => setNewItemQty(Number(e.target.value))}
                  className="col-span-2 bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-2 text-white focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="ETB"
                  value={newItemPrice}
                  onChange={e => setNewItemPrice(Number(e.target.value))}
                  className="col-span-3 bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-2 text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="col-span-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Added Items Table */}
              {items.length > 0 && (
                <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">{item.itemName}</span>
                        <span className="text-slate-400">Quantity: {item.quantity} × {item.unitPrice} ETB</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-emerald-400">{item.quantity * item.unitPrice} ETB</span>
                        <button onClick={() => handleRemoveItem(idx)} className="text-rose-400 hover:text-rose-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-900/80 flex justify-between items-center text-xs font-bold text-white">
                    <span>Estimated Items Value</span>
                    <span className="text-emerald-400">{itemsTotal} ETB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: PICKUP & DROPOFF LOCATIONS */}
        {step === 2 && (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
            {/* Presets Quick Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick Landmark Presets (Ethiopian Hubs)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANDMARK_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setPickupAddress(`${preset.name}, ${preset.city}`);
                      setPickupCity(preset.city);
                      setPickupLat(preset.lat);
                      setPickupLng(preset.lng);
                    }}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
                  >
                    <span className="text-xs font-bold text-white block truncate">{preset.name}</span>
                    <span className="text-[10px] text-slate-400">{preset.city}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Pickup & Dropoff Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Pickup Store / Address
                </label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={e => setPickupAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Dropoff Address
                </label>
                <input
                  type="text"
                  value={dropoffAddress}
                  onChange={e => setDropoffAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Interactive Map Location Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MapLocationPicker
                lat={pickupLat}
                lng={pickupLng}
                onLocationSelect={(lat, lng) => {
                  setPickupLat(lat);
                  setPickupLng(lng);
                }}
                label="Pickup Location Pin"
              />

              <MapLocationPicker
                lat={dropoffLat}
                lng={dropoffLng}
                onLocationSelect={(lat, lng) => {
                  setDropoffLat(lat);
                  setDropoffLng(lng);
                }}
                label="Dropoff Location Pin"
              />
            </div>
          </div>
        )}

        {/* STEP 3: WEIGHT & VEHICLE SELECTION */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Estimated Package Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={packageWeightKg}
                onChange={e => setPackageWeightKg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-sm font-bold text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Vehicle Recommendation Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold block">Recommended Vehicle</span>
                  <span className="text-sm font-bold text-white">{recommendedVehicle}</span>
                </div>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">
                Matched
              </span>
            </div>

            {/* Urgency Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Delivery Urgency Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUrgency('Standard')}
                  className={`p-4 rounded-xl border text-left transition ${
                    urgency === 'Standard'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="block text-sm font-bold text-white">Standard Delivery</span>
                  <span className="text-xs text-slate-400">Delivered within 3-4 hours</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgency('Express')}
                  className={`p-4 rounded-xl border text-left transition ${
                    urgency === 'Express'
                      ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="block text-sm font-bold text-amber-400">Express Priority ⚡</span>
                  <span className="text-xs text-slate-400">Fast delivery within 60 mins (+40%)</span>
                </button>
              </div>
            </div>

            {/* Select Preferred Verified Driver */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Preferred Driver (Optional)
                </label>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Only Verified Drivers Shown
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedDriverId(null)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedDriverId === null
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold text-white">Auto-Match Best Available Driver</span>
                  <span className="text-[10px] text-slate-400">Dispatcher / System assigns closest driver</span>
                </button>

                {availableDrivers
                  .filter(d => d.isVerified)
                  .map(drv => (
                    <button
                      key={drv.id}
                      type="button"
                      onClick={() => setSelectedDriverId(drv.id)}
                      className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition ${
                        selectedDriverId === drv.id
                          ? 'bg-blue-500/20 border-blue-500 text-white font-bold shadow-lg shadow-blue-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        🚗
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-bold text-white truncate">{drv.fullName || `Driver #${drv.id}`}</span>
                          <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        </div>
                        <p className="text-[10px] text-slate-400">{drv.vehicleType} • {drv.vehiclePlateNumber || 'Plate Verified'}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-amber-400 font-semibold mt-0.5">
                          <span>★ {drv.rating?.toFixed(1) || '4.9'}</span>
                          <span className="text-slate-500">• {drv.totalDeliveriesCompleted || 100}+ Trips</span>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Live Distance & Fee Summary */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Estimated GPS Distance: {distanceKm.toFixed(1)} km</span>
              <span className="text-emerald-400 font-bold text-sm">Shipping Fee: {shippingFee.toFixed(2)} ETB</span>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT & FINAL REVIEW */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Telebirr')}
                  className={`p-4 rounded-2xl border flex items-center space-x-3 transition ${
                    paymentMethod === 'Telebirr'
                      ? 'bg-blue-500/20 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  <div>
                    <span className="text-sm font-bold block text-white">Telebirr Instant</span>
                    <span className="text-[10px] text-slate-400">Digital Mobile Wallet</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-4 rounded-2xl border flex items-center space-x-3 transition ${
                    paymentMethod === 'Cash'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-emerald-400" />
                  <div>
                    <span className="text-sm font-bold block text-white">Cash on Delivery</span>
                    <span className="text-[10px] text-slate-400">Pay driver upon arrival</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Comprehensive Order Summary Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Summary</h4>
              <div className="space-y-2 text-xs divide-y divide-slate-800">
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Category</span>
                  <span className="font-bold text-white">{category}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Pickup Location</span>
                  <span className="font-semibold text-white">{pickupAddress}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Dropoff Destination</span>
                  <span className="font-semibold text-white">{dropoffAddress}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Shopping Items Value ({items.length} items)</span>
                  <span className="font-semibold text-white">{itemsTotal} ETB</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Delivery Shipping Fee</span>
                  <span className="font-semibold text-emerald-400">{shippingFee.toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between pt-3 text-sm font-bold text-white">
                  <span>Total Payable</span>
                  <span className="text-emerald-400 text-base">{grandTotal.toFixed(2)} ETB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white rounded-xl flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 text-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitFinal}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl shadow-xl shadow-emerald-500/20 transition flex items-center space-x-2 text-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Delivery Request</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
