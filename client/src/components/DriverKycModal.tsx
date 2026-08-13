import React, { useState } from 'react';
import { ShieldCheck, Check, AlertCircle, ArrowRight, Camera } from 'lucide-react';
import { submitDriverKyc } from '../services/api';

interface DriverKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKycSubmitted: () => void;
}

export const DriverKycModal: React.FC<DriverKycModalProps> = ({
  isOpen,
  onClose,
  onKycSubmitted,
}) => {
  const [finFanNumber, setFinFanNumber] = useState('');
  const [faydaIdFrontUrl, setFaydaIdFrontUrl] = useState('');
  const [faydaIdBackUrl, setFaydaIdBackUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!finFanNumber.trim()) {
      setError('Please enter your Fayda FIN / FAN Number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitDriverKyc({
        finFanNumber,
        faydaIdFrontUrl: faydaIdFrontUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        faydaIdBackUrl: faydaIdBackUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
        selfieUrl: selfieUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      });

      onKycSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit KYC documents.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Verify Your Driver Account</h3>
              <span className="text-xs text-slate-400">Submit Fayda National ID (FIN/FAN) & Live Selfie</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FIN / FAN Number Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Fayda FIN / FAN Number (Identification / Account #)
            </label>
            <input
              type="text"
              placeholder="e.g. FIN-9823-1049-2810"
              value={finFanNumber}
              onChange={e => setFinFanNumber(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Fayda ID Front & Back Photo Attachments */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Fayda ID Front Photo</label>
              <button
                type="button"
                onClick={() => setFaydaIdFrontUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80')}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  faydaIdFrontUrl
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{faydaIdFrontUrl ? 'Front ID Attached ✓' : 'Attach ID Front'}</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Fayda ID Back Photo</label>
              <button
                type="button"
                onClick={() => setFaydaIdBackUrl('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80')}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  faydaIdBackUrl
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{faydaIdBackUrl ? 'Back ID Attached ✓' : 'Attach ID Back'}</span>
              </button>
            </div>
          </div>

          {/* Live Driver Verification Selfie */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Live Driver Verification Selfie</label>
            <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {selfieUrl ? (
                  <img src={selfieUrl} alt="Selfie preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">📸</span>
                )}
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setSelfieUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80')}
                  className="text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-2 rounded-xl font-bold transition w-full text-center"
                >
                  {selfieUrl ? 'Selfie Photo Captured ✓' : '📷 Capture Live Selfie Photo'}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Submit Verification Documents</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
