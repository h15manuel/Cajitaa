import React, { useRef, useEffect } from 'react';

interface TimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  label?: string;
}

const pad = (n: number) => n.toString().padStart(2, '0');

function ScrollColumn({ items, selected, onSelect, formatFn }: {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
  formatFn?: (v: number) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40;
  const fmt = formatFn || ((v: number) => pad(v));

  useEffect(() => {
    if (containerRef.current) {
      const idx = items.indexOf(selected);
      if (idx >= 0) {
        containerRef.current.scrollTo({ top: idx * itemHeight, behavior: 'smooth' });
      }
    }
  }, [selected, items]);

  return (
    <div
      ref={containerRef}
      className="h-[160px] overflow-y-auto snap-y snap-mandatory scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div style={{ height: `${itemHeight * 1.5}px` }} />
      {items.map(item => {
        const isSelected = item === selected;
        return (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className={`w-full snap-center flex items-center justify-center text-lg font-medium transition-all ${
              isSelected
                ? 'text-primary font-bold scale-110'
                : 'text-muted-foreground opacity-50'
            }`}
            style={{ height: `${itemHeight}px` }}
          >
            {fmt(item)}
          </button>
        );
      })}
      <div style={{ height: `${itemHeight * 1.5}px` }} />
    </div>
  );
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [h, m] = (value || '00:00').split(':').map(Number);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="space-y-2">
      {label && <label className="text-xs text-muted-foreground block">{label}</label>}
      <div className="flex items-center justify-center gap-0 bg-secondary/50 rounded-2xl border border-border overflow-hidden">
        {/* Hours */}
        <div className="w-20 relative">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-primary/10 rounded-lg pointer-events-none z-0" />
          <ScrollColumn
            items={hours}
            selected={h}
            onSelect={(v) => onChange(`${pad(v)}:${pad(m)}`)}
          />
        </div>
        <span className="text-xl font-bold text-muted-foreground">:</span>
        {/* Minutes */}
        <div className="w-20 relative">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-primary/10 rounded-lg pointer-events-none z-0" />
          <ScrollColumn
            items={minutes}
            selected={m}
            onSelect={(v) => onChange(`${pad(h)}:${pad(v)}`)}
          />
        </div>
      </div>
    </div>
  );
}
