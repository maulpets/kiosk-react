// Employee data types
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  avatar?: string;
  permissions: string[];
  shift: {
    start: string;
    end: string;
    breakDuration: number;
  };
}

// Operation/Navigation types
export interface TransferLevel {
  wgLevel: number;
  name: string;
  plural: string;
  captionUses: string;
  options?: TransferOption[];
}

export interface TransferOption {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  icon?: string;
  nativeAction?: string;
  transferRendering?: TransferRendering;
}

export interface TransferRendering {
  caption: string;
  levels: TransferLevel[];
}

export interface SubOperation {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  nativeAction: string;
  transferRendering?: TransferRendering;
}

// Base operation interface
// interface BaseOperation {
//   id: string;
//   name: string;
//   description: string;
//   icon: string;
//   enabled: boolean;
//   operation: number;
//   requiresPermission?: string;
//   route?: string;
//   nativeAction?: string;
// }

// // Operation with sub-operations (like punch-in/punch-out)
// interface SubOperationOperation extends BaseOperation {
//   operation: 1; // Sub-operation type
//   subOperations?: SubOperation[];
// }

// // Transfer operation specific interface
// interface TransferOperation extends BaseOperation {
//   operation: 2; // Transfer operation type
//   transType: number;
//   xferStyle: number;
//   wgRendering: {
//     levels: TransferLevel[];
//   };
// }

// // General operation (like view timecard, notes, tips)
// interface GeneralOperation extends BaseOperation {
//   operation: 0; // General operation type
// }

// Union type for all operations
// export type Operation = SubOperationOperation | TransferOperation | GeneralOperation;

// Action items types
export type ActionItemType = 'training' | 'safety' | 'review' | 'update' | 'task';
export type ActionItemPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ActionItem {
  id: string;
  type: ActionItemType;
  title: string;
  description: string;
  priority: ActionItemPriority;
  dueDate?: string;
  estimatedMinutes?: number;
  route?: string;
  nativeAction?: string;
}

// Time card types
// export type TimeCardStatus = 'in-progress' | 'completed' | 'pending-approval';

// export interface TimeCardEntry {
//   id: string;
//   date: string;
//   clockIn?: string;
//   clockOut?: string;
//   breakStart?: string;
//   breakEnd?: string;
//   totalHours?: number;
//   status: TimeCardStatus;
// }

// export interface TimeCard {
//   currentEntry?: TimeCardEntry;
//   weeklyEntries: TimeCardEntry[];
//   weeklyTotal: number;
//   overtimeHours: number;
//   isOnBreak: boolean;
//   nextScheduledShift?: {
//     date: string;
//     start: string;
//     end: string;
//   };
// }

// System information types
export interface SystemInfo {
  timestamp: string;
  timezone: string;
  version: string;
  features: string[];
}

// // Legacy interfaces for backward compatibility with existing components
// export interface LegacyEmployee {
//   id: string;
//   name: string;
//   email: string;
//   department: string;
//   role: string;
//   avatar?: string;
//   permissions: string[];
//   shift: {
//     start: string;
//     end: string;
//     breakDuration: number;
//   };
// }

// export interface LegacyKioskStartupResponse {
//   employee: LegacyEmployee;
//   operations: Operation[];
//   actionItems: ActionItem[];
//   timeCard: TimeCard;
//   systemInfo: SystemInfo;
// }
