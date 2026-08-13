import React from 'react';
import { OrderStatusHistory } from '../types';
import { Clock, ShieldCheck, User, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuditTimelineProps {
  histories: OrderStatusHistory[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ histories }) => {
  const sortedHistories = [...histories].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
      case 'dispatcher':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'driver':
        return <Truck className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
        <Clock className="w-4 h-4 text-emerald-400" />
        <span>Audit Trail & Status History</span>
      </h4>

      <div className="relative border-l-2 border-slate-800 ml-3 pl-4 space-y-4">
        {sortedHistories.map((h, idx) => {
          const dateStr = new Date(h.timestamp).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={h.id || idx} className="relative group">
              <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-emerald-500 group-hover:scale-125 transition-transform" />
              
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    {h.status}
                  </span>
                  <span className="text-[10px] text-slate-500">{dateStr}</span>
                </div>

                <p className="text-xs text-slate-300">{h.note}</p>

                <div className="flex items-center space-x-1.5 pt-1 text-[10px] text-slate-400">
                  {getRoleIcon(h.updatedByRole)}
                  <span>Updated by <strong className="text-slate-200">{h.updatedByRole}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
