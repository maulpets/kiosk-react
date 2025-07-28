// Export company types
export * from './company';

// Core application types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department?: string;
  permissions?: string[];
  shift?: {
    start: string;
    end: string;
    breakDuration: number;
  };
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface AppState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  isConnectedToNative: boolean;
  language: string;
  isSetupComplete: boolean;
}

// Route definitions
export interface Route {
  path: string;
  title: string;
  component: React.ComponentType;
  requiresAuth?: boolean;
}
