import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCLP, parseCLPInput } from '@/lib/format';
import { EntryType } from '@/types';
import QuickCountModal from '@/components/QuickCountModal';
import EntryDialog from '@/components/EntryDialog';
import { ArrowDownCircle, CreditCard, Banknote, TrendingUp, TrendingDown, CheckCircle2, Target } from 'lucide-react';

export default function Dashboard() {
  const { state, setZAmount, depositsTotal, meta, efectivoReal, diferencia, status } = useApp();
  const [zInput, setZInput] = useState(state.zAmount > 0 ? state.zAmount.toString() : '');

  const handleZChange = (val: string) => {
    const nums = val.replace(/\D/g, '');
    setZInput(nums);
    setZAmount(parseInt(nums) || 0);
  };

  const statusConfig = {
    cuadrada: { label: 'CAJA CUADRADA', icon: CheckCircle2, class: 'status-cuadrada' },
    sobrante: { label: 'SOBRANTE', icon: TrendingUp, class: 'status-sobrante' },
    faltante: { label: 'FALTANTE', icon: TrendingDown, class: 'status-faltante' },
  };

  const sc = statusConfig[status];
  const todayEntries = state.entries.filter(e => e.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-4 pt-2 max-w-lg mx-auto">
      {/* Status indicator */}
      {state.zAmount > 0 && (
        <div className={`${sc.class} rounded-3xl p-4 flex items-center gap-3 animate-slide-up`}>
          <sc.icon className="w-7 h-7" />
          <div>
            <p className="font-bold text-lg">{sc.label}</p>
            <p className="text-sm opacity-80 shield-blur">{formatCLP(Math.abs(diferencia))}</p>
          </div>
        </div>
      )}

      {/* Z Amount input */}
      <div className="m3-surface-elevated p-5 animate-slide-up">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monto del Sistema (Z)</p>
        <input
          value={zInput ? formatCLP(parseInt(zInput)) : ''}
          onChange={e => handleZChange(e.target.value)}
          placeholder="$0"
          inputMode="numeric"
          className="w-full text-3xl font-bold bg-transparent text-foreground outline-none mt-1 shield-blur"
        />
      </div>

      {/* Quick count */}
      <QuickCountModal />

      {/* Summary grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="m3-surface p-4 animate-slide-up">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Meta</p>
          <p className="text-xl font-bold text-foreground shield-blur mt-1">{formatCLP(meta)}</p>
          <p className="text-[10px] text-muted-foreground">Z - Propinas</p>
        </div>
        <div className="m3-surface p-4 animate-slide-up">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Efectivo Real</p>
          <p className="text-xl font-bold text-foreground shield-blur mt-1">{formatCLP(efectivoReal)}</p>
          <p className="text-[10px] text-muted-foreground">Depósitos + Gaveta</p>
        </div>
        <div className="m3-surface p-4 animate-slide-up">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Depósitos</p>
          <p className="text-xl font-bold text-primary shield-blur mt-1">{formatCLP(depositsTotal)}</p>
        </div>
        <div className="m3-surface p-4 animate-slide-up">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Propinas</p>
          <p className="text-xl font-bold text-warning shield-blur mt-1">{formatCLP(state.tipsTotal)}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        <EntryDialog type={EntryType.DEPOSIT}>
          <button className="flex-1 min-w-[100px] m3-surface p-3 flex flex-col items-center gap-1.5 hover:border-primary/40 transition-colors cursor-pointer">
            <ArrowDownCircle className="w-6 h-6 text-primary" />
            <span className="text-xs font-medium text-foreground">Depósito</span>
          </button>
        </EntryDialog>
        <EntryDialog type={EntryType.TIP}>
          <button className="flex-1 min-w-[100px] m3-surface p-3 flex flex-col items-center gap-1.5 hover:border-primary/40 transition-colors cursor-pointer">
            <Banknote className="w-6 h-6 text-warning" />
            <span className="text-xs font-medium text-foreground">Propina</span>
          </button>
        </EntryDialog>
        <EntryDialog type={EntryType.CREDIT}>
          <button className="flex-1 min-w-[100px] m3-surface p-3 flex flex-col items-center gap-1.5 hover:border-primary/40 transition-colors cursor-pointer">
            <CreditCard className="w-6 h-6 text-info" />
            <span className="text-xs font-medium text-foreground">Crédito</span>
          </button>
        </EntryDialog>
      </div>

      {/* Today's entries */}
      {todayEntries.length > 0 && (
        <div className="m3-surface p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Movimientos de Hoy</p>
          <div className="space-y-2">
            {todayEntries.slice(-5).reverse().map(entry => {
              const icons = { DEPOSIT: ArrowDownCircle, TIP: Banknote, CREDIT: CreditCard };
              const colors = { DEPOSIT: 'text-primary', TIP: 'text-warning', CREDIT: 'text-info' };
              const labels = { DEPOSIT: 'Depósito', TIP: 'Propina', CREDIT: 'Crédito' };
              const Icon = icons[entry.type];
              return (
                <div key={entry.id} className="flex items-center gap-3 bg-secondary/50 rounded-2xl p-3">
                  <Icon className={`w-5 h-5 ${colors[entry.type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {labels[entry.type]} {entry.cashier && `· ${entry.cashier}`} {entry.company && `· ${entry.company}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.time}</p>
                  </div>
                  <p className="text-sm font-bold text-foreground shield-blur">{formatCLP(entry.amount)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
