import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCLP } from '@/lib/format';
import { EntryType, ShiftRecord } from '@/types';
import { ArrowDownCircle, CreditCard, Banknote, Trash2, CalendarDays, FileDown, ChevronDown, ChevronUp, Clock, Share2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function History() {
  const { state, deleteEntry, depositsTotal, meta, efectivoReal, diferencia, status } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedShift, setExpandedShift] = useState<string | null>(null);

  const dateStr = selectedDate.toISOString().split('T')[0];

  // Current active entries for this date
  const filtered = useMemo(() =>
    state.entries.filter(e => e.date === dateStr).reverse(),
    [state.entries, dateStr]
  );

  // Archived shifts for this date
  const archivedShifts = useMemo(() =>
    state.shiftHistory.filter(s => s.date === dateStr).reverse(),
    [state.shiftHistory, dateStr]
  );

  const icons = { DEPOSIT: ArrowDownCircle, TIP: Banknote, CREDIT: CreditCard };
  const colors = { DEPOSIT: 'text-primary', TIP: 'text-warning', CREDIT: 'text-info' };
  const labels = { DEPOSIT: 'Depósito', TIP: 'Propina', CREDIT: 'Crédito' };

  const dayTotal = filtered.reduce((s, e) => s + e.amount, 0);

  const statusLabels = { cuadrada: 'CUADRADA', sobrante: 'SOBRANTE', faltante: 'FALTANTE' };
  const statusColors = { cuadrada: 'text-green-500', sobrante: 'text-blue-500', faltante: 'text-destructive' };

  const shareWhatsApp = (shift: ShiftRecord) => {
    const closed = format(new Date(shift.closedAt), "d/MM/yyyy HH:mm", { locale: es });
    const lines = [
      `📋 *Cierre de Turno*`,
      `📅 ${closed}`,
      ``,
      `💰 *Monto Z:* ${formatCLP(shift.zAmount)}`,
      `🪙 *Propinas:* ${formatCLP(shift.tipsTotal)}`,
      `🎯 *Meta:* ${formatCLP(shift.meta)}`,
      ``,
      `📥 *Depósitos:* ${formatCLP(shift.depositsTotal)}`,
      `🗄️ *Gaveta:* ${formatCLP(shift.cashDrawer)}`,
      `💵 *Efectivo Real:* ${formatCLP(shift.efectivoReal)}`,
      ``,
      `📊 *Diferencia:* ${formatCLP(shift.diferencia)}`,
      `✅ *Estado:* ${statusLabels[shift.status]}`,
    ];

    if (shift.entries.length > 0) {
      lines.push(``, `📝 *Movimientos (${shift.entries.length}):*`);
      shift.entries.forEach(e => {
        const label = labels[e.type as EntryType] || e.type;
        const who = e.cashier || e.company || '';
        lines.push(`  • ${label} ${formatCLP(e.amount)}${who ? ` — ${who}` : ''}`);
      });
    }

    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    const primary = [26, 188, 156];

    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Control de Caja', 14, 16);
    doc.setFontSize(11);
    doc.text(`Reporte: ${format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}`, 14, 26);

    doc.setTextColor(60, 60, 60);
    let y = 45;

    // Export archived shifts
    archivedShifts.forEach((shift, idx) => {
      doc.setFontSize(12);
      doc.text(`Turno ${archivedShifts.length - idx} — Cerrado: ${format(new Date(shift.closedAt), 'HH:mm')}`, 14, y);
      y += 8;
      doc.setFontSize(10);
      const summary = [
        ['Monto Z', formatCLP(shift.zAmount)],
        ['Propinas', formatCLP(shift.tipsTotal)],
        ['Meta', formatCLP(shift.meta)],
        ['Depósitos', formatCLP(shift.depositsTotal)],
        ['Gaveta', formatCLP(shift.cashDrawer)],
        ['Efectivo Real', formatCLP(shift.efectivoReal)],
        ['Diferencia', formatCLP(shift.diferencia)],
        ['Estado', statusLabels[shift.status]],
      ];
      summary.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`, 14, y);
        y += 6;
      });

      if (shift.entries.length > 0) {
        const tableData = shift.entries.map(e => [
          e.time, labels[e.type], formatCLP(e.amount), e.cashier || e.company || '-', e.observation || '-',
        ]);
        (doc as any).autoTable({
          startY: y,
          head: [['Hora', 'Tipo', 'Monto', 'Responsable', 'Observación']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: primary, textColor: [255, 255, 255] },
          styles: { fontSize: 9 },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }
      y += 4;
    });

    // Current entries
    if (filtered.length > 0) {
      doc.setFontSize(12);
      doc.text('Movimientos Activos', 14, y);
      y += 6;
      const tableData = filtered.map(e => [
        e.time, labels[e.type], formatCLP(e.amount), e.cashier || e.company || '-', e.observation || '-',
      ]);
      (doc as any).autoTable({
        startY: y,
        head: [['Hora', 'Tipo', 'Monto', 'Responsable', 'Observación']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: primary, textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
      });
    }

    doc.save(`caja-${dateStr}.pdf`);
  };

  const hasContent = filtered.length > 0 || archivedShifts.length > 0;

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
        {hasContent && (
          <Button variant="outline" onClick={exportPDF} className="rounded-3xl h-12 gap-2 bg-card border-border">
            <FileDown className="w-4 h-4 text-primary" />
            PDF
          </Button>
        )}
      </div>

      {/* Archived shifts */}
      {archivedShifts.map((shift, idx) => (
        <div key={shift.id} className="m3-surface overflow-hidden animate-slide-up">
          <button
            onClick={() => setExpandedShift(expandedShift === shift.id ? null : shift.id)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">
                  Turno {archivedShifts.length - idx} · {format(new Date(shift.closedAt), 'HH:mm')}
                </p>
                <p className={`text-xs font-bold ${statusColors[shift.status]}`}>
                  {statusLabels[shift.status]} {formatCLP(Math.abs(shift.diferencia))}
                </p>
              </div>
            </div>
            {expandedShift === shift.id ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {expandedShift === shift.id && (
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              {/* Summary grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary/50 rounded-2xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Monto Z</p>
                  <p className="text-sm font-bold text-foreground">{formatCLP(shift.zAmount)}</p>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Propinas</p>
                  <p className="text-sm font-bold text-warning">{formatCLP(shift.tipsTotal)}</p>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Meta</p>
                  <p className="text-sm font-bold text-foreground">{formatCLP(shift.meta)}</p>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Efectivo Real</p>
                  <p className="text-sm font-bold text-foreground">{formatCLP(shift.efectivoReal)}</p>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Depósitos</p>
                  <p className="text-sm font-bold text-primary">{formatCLP(shift.depositsTotal)}</p>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Gaveta</p>
                  <p className="text-sm font-bold text-foreground">{formatCLP(shift.cashDrawer)}</p>
                </div>
              </div>

              {/* Share button */}
              <Button
                variant="outline"
                onClick={() => shareWhatsApp(shift)}
                className="w-full rounded-2xl gap-2 bg-secondary/50 border-border"
              >
                <Share2 className="w-4 h-4 text-green-500" />
                <span className="text-foreground text-sm">Compartir por WhatsApp</span>
              </Button>

              {/* Entries */}
              {shift.entries.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Movimientos</p>
                  {shift.entries.map(entry => {
                    const Icon = icons[entry.type];
                    return (
                      <div key={entry.id} className="flex items-center gap-3 bg-secondary/30 rounded-2xl p-2.5">
                        <Icon className={`w-4 h-4 ${colors[entry.type]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {labels[entry.type]} {entry.cashier && `· ${entry.cashier}`} {entry.company && `· ${entry.company}`}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{entry.time}</p>
                        </div>
                        <p className="text-xs font-bold text-foreground">{formatCLP(entry.amount)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Current active entries */}
      {filtered.length > 0 && (
        <>
          <div className="m3-surface p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Movimientos Activos</p>
              <p className="text-2xl font-bold text-foreground shield-blur">{formatCLP(dayTotal)}</p>
            </div>
            <p className="text-sm text-muted-foreground">{filtered.length} mov.</p>
          </div>

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
        </>
      )}

      {/* Empty state */}
      {!hasContent && (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Sin movimientos para esta fecha</p>
        </div>
      )}
    </div>
  );
}
