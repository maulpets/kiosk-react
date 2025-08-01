// Internationalization types
export type Locale = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';

export interface TranslationKeys {
  // Common
  common: {
    loading: string;
    error: string;
    cancel: string;
    confirm: string;
    back: string;
    next: string;
    skip: string;
    logout: string;
    welcome: string;
    continue: string;
    save: string;
    edit: string;
    delete: string;
    search: string;
    select: string;
    clear: string;
    retry: string;
    close: string;
  };

  // Header
  header: {
    selectLanguage: string;
    toggleTheme: string;
  };

  // Setup
  setup: {
    title: string;
    subtitle: string;
    organizationLabel: string;
    organizationPlaceholder: string;
    setupButton: string;
    setupProgress: string;
    connectionStatus: {
      connected: string;
      standalone: string;
    };
    examples: string;
  };

  // Login
  login: {
    title: string;
    subtitle: string;
    badgeLabel: string;
    badgePlaceholder: string;
    pinLabel: string;
    pinPlaceholder: string;
    loginButton: string;
    forgotCredentials: string;
    invalidCredentials: string;
    employeeId: string;
    password: string;
    enterEmployeeId: string;
    enterPassword: string;
    useKeypadEmployeeId: string;
    useKeypadPassword: string;
    testCredentials: string;
    backToEmployeeId: string;
    stepOfTwo: string;
    connectedToNative: string;
    runningStandalone: string;
    pleaseEnterPassword: string;
    pleaseEnterValidEmployeeId: string;
    loginFailedCheckCredentials: string;
    unknownUser: string;
    defaultUser: string;
    defaultEmail: string;
    defaultRole: string;
    defaultDepartment: string;
    defaultPermissions: string;
    loginInProgress: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    welcome: string;
    recentActivity: string;
    actionItems: string;
    noRecentActivity: string;
    noActionItems: string;
    selectAction: string;
    punchInPrompt: string;
    styleTestingMode: string;
    backToMainMenu: string;
    recentTimeActivity: string;
    badge: string;
    punchedInFor: string;
    notClockedIn: string;
    inProgress: string;
    appStore: string;
    googlePlay: string;
    errorLoadingData: string;
    unknownError: string;
    workEmail: string;
    getTheApp: string;
    getMyAttendanceManager: string;
    timeCard: string;
    timeCardDesc: string;
  };

  // Operations
  operations: {
    punchIn: string;
    punchOut: string;
    transfer: string;
    viewTimecard: string;
    sendNote: string;
    tips: string;
    actionRequired: string;
  };

  // Transfer
  transfer: {
    title: string;
    subtitle: string;
    currentSelection: string;
    confirmTitle: string;
    confirmSubtitle: string;
    transferDetails: string;
    notAvailable: string;
    searchPlaceholder: string;
    noResults: string;
    clearSearch: string;
    skipTransfers: string;
    continueWithTransfer: string;
    clickToEdit: string;
  };

  // Punch Operations
  punch: {
    confirmTitle: string;
    whatHappensNext: string;
    employeeInformation: string;
    callbackOption: string;
    transferSelections: string;
    processing: string;
    pleaseWait: string;
    invalidOperation: string;
    returnToDashboard: string;
    selectCallback: string;
    callbackSubtitle: string;
  };

  // Time formatting
  time: {
    formats: {
      date: Intl.DateTimeFormatOptions;
      time: Intl.DateTimeFormatOptions;
      datetime: Intl.DateTimeFormatOptions;
    };
  };

  // Errors
  errors: {
    generic: string;
    network: string;
    unauthorized: string;
    notFound: string;
    serverError: string;
    offline: string;
  };
}
