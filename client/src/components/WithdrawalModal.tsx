import React, { useState } from 'react';
import { Landmark, CreditCard, DollarSign, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdrawSuccess: (withdrawal: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    amount: number;
    reference: string;
    date: string;
  }) => void;
}

const ETHIOPIAN_BANKS = [
  { id: 'CBE', name: 'Commercial Bank of Ethiopia (CBE)', icon: '🏦' },
  { id: 'BOA', name: 'Bank of Abyssinia (BOA)', icon: '🏛️' },
  { id: 'AWASH', name: 'Awash Bank', icon: '🏦' },
  { id: 'DASHEN', name: 'Dashen Bank', icon: '🏛️' },
  { id: 'TELEBIRR', name: 'Telebirr Mobile Wallet', icon: '📱' },
  { id: 'CBE_BIRR', name: 'CBE Birr Wallet', icon: '📱' },
];

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onWithdrawSuccess,
}) => {
  const [selectedBank, setSelectedBank] = useState('CBE');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('Abebe Kebede');
  const [amount, setAmount] = useState<number | ''>(availableBalance > 0 ? Math.min(500, availableBalance) : '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }

    if (numAmount > availableBalance) {
      setError(`Requested amount (${numAmount} ETB) exceeds available withdrawable balance (${availableBalance.toFixed(2)} ETB).`);
      return;
    }

    if (!accountNumber.trim()) {
      setError('Please enter your Bank Account Number or Phone Number.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const bankObj = ETHIOPIAN_BANKS.find(b => b.id === selectedBank);
      const newWithdrawal = {
        id: Math.random().toString(36).substring(2, 9),
        bankName: bankObj ? bankObj.name : selectedBank,
        accountNumber,
        accountHolder,
        amount: numAmount,
        reference: `PAYOUT-${selectedBank}-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString(),
      };

      onWithdrawSuccess(newWithdrawal);
      setIsProcessing(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Withdraw Earnings</h3>
              <span className="text-xs text-slate-400">Transfer earnings to your bank account</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">
            ✕
          </button>
        </div>

        {/* Available Balance Box */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block">Available Balance</span>
            <span className="text-xl font-bold text-emerald-400">{availableBalance.toFixed(2)} ETB</span>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
            Ready for Payout
          </span>
        </div>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Bank */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Payout Bank / Wallet
            </label>
            <select
              value={selectedBank}
              onChange={e => setSelectedBank(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
            >
              {ETHIOPIAN_BANKS.map(bank => (
                <option key={bank.id} value={bank.id}>
                  {bank.icon} {bank.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Account Number / Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. 1000123456789 or +251911..."
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono transition"
            />
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Account Holder Full Name
            </label>
            <input
              type="text"
              placeholder="Full Name as registered at bank"
              value={accountHolder}
              onChange={e => setAccountHolder(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Withdrawal Amount (ETB)
            </label>
            <input
              type="number"
              min="1"
              max={availableBalance}
              placeholder="Amount in ETB"
              value={amount}
              onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full bg-slate-950 border border-slate-800 text-sm font-bold rounded-xl px-4 py-3 text-emerald-400 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || availableBalance <= 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Confirm Withdrawal Payout</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
