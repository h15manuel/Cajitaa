import React from 'react';
import { CalendarDays } from 'lucide-react';

export default function Shifts() {
  return (
    <div className="space-y-4 pt-2 max-w-lg mx-auto">
      <div className="text-center py-16 text-muted-foreground">
        <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium">Calendario de Turnos</p>
        <p className="text-sm mt-1">Próximamente: gestión de turnos con cumplimiento legal</p>
      </div>
    </div>
  );
}
