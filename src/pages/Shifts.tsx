import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DayShift } from '@/types';

const shiftConfig: Record<string, { label: string; short: string; color: string; hours: boolean }> = {
  morning: { label: 'Mañana', short: 'M', color: 'bg-warning text-warning-foreground', hours: true },
  afternoon: { label: 'Tarde', short: 'T', color: 'bg-info text-info-foreground', hours: true },
  night: { label: 'Noche', short: 'N', color: 'bg-primary text-primary-foreground', hours: true },
  free: { label: 'Libre', short: 'L', color: 'bg-success text-success-foreground', hours: false },
  none: { label: 'Borrar', short: '✕', color: 'bg-destructive/20 text-destructive', hours: false },
};

type ShiftType = DayShift['shift'];
const shiftTypes: ShiftType[] = ['morning', 'afternoon', 'night', 'free', 'none'];
const hourOptions: (7.5 | 6.5)[] = [7.5, 6.5];

export default function Shifts() {
  const { state, setState } = useApp();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedShift, setSelectedShift] = React.useState<ShiftType>('morning');
  const [selectedHours, setSelectedHours] = React.useState<7.5 | 6.5>(7.5);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7;
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);

  const getShiftData = (dateStr: string) => state.shifts.find(s => s.date === dateStr);
  const getShift = (dateStr: string): ShiftType => getShiftData(dateStr)?.shift || 'none';
  const getHours = (dateStr: string): number => getShiftData(dateStr)?.hours || 7.5;

  const applyShift = (dateStr: string) => {
    setState(s => {
      const filtered = s.shifts.filter(sh => sh.date !== dateStr);
      if (selectedShift === 'none') return { ...s, shifts: filtered };
      const hasHours = shiftConfig[selectedShift].hours;
      return {
        ...s,
        shifts: [...filtered, { date: dateStr, shift: selectedShift, hours: hasHours ? selectedHours : undefined }],
      };
    });
  };

  const cycles = useMemo(() => {
    const sorted = [...state.shifts]
      .filter(s => s.shift !== 'none')
      .sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length === 0) return [];

    const allCycles: { start: string; end: string; hours: number; overLimit: boolean }[] = [];
    let cycleStart: string | null = null;
    let hoursAccum = 0;

    for (const s of sorted) {
      if (s.shift === 'free') {
        if (cycleStart !== null && hoursAccum > 0) {
          allCycles.push({ start: cycleStart, end: s.date, hours: hoursAccum, overLimit: hoursAccum > state.weeklyHours });
        }
        cycleStart = null;
        hoursAccum = 0;
      } else {
        if (cycleStart === null) cycleStart = s.date;
        hoursAccum += (s.hours || 7.5);
      }
    }
    if (cycleStart !== null && hoursAccum > 0) {
      allCycles.push({ start: cycleStart, end: sorted[sorted.length - 1].date, hours: hoursAccum, overLimit: hoursAccum > state.weeklyHours });
    }

    // Filter: only cycles that overlap with the current month
    const mStart = format(monthStart, 'yyyy-MM-dd');
    const mEnd = format(monthEnd, 'yyyy-MM-dd');
    return allCycles.filter(c => c.start <= mEnd && c.end >= mStart);
  }, [state.shifts, state.weeklyHours, monthStart, monthEnd]);

  return (
    <div className="space-y-4 pt-2 max-w-lg mx-auto">
      {/* Jornada semanal */}
      <div className="m3-surface p-4">
        <p className="text-xs text-muted-foreground mb-1">Jornada semanal</p>
        <select
          value={state.weeklyHours}
          onChange={e => setState(s => ({ ...s, weeklyHours: Number(e.target.value) as any }))}
          className="w-full h-9 rounded-2xl bg-secondary border border-border px-3 text-sm text-foreground"
        >
          <option value={44}>44 horas</option>
          <option value={42}>42 horas</option>
          <option value={40}>40 horas</option>
        </select>
      </div>

      {/* Shift + hours picker ("brush") */}
      <div className="m3-surface p-3 space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Selecciona turno y toca los días</p>
        <div className="flex flex-wrap gap-1.5">
          {shiftTypes.map(type => {
            const cfg = shiftConfig[type];
            const isActive = selectedShift === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedShift(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${cfg.color} ${
                  isActive ? 'ring-2 ring-foreground ring-offset-1 ring-offset-background scale-105' : 'opacity-60'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
        {shiftConfig[selectedShift].hours && (
          <div className="flex gap-2 items-center">
            <p className="text-[10px] text-muted-foreground">Horas:</p>
            {hourOptions.map(h => (
              <button
                key={h}
                onClick={() => setSelectedHours(h)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedHours === h
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-secondary">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-secondary">
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="m3-surface p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(d => (
            <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const shift = getShift(dateStr);
            const cfg = shiftConfig[shift];
            const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
            const dayHours = getHours(dateStr);
            const isWorkShift = shift !== 'none' && shift !== 'free' && shiftConfig[shift].hours;
            return (
              <button
                key={dateStr}
                onClick={() => applyShift(dateStr)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all active:scale-95 ${
                  cfg.color || 'hover:bg-secondary text-foreground'
                } ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
              >
                <span className="text-[10px] opacity-70">{format(day, 'd')}</span>
                {cfg.short && <span className="text-[10px] font-bold">{cfg.short}</span>}
                {isWorkShift && <span className="text-[8px] opacity-80">{dayHours}h</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-1">
        {Object.entries(shiftConfig).filter(([k]) => k !== 'none').map(([key, cfg]) => (
          <div key={key} className={`${cfg.color} rounded-full px-3 py-1 text-xs font-medium`}>
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Cycles compliance */}
      {cycles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider px-1">Ciclos de Cumplimiento</p>
          {cycles.map((cycle, i) => (
            <div
              key={i}
              className={`m3-surface p-4 border-l-4 ${cycle.overLimit ? 'border-l-destructive' : 'border-l-success'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(cycle.start + 'T12:00'), 'dd/MM')} — {format(new Date(cycle.end + 'T12:00'), 'dd/MM')}
                  </p>
                  <p className="text-xs text-muted-foreground">{cycle.hours}h trabajadas / {state.weeklyHours}h máximo</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  cycle.overLimit ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'
                }`}>
                  {cycle.overLimit ? 'EXCEDIDO' : 'CUMPLE'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
