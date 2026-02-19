import { useState, useEffect, useCallback } from 'react';
import { AppState, CashEntry, defaultAppState } from '@/types';

const STORAGE_KEY = 'caja-control-state';

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultAppState, ...JSON.parse(saved) };
    }
  } catch {}
  return defaultAppState;
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setZAmount = useCallback((v: number) => setState(s => ({ ...s, zAmount: v })), []);
  const setCashDrawer = useCallback((v: number) => setState(s => ({ ...s, cashDrawer: v })), []);
  const toggleShield = useCallback(() => setState(s => ({ ...s, shieldMode: !s.shieldMode })), []);

  const closeShift = useCallback(() => {
    setState(s => ({ ...s, zAmount: 0, tipsTotal: 0, cashDrawer: 0, entries: [] }));
  }, []);

  const addEntry = useCallback((entry: CashEntry) => {
    setState(s => {
      const newEntries = [...s.entries, entry];
      const tipsTotal = newEntries
        .filter(e => e.type === 'TIP')
        .reduce((sum, e) => sum + e.amount, 0);
      return { ...s, entries: newEntries, tipsTotal };
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setState(s => {
      const newEntries = s.entries.filter(e => e.id !== id);
      const tipsTotal = newEntries
        .filter(e => e.type === 'TIP')
        .reduce((sum, e) => sum + e.amount, 0);
      return { ...s, entries: newEntries, tipsTotal };
    });
  }, []);

  // Computed values
  const depositsTotal = state.entries
    .filter(e => e.type === 'DEPOSIT')
    .reduce((sum, e) => sum + e.amount, 0);

  const meta = state.zAmount - state.tipsTotal;
  const efectivoReal = depositsTotal + state.cashDrawer;
  const diferencia = efectivoReal - meta;

  const status: 'cuadrada' | 'sobrante' | 'faltante' =
    diferencia === 0 ? 'cuadrada' : diferencia > 0 ? 'sobrante' : 'faltante';

  return {
    state,
    setState,
    setZAmount,
    setCashDrawer,
    toggleShield,
    closeShift,
    addEntry,
    deleteEntry,
    depositsTotal,
    meta,
    efectivoReal,
    diferencia,
    status,
  };
}
