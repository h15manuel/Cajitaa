import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { formatCLP } from '@/lib/format';
import { Calculator, Delete } from 'lucide-react';

export default function QuickCountModal() {
  const { setCashDrawer, state } = useApp();
  const [value, setValue] = useState(state.cashDrawer.toString());
  const [open, setOpen] = useState(false);

  const handleKey = (key: string) => {
    if (key === 'C') {
      setValue('0');
    } else if (key === '⌫') {
      setValue(v => v.length > 1 ? v.slice(0, -1) : '0');
    } else if (key === 'OK') {
      setCashDrawer(parseInt(value) || 0);
      setOpen(false);
    } else {
      setValue(v => v === '0' ? key : v + key);
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setValue(state.cashDrawer.toString()); }}>
      <DialogTrigger asChild>
        <button className="m3-surface-elevated p-5 w-full text-left animate-slide-up cursor-pointer hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Efectivo en Gaveta</p>
              <p className="text-3xl font-bold text-foreground shield-blur mt-1">{formatCLP(state.cashDrawer)}</p>
            </div>
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Toca para contar</p>
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl bg-card border-border max-w-xs mx-auto p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Conteo Rápido
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-4">
          <p className="text-4xl font-bold text-foreground">{formatCLP(parseInt(value) || 0)}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {keys.map(k => (
            <button
              key={k}
              onClick={() => handleKey(k)}
              className={`h-14 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
                k === 'C' ? 'bg-destructive/20 text-destructive' :
                k === '⌫' ? 'bg-warning/20 text-warning' :
                'bg-secondary text-foreground hover:bg-muted'
              }`}
            >
              {k === '⌫' ? <Delete className="w-5 h-5 mx-auto" /> : k}
            </button>
          ))}
        </div>
        <Button
          onClick={() => handleKey('OK')}
          className="w-full h-14 rounded-3xl bg-primary text-primary-foreground font-bold text-lg mt-2"
        >
          Confirmar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
