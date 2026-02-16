import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCLP } from '@/lib/format';
import { EntryType } from '@/types';
import { ArrowDownCircle, CreditCard, Banknote, Trash2, CalendarDays, FileDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function History() {
  const { state, deleteEntry, depositsTotal, meta, efectivoReal, diferencia, status } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dateStr = selectedDate.toISOString().split('T')[0];

  const filtered = useMemo(() =>
    state.entries.filter(e => e.date === dateStr).reverse(),
    [state.entries, dateStr]
  );

  const icons = { DEPOSIT: ArrowDownCircle, TIP: Banknote, CREDIT: CreditCard };
  const colors = { DEPOSIT: 'text-primary', TIP: 'text-warning', CREDIT: 'text-info' };
  const labels = { DEPOSIT: 'Depósito', TIP: 'Propina', CREDIT: 'Crédito' };

  const dayTotal = filtered.reduce((s, e) => s + e.amount, 0);

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    const primary = [26, 188, 156]; // teal

    // Header
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Control de Caja', 14, 16);
    doc.setFontSize(11);
    doc.text(`Reporte: ${format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}`, 14, 26);

    // Summary
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    let y = 45;
    doc.text('Resumen de Conciliación', 14, y);
    y += 8;
    doc.setFontSize(10);
    const summaryData = [
      ['Monto Z', formatCLP(state.zAmount)],
      ['Propinas', formatCLP(state.tipsTotal)],
      ['Meta (Z - Propinas)', formatCLP(meta)],
      ['Depósitos', formatCLP(depositsTotal)],
      ['Gaveta', formatCLP(state.cashDrawer)],
      ['Efectivo Real', formatCLP(efectivoReal)],
      ['Diferencia', formatCLP(diferencia)],
      ['Estado', status === 'cuadrada' ? 'CUADRADA' : status === 'sobrante' ? 'SOBRANTE' : 'FALTANTE'],
    ];
    summaryData.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 14, y);
      y += 6;
    });

    // Table
    y += 6;
    const tableData = filtered.map(e => [
      e.time,
      labels[e.type],
      formatCLP(e.amount),
      e.cashier || e.company || '-',
      e.observation || '-',
    ]);

    (doc as any).autoTable({
      startY: y,
      head: [['Hora', 'Tipo', 'Monto', 'Responsable', 'Observación']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primary, textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
    });

    doc.save(`caja-${dateStr}.pdf`);
  };

  return (
    <div className="space-y-4 pt-2 max-w-lg mx-auto">
      {/* Date picker */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="rounded-3xl gap-2 h-12 flex-1 justify-start bg-card border-border">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="text-foreground">{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-3xl" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {filtered.length > 0 && (
          <Button variant="outline" onClick={exportPDF} className="rounded-3xl h-12 gap-2 bg-card border-border">
            <FileDown className="w-4 h-4 text-primary" />
            PDF
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="m3-surface p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total del día</p>
          <p className="text-2xl font-bold text-foreground shield-blur">{formatCLP(dayTotal)}</p>
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} movimiento{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Entries list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Sin movimientos para esta fecha</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => {
            const Icon = icons[entry.type];
            return (
              <div key={entry.id} className="m3-surface p-4 animate-slide-up">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-2xl bg-secondary ${colors[entry.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{labels[entry.type]}</p>
                      <p className="font-bold text-foreground shield-blur">{formatCLP(entry.amount)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.time}
                      {entry.cashier && ` · ${entry.cashier}`}
                      {entry.company && ` · ${entry.company}`}
                    </p>
                    {entry.observation && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{entry.observation}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
