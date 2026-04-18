import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EntryType, CLP_DENOMINATIONS } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { formatCLP, parseCLPInput, generateId } from '@/lib/format';
import { ArrowDownCircle, CreditCard, Banknote, Plus } from 'lucide-react';
import DenominationPicker from './DenominationPicker';

const entryConfig = {
  [EntryType.DEPOSIT]: { label: 'Depósito', icon: ArrowDownCircle, needsCashier: false, needsCompany: false },
  [EntryType.TIP]: { label: 'Propina', icon: Banknote, needsCashier: false, needsCompany: false },
  [EntryType.CREDIT]: { label: 'Crédito', icon: CreditCard, needsCashier: false, needsCompany: true },
};

interface Props {
  type: EntryType;
  children?: React.ReactNode;
}

export default function EntryDialog({ type, children }: Props) {
  const { addEntry } = useApp();
  const [open, setOpen] = useState(false);
  const [amountStr, setAmountStr] = useState('');
  const [cashier, setCashier] = useState('');
  const [company, setCompany] = useState('');
  const [observation, setObservation] = useState('');
  const [cashCredit, setCashCredit] = useState(false);
  const [denominations, setDenominations] = useState<Record<number, number>>({});

  const config = entryConfig[type];
  const isDeposit = type === EntryType.DEPOSIT;

  const denomTotal = useMemo(
    () => CLP_DENOMINATIONS.reduce((s, d) => s + d * (denominations[d] || 0), 0),
    [denominations]
  );

  // For deposits, the amount auto-syncs to denominations total when user is using the picker
  const effectiveAmount = isDeposit && denomTotal > 0 ? denomTotal : parseCLPInput(amountStr);

  const handleAmountChange = (val: string) => {
    const nums = val.replace(/\D/g, '');
    setAmountStr(nums);
    // If user types manually, clear denominations to avoid mismatch
    if (isDeposit && Object.keys(denominations).length > 0) {
      setDenominations({});
    }
  };

  const handleDenomChange = (next: Record<number, number>) => {
    setDenominations(next);
    if (isDeposit) {
      const total = CLP_DENOMINATIONS.reduce((s, d) => s + d * (next[d] || 0), 0);
      setAmountStr(total > 0 ? total.toString() : '');
    }
  };

  const reset = () => {
    setAmountStr('');
    setCashier('');
    setCompany('');
    setObservation('');
    setCashCredit(false);
    setDenominations({});
  };

  const handleSubmit = () => {
    const amount = effectiveAmount;
    if (amount <= 0) return;

    const now = new Date();
    const hasDenoms = Object.keys(denominations).length > 0;
    addEntry({
      id: generateId(),
      type,
      amount,
      cashier: config.needsCashier ? cashier : undefined,
      company: config.needsCompany ? company : undefined,
      observation: !isDeposit && observation ? observation : undefined,
      cashCredit: type === EntryType.CREDIT ? cashCredit : undefined,
      denominations: isDeposit && hasDenoms ? denominations : undefined,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
    });

    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="rounded-3xl gap-2 h-12">
            <config.icon className="w-4 h-4" />
            {config.label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-3xl bg-card border-border max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <config.icon className="w-5 h-5 text-primary" />
            Registrar {config.label}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-muted-foreground text-sm">Monto</Label>
            <Input
              value={amountStr ? formatCLP(parseInt(amountStr)) : ''}
              onChange={e => handleAmountChange(e.target.value)}
              placeholder="$0"
              className="text-2xl font-bold h-14 rounded-2xl bg-secondary border-border text-foreground"
              inputMode="numeric"
            />
          </div>

          {config.needsCashier && (
            <div>
              <Label className="text-muted-foreground text-sm">Cajero</Label>
              <Input
                value={cashier}
                onChange={e => setCashier(e.target.value)}
                placeholder="Nombre del cajero"
                className="rounded-2xl bg-secondary border-border"
              />
            </div>
          )}

          {config.needsCompany && (
            <div>
              <Label className="text-muted-foreground text-sm">Empresa</Label>
              <Input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Nombre de la empresa"
                className="rounded-2xl bg-secondary border-border"
              />
            </div>
          )}

          {type === EntryType.CREDIT && (
            <div className="flex items-center justify-between rounded-2xl bg-secondary/50 p-3">
              <Label className="text-sm text-foreground">Crédito en efectivo</Label>
              <Switch checked={cashCredit} onCheckedChange={setCashCredit} />
            </div>
          )}

          {isDeposit ? (
            <DenominationPicker value={denominations} onChange={handleDenomChange} />
          ) : (
            <div>
              <Label className="text-muted-foreground text-sm">Observación</Label>
              <Input
                value={observation}
                onChange={e => setObservation(e.target.value)}
                placeholder="Opcional"
                className="rounded-2xl bg-secondary border-border"
              />
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full h-12 rounded-3xl bg-primary text-primary-foreground font-bold text-base"
          >
            <Plus className="w-5 h-5 mr-2" /> Agregar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
