// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  KIOSK_EMPLOYEE_DATA: '/api/v1/kiosk-employee-data',
  KIOSK_COMPANY_SETUP: '/api/v1/company-setup',
  KIOSK_TIME_CARD: '/api/v1/time-card',
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  SETUP: '/setup',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SIMPLETEST:'/simple-test',
  TEST_API: '/test-api',
  PUNCH_IN: '/punch-in',
  PUNCH_OUT: '/punch-out',
  TIMECARD: '/timecard',
  TIPS: '/tips',
} as const;

// WebView message types
export const MESSAGE_TYPES = {
  // From Web to Native
  WEB_READY: 'WEB_READY',
  WEB_ACTION: 'WEB_ACTION',
  WEB_RESPONSE: 'WEB_RESPONSE',
  
  // From Native to Web
  NATIVE_ACTION: 'NATIVE_ACTION',
  NATIVE_RESPONSE: 'NATIVE_RESPONSE',
  NATIVE_ERROR: 'NATIVE_ERROR',
} as const;

// App configuration
export const APP_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  APP_NAME: 'Kiosk React App',
  VERSION: '1.0.0',
} as const;
