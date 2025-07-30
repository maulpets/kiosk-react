'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { User, CompanyData } from '@/types';
import { KioskStartupResponse } from '@/types/kioskStartup';

interface AppState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isConnectedToNative: boolean;
  language: string;
  isSetupComplete: boolean;
  companyData: CompanyData | null;
  employeeData: KioskStartupResponse | null;
}

interface AppAction {
  type: string;
  payload?: unknown;
}

// Action types
export const APP_ACTIONS = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_NATIVE_CONNECTION: 'SET_NATIVE_CONNECTION',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_SETUP_COMPLETE: 'SET_SETUP_COMPLETE',
  SET_COMPANY_DATA: 'SET_COMPANY_DATA',
  SET_EMPLOYEE_DATA: 'SET_EMPLOYEE_DATA',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_STATE: 'RESET_STATE',
} as const;

// Initial state
const initialState: AppState = {
  user: null,
  isLoading: false,
  error: null,
  isConnectedToNative: false,
  language: 'en',
  isSetupComplete: false,
  companyData: null,
  employeeData: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case APP_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload as User | null,
      };
    
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload as boolean,
      };
    
    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload as string | null,
      };
    
    case APP_ACTIONS.SET_NATIVE_CONNECTION:
      return {
        ...state,
        isConnectedToNative: action.payload as boolean,
      };
    
    case APP_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload as string,
      };
    
    case APP_ACTIONS.SET_SETUP_COMPLETE:
      return {
        ...state,
        isSetupComplete: action.payload as boolean,
      };
    
    case APP_ACTIONS.SET_COMPANY_DATA:
      return {
        ...state,
        companyData: action.payload as CompanyData | null,
      };
    
    case APP_ACTIONS.SET_EMPLOYEE_DATA:
      return {
        ...state,
        employeeData: action.payload as KioskStartupResponse | null,
      };
    
    case APP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case APP_ACTIONS.RESET_STATE:
      return initialState;
    
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Action creators
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNativeConnection: (connected: boolean) => void;
  setLanguage: (language: string) => void;
  setSetupComplete: (complete: boolean) => void;
  setCompanyData: (companyData: CompanyData | null) => void;
  setEmployeeData: (employeeData: KioskStartupResponse | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators with useCallback to prevent infinite re-renders
  const setUser = useCallback((user: User | null) => {
    dispatch({ type: APP_ACTIONS.SET_USER, payload: user });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: APP_ACTIONS.SET_ERROR, payload: error });
  }, []);

  const setNativeConnection = useCallback((connected: boolean) => {
    dispatch({ type: APP_ACTIONS.SET_NATIVE_CONNECTION, payload: connected });
  }, []);

  const setLanguage = useCallback((language: string) => {
    dispatch({ type: APP_ACTIONS.SET_LANGUAGE, payload: language });
  }, []);

  const setSetupComplete = useCallback((complete: boolean) => {
    dispatch({ type: APP_ACTIONS.SET_SETUP_COMPLETE, payload: complete });
  }, []);

  const setCompanyData = useCallback((companyData: CompanyData | null) => {
    dispatch({ type: APP_ACTIONS.SET_COMPANY_DATA, payload: companyData });
  }, []);

  const setEmployeeData = useCallback((employeeData: KioskStartupResponse | null) => {
    dispatch({ type: APP_ACTIONS.SET_EMPLOYEE_DATA, payload: employeeData });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: APP_ACTIONS.CLEAR_ERROR });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: APP_ACTIONS.RESET_STATE });
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    setUser,
    setLoading,
    setError,
    setNativeConnection,
    setLanguage,
    setSetupComplete,
    setCompanyData,
    setEmployeeData,
    clearError,
    resetState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}