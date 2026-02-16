import React, { useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DayShift } from '@/types';

const shiftConfig: Record<string, { label: string; short: string; color: string; hours: boolean }> = {
  morning: { label: 'Mañana', short: 'M', color: 'bg-warning text-warning-foreground', hours: true },
  afternoon: { label: 'Tarde', short: 'T', color: 'bg-info text-info-foreground', hours: true },
  night: { label: 'Noche', short: 'N', color: 'bg-primary text-primary-foreground', hours: true },
  free: { label: 'Libre', short: 'L', color: 'bg-success text-success-foreground', hours: false },
  none: { label: '', short: '', color: '', hours: false },
};

const shiftOrder: DayShift['shift'][] = ['none', 'morning', 'afternoon', 'night', 'free'];

export default function Shifts() {
  const { state, setState } = useApp();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month for grid alignment (week starts Monday)
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7; // 0=Mon
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);

  const getShift = (dateStr: string): DayShift['shift'] => {
    return state.shifts.find(s => s.date === dateStr)?.shift || 'none';
  };

  const toggleShift = (dateStr: string) => {
    const current = getShift(dateStr);
    const idx = shiftOrder.indexOf(current);
    const next = shiftOrder[(idx + 1) % shiftOrder.length];
    setState(s => {
      const filtered = s.shifts.filter(sh => sh.date !== dateStr);
      if (next === 'none') return { ...s, shifts: filtered };
      return { ...s, shifts: [...filtered, { date: dateStr, shift: next }] };
    });
  };

  // Compliance calculation: find cycles between free days
  const cycles = useMemo(() => {
    const sorted = [...state.shifts]
      .filter(s => s.shift !== 'none')
      .sort((a, b) => a.date.localeCompare(b.date));

    if (sorted.length === 0) return [];

    const result: { start: string; end: string; hours: number; overLimit: boolean }[] = [];
    let cycleStart: string | null = null;
    let hoursAccum = 0;

    for (const s of sorted) {
      if (s.shift === 'free') {
        if (cycleStart !== null && hoursAccum > 0) {
          result.push({
            start: cycleStart,
            end: s.date,
            hours: hoursAccum,
            overLimit: hoursAccum > state.weeklyHours,
          });
        }
        cycleStart = null;
        hoursAccum = 0;
      } else {
        if (cycleStart === null) cycleStart = s.date;
        hoursAccum += state.shiftDuration;
      }
    }

    // Open cycle (no closing free day yet)
    if (cycleStart !== null && hoursAccum > 0) {
      result.push({
        start: cycleStart,
        end: sorted[sorted.length - 1].date,
        hours: hoursAccum,
        overLimit: hoursAccum > state.weeklyHours,
      });
    }

    return result;
  }, [state.shifts, state.weeklyHours, state.shiftDuration]);

  return (
    <div className="space-y-4 pt-2 max-w-lg mx-auto">
      {/* Config */}
      <div className="m3-surface p-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[120px]">
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
        <div className="flex-1 min-w-[120px]">
          <p className="text-xs text-muted-foreground mb-1">Duración turno</p>
          <select
            value={state.shiftDuration}
            onChange={e => setState(s => ({ ...s, shiftDuration: Number(e.target.value) as any }))}
            className="w-full h-9 rounded-2xl bg-secondary border border-border px-3 text-sm text-foreground"
          >
            <option value={7.5}>7.5 horas</option>
            <option value={6.5}>6.5 horas</option>
          </select>
        </div>
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
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
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
            return (
              <button
                key={dateStr}
                onClick={() => toggleShift(dateStr)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all active:scale-95 ${
                  cfg.color || 'hover:bg-secondary text-foreground'
                } ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
              >
                <span className="text-[10px] opacity-70">{format(day, 'd')}</span>
                {cfg.short && <span className="text-[10px] font-bold">{cfg.short}</span>}
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
              className={`m3-surface p-4 border-l-4 ${
                cycle.overLimit ? 'border-l-destructive' : 'border-l-success'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(cycle.start + 'T12:00'), 'dd/MM')} — {format(new Date(cycle.end + 'T12:00'), 'dd/MM')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cycle.hours}h trabajadas / {state.weeklyHours}h máximo
                  </p>
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
