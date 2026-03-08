import { useEffect, useRef } from 'react';
import { AppState, DayShift } from '@/types';
import { format, addDays } from 'date-fns';

const shiftLabels: Record<string, string> = {
  morning: 'Mañana',
  afternoon: 'Tarde',
  night: 'Noche',
  free: 'Libre',
};

function getTomorrowShift(shifts: DayShift[]): DayShift | undefined {
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  return shifts.find(s => s.date === tomorrow && s.shift !== 'none');
}

export function useShiftNotifications(state: AppState) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNotifiedRef = useRef<string>('');

  useEffect(() => {
    if (!state.notificationsEnabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const now = new Date();
      const [hours, minutes] = state.notificationTime.split(':').map(Number);
      const target = new Date(now);
      target.setHours(hours, minutes, 0, 0);

      // If time already passed today, schedule for tomorrow
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      const delay = target.getTime() - now.getTime();
      const todayKey = format(target, 'yyyy-MM-dd') + state.notificationTime;

      timerRef.current = setTimeout(() => {
        if (lastNotifiedRef.current === todayKey) return;

        const shift = getTomorrowShift(state.shifts);
        if (shift) {
          const label = shiftLabels[shift.shift] || shift.shift;
          const hoursText = shift.hours ? ` (${shift.hours}h)` : '';
          const title = 'Turno mañana';
          const body = `Mañana tienes turno de ${label}${hoursText}`;

          if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/pwa-192x192.png' });
            lastNotifiedRef.current = todayKey;
          }
        }

        // Re-schedule for next day
        schedule();
      }, delay);
    };

    if (Notification.permission === 'granted') {
      schedule();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.notificationsEnabled, state.notificationTime, state.shifts]);
}
