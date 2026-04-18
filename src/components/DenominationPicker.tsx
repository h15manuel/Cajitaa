import React, { useState } from 'react';
import { CLP_DENOMINATIONS } from '@/types';
import { formatCLP } from '@/lib/format';
import { Coins, ChevronDown, Minus, Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Props {
  value: Record<number, number>;
  onChange: (next: Record<number, number>) => void;
  defaultOpen?: boolean;
}

export default function DenominationPicker({ value, onChange, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const total = CLP_DENOMINATIONS.reduce((s, d) => s + d * (value[d] || 0), 0);
  const totalCount = CLP_DENOMINATIONS.reduce((s, d) => s + (value[d] || 0), 0);

  const setCount = (denom: number, count: number) => {
    const next = { ...value };
    if (count <= 0) delete next[denom];
    else next[denom] = count;
    onChange(next);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-2xl bg-secondary/50 border border-border overflow-hidden">
      <CollapsibleTrigger className="w-full p-3 flex items-center justify-between cursor-pointer group">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Denominación</span>
          {totalCount > 0 && (
            <span className="text-[10px] text-muted-foreground">
              · {totalCount} {totalCount === 1 ? 'pieza' : 'piezas'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && <span className="text-xs font-bold text-primary">{formatCLP(total)}</span>}
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-2 space-y-1.5 border-t border-border">
          {CLP_DENOMINATIONS.map(denom => {
            const count = value[denom] || 0;
            const subtotal = denom * count;
            return (
              <div key={denom} className="flex items-center gap-2 bg-background/50 rounded-xl p-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{formatCLP(denom)}</p>
                  {count > 0 && (
                    <p className="text-[10px] text-muted-foreground">= {formatCLP(subtotal)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setCount(denom, count - 1)}
                  disabled={count === 0}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground disabled:opacity-30 active:scale-90 transition-transform"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-foreground tabular-nums">{count}</span>
                <button
                  type="button"
                  onClick={() => setCount(denom, count + 1)}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground active:scale-90 transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
