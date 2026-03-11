import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CashEntry, EntryType } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { formatCLP, parseCLPInput } from '@/lib/format';
import { ArrowDownCircle, CreditCard, Banknote, Save } from 'lucide-react';

const icons = { DEPOSIT: ArrowDownCircle, TIP: Banknote, CREDIT: CreditCard };
const labels = { DEPOSIT: 'Depósito', TIP: 'Propina', CREDIT: 'Crédito' };

interface Props {
  entry: CashEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEntryDialog({ entry, open, onOpenChange }: Props) {
  const { editEntry } = useApp();
  const [amountStr, setAmountStr] = useState(entry.amount.toString());
  const [company, setCompany] = useState(entry.company || '');
  const [observation, setObservation] = useState(entry.observation || '');
  const [cashCredit, setCashCredit] = useState(entry.cashCredit || false);

  const Icon = icons[entry.type];

  const handleAmountChange = (val: string) => {
    setAmountStr(val.replace(/\D/g, ''));
  };

  const handleSubmit = () => {
    const amount = parseCLPInput(amountStr);
    if (amount <= 0) return;

    editEntry(entry.id, {
      amount,
      company: entry.type === EntryType.CREDIT ? company || undefined : entry.company,
      observation: observation || undefined,
      cashCredit: entry.type === EntryType.CREDIT ? cashCredit : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-card border-border max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Icon className="w-5 h-5 text-primary" />
            Editar {labels[entry.type]}
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

          {entry.type === EntryType.CREDIT && (
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

          <div>
            <Label className="text-muted-foreground text-sm">Observación</Label>
            <Input
              value={observation}
              onChange={e => setObservation(e.target.value)}
              placeholder="Opcional"
              className="rounded-2xl bg-secondary border-border"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 rounded-3xl bg-primary text-primary-foreground font-bold text-base"
          >
            <Save className="w-5 h-5 mr-2" /> Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
