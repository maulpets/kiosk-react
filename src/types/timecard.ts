/**
 * Time Card related types
 * These types are used across timecard functionality, API routes, and hooks
 */

// Transaction Types
export interface TimeCardTransaction {
  time: string;
  type: string;
  department: string;
  notes: string;
  transType: number;
  timestamp: string;
  station?: number;
}

// Time Entry Types
export interface TimeEntry {
  id: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakTime?: number;
  totalHours?: number;
  status: 'completed' | 'in-progress' | 'pending';
  project?: string;
  notes?: string;
  workedShifts: number;
  payLines: number;
  adjustments: number;
  transactions?: TimeCardTransaction[];
}

// Weekly Time Card Data
export interface WeeklyTimeCardData {
  weekStart: string;
  weekEnd: string;
  entries: TimeEntry[];
  totalHours: number;
  overtimeHours: number;
  regularHours: number;
  employeeId: string;
  employeeName: string;
  payPeriod: string;
  payClass?: string;
  department?: string;
  position?: string;
  payPeriodInfo?: PayPeriodInfo;
}

// API Response Types
export interface TimeCardApiResponse {
  success: boolean;
  data: WeeklyTimeCardData;
  message?: string;
}

// Request Types
export interface TimeCardRequest {
  payPeriod: 'current' | 'previous';
  employeeId?: string;
}

// Hook Result Types
export interface UseTimeCardResult {
  data: WeeklyTimeCardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Status Types
export type TimeCardStatus = 'completed' | 'in-progress' | 'pending-approval' | 'draft';

// Pay Period Info
export interface PayPeriodInfo {
  id: string;
  name: string;
  begins: string;
  ends: string;
  isCurrent: boolean;
}

// Raw Mock Data Types for Processing
export interface RawTransaction {
  timestamp: string;
  transType: number;
  station?: number;
}

export interface RawWorkedShift {
  transactions?: {
    actual?: RawTransaction[];
  };
}

export interface RawDayData {
  date: string;
  workedShifts: RawWorkedShift[];
  payLines: Array<{ dop: number }>;
  adjustments: Array<{ prevEffTime: string }>;
  notes: Array<{ note: string }>;
  distributed: unknown[];
  summaries: unknown[];
  incidents: unknown[];
  notifConds: unknown[];
  dailyExceptions: unknown[];
  schedules: unknown[];
}

export interface RawMockData {
  basics: {
    filekey: number;
    lastName: string;
    firstName: string;
    middle: string;
    idnum: string;
    badge: number;
    homeWg: {
      description: string;
      workPositionWgName: string;
      workPositionWgCode: string;
      workPositionName: string;
      workPositionAbb: string;
      levels: Array<{
        wgLevel: number;
        wgNum: number;
        caption: string;
      }>;
    };
  };
  payPeriod: {
    general: {
      payClass: {
        id: number;
        name: string;
        effective: string;
      };
      wasApproved: boolean;
      wasEmployeeApproved: boolean;
      isSecure: boolean;
      payPeriodLength: number;
      compType: number;
      periods: {
        this: { begins: string; ends: string };
        previous: { begins: string; ends: string };
        current: { begins: string; ends: string };
        next: { begins: string; ends: string };
      };
    };
    days: RawDayData[];
  };
}
