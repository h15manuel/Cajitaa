import React, { useState, useRef, useCallback } from 'react';

interface TimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  label?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

type Mode = 'hours' | 'minutes';

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [h, m] = (value || '00:00').split(':').map(Number);
  const [mode, setMode] = useState<Mode>('hours');
  const [selectedHour, setSelectedHour] = useState(h);
  const [selectedMinute, setSelectedMinute] = useState(m);
  const dialRef = useRef<HTMLDivElement>(null);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const handleSelect = useCallback((val: number) => {
    if (mode === 'hours') {
      setSelectedHour(val);
      const timeStr = `${pad(val)}:${pad(selectedMinute)}`;
      onChange(timeStr);
      // Auto-advance to minutes
      setTimeout(() => setMode('minutes'), 200);
    } else {
      setSelectedMinute(val);
      const timeStr = `${pad(selectedHour)}:${pad(val)}`;
      onChange(timeStr);
    }
  }, [mode, selectedHour, selectedMinute, onChange]);

  const getAngle = (index: number, total: number) => {
    return (index / total) * 360 - 90;
  };

  const items = mode === 'hours' ? HOURS : MINUTES;
  const selected = mode === 'hours' ? selectedHour : selectedMinute;

  // For hours: inner ring 13-23+0, outer ring 1-12
  const isInnerHour = (h: number) => h === 0 || h >= 13;

  const handleDialClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    const dist = Math.sqrt(x * x + y * y);

    if (mode === 'hours') {
      const isInner = dist < cx * 0.55;
      if (isInner) {
        // Inner ring: 0, 13-23
        let idx = Math.round(angle / 30) % 12;
        const hour = idx === 0 ? 0 : idx + 12;
        handleSelect(hour);
      } else {
        // Outer ring: 1-12
        let idx = Math.round(angle / 30) % 12;
        const hour = idx === 0 ? 12 : idx;
        handleSelect(hour);
      }
    } else {
      let idx = Math.round(angle / 6) % 60;
      // Snap to nearest 5
      idx = Math.round(idx / 5) * 5;
      if (idx === 60) idx = 0;
      handleSelect(idx);
    }
  };

  const renderDial = () => {
    if (mode === 'hours') {
      // Outer ring: 1-12
      const outerItems = Array.from({ length: 12 }, (_, i) => i + 1);
      // Inner ring: 0, 13-23
      const innerItems = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
      
      return (
        <>
          {outerItems.map((h, i) => {
            const angle = getAngle(i, 12);
            const rad = (angle * Math.PI) / 180;
            const radius = 42;
            const x = 50 + radius * Math.cos(rad);
            const y = 50 + radius * Math.sin(rad);
            const isSelected = selected === h;
            return (
              <button
                key={`o-${h}`}
                onClick={() => handleSelect(h)}
                className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  isSelected ? 'bg-primary text-primary-foreground scale-110' : 'text-foreground hover:bg-secondary'
                }`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {h}
              </button>
            );
          })}
          {innerItems.map((h, i) => {
            const angle = getAngle(i, 12);
            const rad = (angle * Math.PI) / 180;
            const radius = 26;
            const x = 50 + radius * Math.cos(rad);
            const y = 50 + radius * Math.sin(rad);
            const isSelected = selected === h;
            return (
              <button
                key={`i-${h}`}
                onClick={() => handleSelect(h)}
                className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center text-[10px] font-medium transition-all ${
                  isSelected ? 'bg-primary text-primary-foreground scale-110' : 'text-muted-foreground hover:bg-secondary'
                }`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {pad(h)}
              </button>
            );
          })}
        </>
      );
    } else {
      return MINUTES.map((m, i) => {
        const angle = getAngle(i, 12);
        const rad = (angle * Math.PI) / 180;
        const radius = 42;
        const x = 50 + radius * Math.cos(rad);
        const y = 50 + radius * Math.sin(rad);
        const isSelected = selected === m;
        return (
          <button
            key={`m-${m}`}
            onClick={() => handleSelect(m)}
            className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              isSelected ? 'bg-primary text-primary-foreground scale-110' : 'text-foreground hover:bg-secondary'
            }`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {pad(m)}
          </button>
        );
      });
    }
  };

  // Draw hand from center to selected
  const getHandAngle = () => {
    if (mode === 'hours') {
      const idx = selected >= 13 ? selected - 12 : selected === 0 ? 0 : selected;
      return (idx / 12) * 360 - 90;
    } else {
      return (selected / 60) * 360 - 90;
    }
  };

  const handLength = mode === 'hours' && isInnerHour(selected) ? 26 : 42;

  return (
    <div className="space-y-2">
      {label && <label className="text-xs text-muted-foreground block">{label}</label>}
      
      {/* Time display - tap to switch mode */}
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => setMode('hours')}
          className={`text-2xl font-bold px-2 py-1 rounded-lg transition-colors ${
            mode === 'hours' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
          }`}
        >
          {pad(selectedHour)}
        </button>
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        <button
          onClick={() => setMode('minutes')}
          className={`text-2xl font-bold px-2 py-1 rounded-lg transition-colors ${
            mode === 'minutes' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
          }`}
        >
          {pad(selectedMinute)}
        </button>
      </div>

      {/* Clock dial */}
      <div
        ref={dialRef}
        onClick={handleDialClick}
        className="relative w-56 h-56 mx-auto rounded-full bg-secondary/50 border border-border cursor-pointer"
      >
        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-primary" />
        
        {/* Hand line */}
        <div
          className="absolute left-1/2 top-1/2 origin-left bg-primary"
          style={{
            width: `${handLength}%`,
            height: '2px',
            marginTop: '-1px',
            transform: `rotate(${getHandAngle()}deg)`,
            transition: 'transform 0.2s ease',
          }}
        />

        {renderDial()}
      </div>
    </div>
  );
}
