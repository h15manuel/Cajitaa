export enum EntryType {
  DEPOSIT = 'DEPOSIT',
  TIP = 'TIP',
  CREDIT = 'CREDIT',
}

export interface CashEntry {
  id: string;
  type: EntryType;
  amount: number;
  cashier?: string;
  company?: string;
  observation?: string;
  date: string; // ISO string
  time: string; // HH:mm
}

export interface Company {
  id: string;
  name: string;
  rut: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  type: 'truck' | 'car' | 'pickup';
  companyId: string;
}

export interface ShiftRecord {
  id: string;
  closedAt: string; // ISO string
  date: string; // shift date
  zAmount: number;
  tipsTotal: number;
  cashDrawer: number;
  depositsTotal: number;
  efectivoReal: number;
  meta: number;
  diferencia: number;
  status: 'cuadrada' | 'sobrante' | 'faltante';
  entries: CashEntry[];
}

export interface DayShift {
  date: string;
  shift: 'morning' | 'afternoon' | 'night' | 'free' | 'none';
  hours?: 7.5 | 6.5; // per-day duration, defaults to 7.5
}

export interface AppState {
  zAmount: number;
  tipsTotal: number;
  cashDrawer: number;
  entries: CashEntry[];
  companies: Company[];
  vehicles: Vehicle[];
  shifts: DayShift[];
  shiftHistory: ShiftRecord[];
  shieldMode: boolean;
  weeklyHours: 44 | 42 | 40;
  /** @deprecated Use per-day hours in DayShift instead */
  shiftDuration: 7.5 | 6.5;
}

export const defaultAppState: AppState = {
  zAmount: 0,
  tipsTotal: 0,
  cashDrawer: 0,
  entries: [],
  companies: [],
  vehicles: [],
  shifts: [],
  shiftHistory: [],
  shieldMode: false,
  weeklyHours: 44,
  shiftDuration: 7.5,
};
