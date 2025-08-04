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
  ptoHours?: number;
  overtimeHours?: number;
  ptoType?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  scheduledHours?: number;
  // Enhanced data from raw API - optional for backwards compatibility
  rawNotes?: Array<{
    itemdata?: number;
    memoText?: string;
    memoNoteCatId?: number;
    uniqueId?: number;
  }>;
  rawPayLines?: Array<{
    dop: number;
    payDes?: {
      name?: string;
      abb?: string;
      multiplier?: number;
      num?: number;
      isHours?: boolean;
      memberships?: string[];
    };
    hundHours?: number;
    hours?: number;
    rate?: number | null;
    dollars?: number | null;
    wg?: {
      description?: string;
      workPositionName?: string;
    };
  }>;
  rawAdjustments?: Array<{
    editType?: number;
    hours?: number;
    hundHours?: number;
    aeUserCode?: string;
    timestamp?: string;
    cancelled?: boolean;
    uniqueId?: number;
  }>;
  dailyExceptions?: Array<{
    name?: string;
    hours?: number;
    hundHours?: number;
    shiftException?: number;
  }>;
  distributed?: Array<{
    payDes?: {
      name?: string;
      abb?: string;
      hours?: number;
      hundHours?: number;
    };
    wg?: {
      description?: string;
      workPositionName?: string;
    };
  }>;
  summaries?: Array<{
    payDes?: {
      name?: string;
      abb?: string;
      hours?: number;
      hundHours?: number;
    };
  }>;
  incidents?: Array<{
    [key: string]: unknown;
  }>;
  notifConds?: Array<{
    uniqueId: number;
  }>;
  scheduleDetails?: Array<{
    date?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    confirmState?: string;
    hundHours?: number;
  }>;
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
  periodSummaries?: PeriodSummaries;
  rawPayPeriods?: {
    previous?: { begins?: string; ends?: string };
    current?: { begins?: string; ends?: string };
    next?: { begins?: string; ends?: string };
    this?: { begins?: string; ends?: string };
  };
}

// API Response Types
export interface TimeCardApiResponse {
  success: boolean;
  data: WeeklyTimeCardData;
  message?: string;
}

// Request Types
export interface TimeCardRequest {
  payPeriod: 'current' | 'previous' | 'next';
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

// Period Summary Types for API data
export interface PeriodSummaryDetail {
  payDes?: {
    num?: number;
    name?: string;
    abb?: string;
    multiplier?: number;
    isHours?: boolean;
    memberships?: string[];
  };
  hours?: number;
  hundHours?: number;
  rate?: number | null;
  dollars?: number | null;
  wg?: {
    description?: string;
    workPositionWgName?: string;
    workPositionWgCode?: string;
    workPositionName?: string;
    workPositionAbb?: string;
  };
}

export interface PeriodSummaryByPayDes {
  payDes?: {
    num?: number;
    name?: string;
    abb?: string;
    multiplier?: number;
    isHours?: boolean;
    memberships?: string[];
  };
  hours?: number;
  hundHours?: number;
  dollars?: number | null;
}

export interface PeriodSummaries {
  detail?: PeriodSummaryDetail[];
  distributed?: PeriodSummaryDetail[];
  byPayDes?: PeriodSummaryByPayDes[];
}

// Extended type for day detail modal to include raw API data
export interface DayDetailData {
  date?: string;
  clockIn?: string;
  clockOut?: string;
  totalHours?: number;
  status?: string;
  transactions?: Array<{
    time?: string;
    type?: string;
    notes?: string;
    department?: string;
  }>;
  ptoHours?: number;
  ptoType?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  scheduledHours?: number;
  payLines?: Array<{
    payDes?: { name?: string; abb?: string };
    hours?: number;
    hundHours?: number;
    wg?: { workPositionName?: string; description?: string };
  }>;
  adjustments?: Array<{
    editType?: number;
    hours?: number;
    hundHours?: number;
    aeUserCode?: string;
    timestamp?: string;
    cancelled?: boolean;
  }>;
  dailyExceptions?: Array<{
    name?: string;
    hours?: number;
    hundHours?: number;
    shiftException?: number;
  }>;
  notes?: Array<{
    itemdata?: number;
    memoText?: string;
    memoNoteCatId?: number;
  }>;
  distributed?: unknown[];
  summaries?: unknown[];
  incidents?: unknown[];
  notifConds?: unknown[];
  schedules?: unknown[];
  // Enhanced data from TimeEntry - includes both old and new property names for compatibility
  rawNotes?: Array<{
    itemdata?: number;
    memoText?: string;
    memoNoteCatId?: number;
    uniqueId?: number;
  }>;
  rawPayLines?: Array<{
    dop: number;
    payDes?: {
      name?: string;
      abb?: string;
      multiplier?: number;
      num?: number;
      isHours?: boolean;
      memberships?: string[];
    };
    hundHours?: number;
    hours?: number;
    rate?: number | null;
    dollars?: number | null;
    wg?: {
      description?: string;
      workPositionName?: string;
    };
  }>;
  rawAdjustments?: Array<{
    editType?: number;
    hours?: number;
    hundHours?: number;
    aeUserCode?: string;
    timestamp?: string;
    cancelled?: boolean;
    uniqueId?: number;
  }>;
}

// Raw Mock Data Types for Processing
export interface RawTransaction {
  timestamp: string;
  transType: number;
  station?: number;
}

export interface RawWorkedShift {
  hours?: number;
  hundHours?: number;
  grossHours?: number;
  dop?: number;
  dow?: number;
  scheduled?: boolean;
  hasWorkSchedule?: boolean;
  hasFlexSchedule?: boolean;
  isWorkedHoliday?: boolean;
  transactions?: {
    actual?: RawTransaction[];
    rounded?: RawTransaction[];
  };
}

export interface RawDayData {
  date: string;
  workedShifts: RawWorkedShift[];
  payLines: Array<{ 
    dop: number;
    payDes?: {
      name?: string;
      abb?: string;
      multiplier?: number;
      num?: number;
      isHours?: boolean;
      memberships?: string[];
    };
    hundHours?: number;
    hours?: number;
    rate?: number | null;
    dollars?: number | null;
    wg?: {
      description?: string;
      workPositionWgName?: string;
      workPositionWgCode?: string;
      workPositionName?: string;
      workPositionAbb?: string;
      levels?: Array<{
        wgLevel: number;
        wgNum: number;
        caption: string;
      }>;
    };
    date?: string;
  }>;
  adjustments: Array<{ 
    prevEffTime: string;
    editType?: number;
    hours?: number;
    hundHours?: number;
    aeUserCode?: string;
    timestamp?: string;
    cancelled?: boolean;
    filekey?: number;
    effDate?: string;
    effTime?: string;
    uniqueId?: number;
    payDes?: unknown;
    prevPayDes?: unknown;
    rate?: number | null;
    dollars?: number | null;
    wg?: unknown;
    prevWg?: unknown;
    cancelledBy?: string | null;
    cancelledOn?: string | null;
    prevEffDate?: string;
  }>;
  notes: Array<{ 
    itemdata?: number;
    memoText?: string;
    memoNoteCatId?: number;
    uniqueId?: number;
  }>;
  schedules: Array<{
    date?: string;
    startTime?: string;
    endTime?: string;
    schHours?: number;
    hundHours?: number;
    pattern?: number;
    schStyle?: number;
    schTypeId?: number;
    payDesNum?: number | null;
    benefitNum?: number | null;
    rate?: number | null;
    isXfer?: boolean;
    uniqueId?: number;
    lunchSize?: number;
    description?: string;
    notes?: string;
    schNote?: string;
    confirmStateId?: number;
    confirmState?: string;
    confirmedOn?: string | null;
    schTmplt?: unknown;
    schPosSch?: unknown;
    schGuid?: unknown;
    isAdHoc?: boolean | null;
    notePkgId?: unknown;
    agentEmpGuid?: unknown;
    agentEmpAppOn?: unknown;
    agentEmpAppBy?: unknown;
    payPkgGuid?: unknown;
    payPkgAppOn?: unknown;
    payPkgAppBy?: unknown;
    payPkgDescr?: unknown;
    wg?: {
      description?: string;
      workPositionWgName?: string;
      workPositionWgCode?: string;
      workPositionName?: string;
      workPositionAbb?: string;
      levels?: Array<{
        wgLevel: number;
        wgNum: number;
        caption: string;
      }>;
    };
  }>;
  distributed: Array<{
    payDes?: {
      num?: number;
      name?: string;
      abb?: string;
      multiplier?: number;
      isHours?: boolean;
      memberships?: string[];
    };
    hours?: number;
    hundHours?: number;
    dollars?: number | null;
    wg?: {
      description?: string;
      workPositionWgName?: string;
      workPositionWgCode?: string;
      workPositionName?: string;
      workPositionAbb?: string;
      levels?: Array<{
        wgLevel: number;
        wgNum: number;
        caption: string;
      }>;
    };
  }>;
  summaries: Array<{
    payDes?: {
      num?: number;
      name?: string;
      abb?: string;
      multiplier?: number;
      isHours?: boolean;
      memberships?: string[];
    };
    hours?: number;
    hundHours?: number;
    dollars?: number | null;
  }>;
  incidents: Array<{
    // Based on the data, incidents appears to always be empty arrays
    // Structure TBD when actual incident data is available
    [key: string]: unknown;
  }>;
  notifConds: Array<{
    uniqueId: number;
    // Additional fields may exist but only uniqueId is visible in the data
  }>;
  dailyExceptions: Array<{
    shiftException?: number;
    dop?: number;
    date?: string | null;
    payDes?: unknown;
    hours?: number;
    hundHours?: number;
    name?: string;
    shiftNum?: number;
    supCode?: number;
    benefitNum?: number;
    histException?: number;
    wg?: {
      description?: string;
      workPositionWgName?: string;
      workPositionWgCode?: string;
      workPositionName?: string;
      workPositionAbb?: string;
      levels?: Array<{
        wgLevel: number;
        wgNum: number;
        caption: string;
      }>;
    };
  }>;
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
    periodSummaries?: PeriodSummaries;
    days: RawDayData[];
  };
}
