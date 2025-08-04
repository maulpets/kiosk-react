/**
 * Comprehensive types for Kiosk Startup API
 * These types match the actual API structure from the backend system
 */

// Work Group Types
export interface WorkGroupLevel {
  wgLevel: number;
  wgNum: number;
  caption: string;
}

export interface WorkGroup {
  description: string;
  workPositionWgName: string;
  workPositionWgCode: string;
  workPositionName: string;
  workPositionAbb: string;
  levels: WorkGroupLevel[];
}

// Personal Information Types
export interface Address {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  stateProv: string;
  postalCode: string;
  created: string;
  editing: {
    editable: boolean;
    presentInConfig: boolean;
  };
}

export interface PhoneNumber {
  phonePosIndex: number;
  phoneLabel: string;
  phoneNumber: string;
  editing: {
    editable: boolean;
    presentInConfig: boolean;
  };
}

export interface Email {
  emailPosIndex: number;
  emailLabel: string;
  emailAddress: string;
  editing: {
    editable: boolean;
    presentInConfig: boolean;
  };
}

export interface ContactInfo {
  phoneNumbers: PhoneNumber[];
  emails: Email[];
  devices: { platform: string; }[];
}

export interface PersonalInfo {
  address: Address;
  contactInfo: ContactInfo;
  emergency: {
    emergencyContact: string;
    editing: {
      editable: boolean;
      presentInConfig: boolean;
    };
  };
  customFields: unknown[];
  eula: {
    attest: boolean;
    lastModified: string;
    url: string | null;
  };
}

// Work Groups and Rendering Types
export interface WgRenderingLevel {
  wgLevel: number;
  name: string;
  plural: string;
  captionUses: string;
}

export interface WorkGroupItem {
  text: string;
  wgnum: number;
  code: string;
  name: string;
}

export interface WorkGroupsLevel {
  levelName: string;
  levelNamePlural: string;
  wgLevel: number;
  items: WorkGroupItem[];
}

export interface WorkGroups {
  levels: WorkGroupsLevel[];
}

// Transaction and Shift Types
export interface Transaction {
  timestamp: string;
  transType: number;
  station: number;
  id: string;
}

export interface MonitoredItems {
  arrival: {
    beforeStart?: boolean;
    afterStart: boolean;
  };
  departure: {
    beforeEnd?: boolean;
    afterEnd: boolean;
  };
  intervals: {
    inDiff?: number;
    outDiff?: number;
    inDiffRnd?: number;
    outDiffRnd: number;
  };
  shiftExceptions: unknown[];
  breakEvents: unknown[];
  zones: unknown[];
  nonWorkedEvents: unknown[];
}

export interface WorkedShift {
  date: string;
  dop: number;
  dow: number;
  grossHours: number;
  hours: number;
  hundHours: number;
  shiftNum: number;
  scheduled: boolean;
  hasWorkSchedule: boolean;
  hasFlexSchedule: boolean;
  isWorkedHoliday: boolean;
  isOddPunchState: boolean;
  isVirtualShift: boolean;
  lastPunchState: number;
  active: boolean;
  transactions: {
    count: number;
    actual: Transaction[];
    rounded: unknown[];
  };
  monitoredItems: MonitoredItems;
}

// Operation Types
export interface PromptSelection {
  id: number;
  caption: string;
}

export interface Operation {
  operation: number;
  description: string;
  caption: string;
  fkeyguid: string; // This is the unique identifier for operations
  hint: string;
  icon: string;
  prerequisites?: {
    captureGps: boolean;
    faceVerify: boolean;
    geoZone: boolean;
    autoXfer: boolean;
    transRuleGuid?: string;
    requireGps: boolean;
    enabled: boolean;
  };
  prompts?: {
    askForTransType: boolean;
    defaultTransType: number;
    selections: PromptSelection[];
    askForCallback?: boolean;
    defaultCallback?: number;
    callbackSelections?: PromptSelection[];
    askForXfer?: boolean;
    xferOperation?: Operation;
    defaultWg?: unknown;
  };
  alsoPunch?: boolean;
  transType?: number;
  callbackTransType?: number;
  xferStyle?: number;
  xferStyleDescr?: string;
  wgRendering?: {
    caption: string;
    levels: WgRenderingLevel[];
  };
  tip1?: {
    prompt: boolean;
    caption: string;
    hint: string;
    payDesId: number;
  };
  tip2?: {
    prompt: boolean;
    caption: string;
    hint: string;
    payDesId: number;
  };
  promptForEffDate?: boolean;
  memo?: string;
  days?: number;
  catA?: {
    prompt: boolean;
    caption: string;
    defaultId: number;
    selections: unknown[];
  };
  catB?: {
    prompt: boolean;
    caption: string;
    defaultId: number;
    selections: unknown[];
  };
}

// Context Types
export interface Context {
  focusDate: string;
  currentTime: string;
  demoMode: boolean;
  previousPeriodBegins: string;
  previousPeriodEnds: string;
  currentPeriodBegins: string;
  currentPeriodEnds: string;
  workedShifts: WorkedShift[];
  impliedStation: number;
  maySetAvailability: boolean;
  canSeeCoWorkerSch: boolean;
  canSeeOpenAssignments: boolean;
  canSeeOpenSchedules: boolean;
  openSchWGLevel: number;
  inOutStateId: number;
  defaultWg: WorkGroup;
  operations: Operation[];
}

// Main Response Type
export interface KioskStartupResponse {
  basics: {
    filekey: number;
    lastName: string;
    firstName: string;
    middle: string;
    idnum: string;
    badge: number;
    homeWg: WorkGroup;
    homeWgSet: {
      levels: Array<{
        wgLevel: number;
        wgNum: number;
      }>;
    };
    homeWgEffDate: string;
  };
  personalInfo: PersonalInfo;
  profileInfo: ProfileInfo;
  company: unknown;
  time: unknown;
  workGroups: WorkGroups;
  application: unknown;
  operator: unknown;
  schStyles: unknown[];
  context: Context;
}

// Transfer Operation Types (for TransferFlow component)
export interface TransferOperation {
  operation: number;
  description: string;
  caption: string;
  fkeyguid: string;
  hint: string;
  icon: string;
  alsoPunch?: boolean;
  transType?: number;
  callbackTransType?: number;
  xferStyle?: number;
  xferStyleDescr?: string;
  wgRendering?: {
    caption: string;
    levels: WgRenderingLevel[];
  };
}

// Profile Info Types
export interface AvailablePlace {
  wgName: string;
  wgCode: string;
  wgNum: number;
}

export interface CustomProperty {
  name: string;
  value: string;
  id: string;
  type: string;
  label: string;
}

export interface StationProperties {
  impliedStationNum: number;
  punchTZXLateMode: number;
  showPunchMode: number;
  transAcceptedText: string;
  currentTimeMode: number;
  showCorpTimeStamp: boolean;
  auxDataCapFields: unknown[];
  empReviewTiles: unknown[];
}

export interface ScheduleConfirmation {
  reapproveOnChgNotes: boolean;
  doesConfirmSchs: boolean;
  confirmPattSchs: boolean;
  unConfSchDays: number;
}

export interface OnboardingInvitation {
  invtModeId: number;
  invtPeriodDays: number;
  invtMaxTrys: number;
  invtMinHrs: number;
  invtDOHBias: number;
}

export interface RestClass {
  classNum: number;
  BSTEnabled: boolean;
  BSTBegin: number;
  BSTEnd: number;
  ASTEnabled: boolean;
  ASTBegin: number;
  ASTEnd: number;
  BETEnabled: boolean;
  BETBegin: number;
  BETEnd: number;
  AETEnabled: boolean;
  AETBegin: number;
  AETEnd: number;
  MinOutEnabled: boolean;
  RestFlexEnabled: boolean;
}

export interface Operational {
  minimumLeaveRequestDate: string;
  maximumLeaveRequestDate: string;
  currentPayPeriodBeginDate: string;
  currentPayPeriodEndDate: string;
  previousPayPeriodBeginDate: string;
  previousPayPeriodEndDate: string;
  nextPayPeriodBeginDate: string;
  nextPayPeriodEndDate: string;
  availability: {
    earliestAllowedDate: string;
    daysFormulaId: number;
    days: number;
  };
}

export interface ProfileInfo {
  profileName: string;
  guid: string;
  createdBy: string;
  sheetId: number;
  sheetName: string;
  allSheets: boolean;
  schSheetId: number;
  arcSheetId: number;
  benSheetId: number;
  piSheetId: number;
  piSheetName: string;
  msgSheetId: number;
  leaveSheetId: number;
  wgRendering: {
    caption: string;
    levels: WgRenderingLevel[];
  };
  enablePunchingRestrictions: boolean;
  enableOverrideRestrClass: boolean;
  wageAdvanceEnabled: boolean;
  empNameFormatId: number;
  timeCardApprovalEnabled: boolean;
  timeCardApprovalAsSupervisor: boolean;
  showRateOfOpenSch: boolean;
  idleTimeout: number;
  benefitPeriodId: number;
  approvalText: string;
  mayAddToWGSheet: boolean;
  daysBackForHistory: number;
  applyPaidLunch: boolean;
  schBuddyCoverage: boolean;
  inclPrintTimeCard: boolean;
  timeCardReportName: string;
  benefitPeriodName: string;
  benefitPeriodAbb: string;
  maySetAvailability: boolean;
  canSeeCoWorkerSch: boolean;
  canSeeOpenAssignments: boolean;
  canSeeOpenSchedules: boolean;
  openSchWGLevel: number;
  wageAdvance: boolean;
  preventChgPwd: boolean;
  stationProperties: StationProperties;
  scheduleConfirmation: ScheduleConfirmation;
  onboardingInvitation: OnboardingInvitation;
  restClass: RestClass;
  datedLabelRules: unknown[];
  customProperties: CustomProperty[];
  operational: Operational;
  availablePlaces: AvailablePlace[];
}

// Request Types
export interface KioskStartupRequest {
  employeeId: string;
  deviceId?: string;
  location?: string;
}

export interface KioskEmployeeDataRequest {
  employeeId: string;
}
