import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCLP, parseCLPInput } from '@/lib/format';
import { EntryType, CashEntry } from '@/types';
import QuickCountModal from '@/components/QuickCountModal';
import EntryDialog from '@/components/EntryDialog';
import EditEntryDialog from '@/components/EditEntryDialog';
import { ArrowDownCircle, CreditCard, Banknote, TrendingUp, TrendingDown, CheckCircle2, Target, LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Dashboard() {
  const { state, setZAmount, closeShift, depositsTotal, meta, efectivoReal, diferencia, status } = useApp();
  const [zInput, setZInput] = useState(state.zAmount > 0 ? state.zAmount.toString() : '');
  const [editingEntry, setEditingEntry] = useState<CashEntry | null>(null);

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
        <div className={`${sc.class} rounded-3xl p-4 flex items-center gap-3`}>
          <sc.icon className="w-7 h-7" />
          <div>
            <p className="font-bold text-lg">{sc.label}</p>
            <p className="text-sm opacity-80 shield-blur">{formatCLP(Math.abs(diferencia))}</p>
          </div>
        </div>
      )}

      {/* Z Amount input */}
      <div className="m3-surface-elevated p-5">
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
        <div className="m3-surface p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Meta</p>
          <p className="text-xl font-bold text-foreground shield-blur mt-1">{formatCLP(meta)}</p>
          <p className="text-[10px] text-muted-foreground">Z - Propinas</p>
        </div>
        <div className="m3-surface p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Efectivo Real</p>
          <p className="text-xl font-bold text-foreground shield-blur mt-1">{formatCLP(efectivoReal)}</p>
          <p className="text-[10px] text-muted-foreground">Depósitos + Gaveta</p>
        </div>
        <div className="m3-surface p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Depósitos</p>
          <p className="text-xl font-bold text-primary shield-blur mt-1">{formatCLP(depositsTotal)}</p>
        </div>
        <div className="m3-surface p-4">
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

      {/* Close shift button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="w-full m3-surface p-4 flex items-center justify-center gap-2 hover:border-destructive/40 transition-colors">
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Cerrar Turno</span>
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar turno?</AlertDialogTitle>
            <AlertDialogDescription>
              Se limpiará la planilla (Z, gaveta y propinas vuelven a $0). Los movimientos registrados se conservan en el historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { closeShift(); setZInput(''); }}
            >
              Cerrar Turno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Today's entries (non-credit) */}
      {todayEntries.filter(e => e.type !== EntryType.CREDIT).length > 0 && (
        <div className="m3-surface p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Movimientos de Hoy</p>
          <div className="space-y-2">
            {todayEntries.filter(e => e.type !== EntryType.CREDIT).slice(-5).reverse().map(entry => {
              const icons = { DEPOSIT: ArrowDownCircle, TIP: Banknote, CREDIT: CreditCard };
              const colors = { DEPOSIT: 'text-primary', TIP: 'text-warning', CREDIT: 'text-info' };
              const labels = { DEPOSIT: 'Depósito', TIP: 'Propina', CREDIT: 'Crédito' };
              const Icon = icons[entry.type];
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 bg-secondary/50 rounded-2xl p-3 cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => setEditingEntry(entry)}
                >
                  <Icon className={`w-5 h-5 ${colors[entry.type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {labels[entry.type]} {entry.company && `· ${entry.company}`}
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

      {/* Credits grouped by 6 */}
      {(() => {
        const credits = state.entries.filter(e => e.type === EntryType.CREDIT);
        if (credits.length === 0) return null;

        const groups: CashEntry[][] = [];
        for (let i = 0; i < credits.length; i += 6) {
          groups.push(credits.slice(i, i + 6));
        }
        const grandTotal = credits.reduce((sum, e) => sum + e.amount, 0);

        return (
          <div className="m3-surface p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Créditos · {credits.length} registros
            </p>
            <div className="space-y-4">
              {groups.map((group, gi) => {
                const subtotal = group.reduce((sum, e) => sum + e.amount, 0);
                return (
                  <div key={gi}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">
                      Grupo {gi + 1} ({group.length}/6)
                    </p>
                    <div className="space-y-1.5">
                      {group.map(entry => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 bg-secondary/50 rounded-2xl p-2.5 cursor-pointer hover:bg-secondary/80 transition-colors"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <CreditCard className="w-4 h-4 text-info" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {entry.company || 'Crédito'}
                            </p>
                            <p className="text-xs text-muted-foreground">{entry.time}</p>
                          </div>
                          <p className="text-sm font-bold text-foreground shield-blur">{formatCLP(entry.amount)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-semibold text-info">Subtotal grupo {gi + 1}</p>
                      <p className="text-sm font-bold text-info shield-blur">{formatCLP(subtotal)}</p>
                    </div>
                  </div>
                );
              })}

              {groups.length > 0 && (
                <div className="flex justify-between items-center pt-2 border-t-2 border-info/30">
                  <p className="text-xs font-bold text-foreground uppercase">Total Créditos</p>
                  <p className="text-base font-bold text-info shield-blur">{formatCLP(grandTotal)}</p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">Los créditos no afectan el saldo de caja</p>
          </div>
        );
      })()}

      {/* Edit entry dialog */}
      {editingEntry && (
        <EditEntryDialog
          entry={editingEntry}
          open={!!editingEntry}
          onOpenChange={(open) => { if (!open) setEditingEntry(null); }}
        />
      )}
    </div>
  );
}
