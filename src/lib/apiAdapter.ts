/**
 * API Adapter - Environment-aware API calls
 * Handles switching between real API calls and mock data based on environment
 */

import { APP_CONFIG } from '@/constants';

interface ApiResult<T> {
  success: boolean;
  data: T;
  message?: string;
}

// TimeCard API types
interface TimeCardRequest {
  payPeriod: 'current' | 'previous';
}

interface TimeCardApiData {
  weekStart: string;
  weekEnd: string;
  employeeId: string;
  employeeName: string;
  payPeriod: string;
  payClass: string;
  department: string;
  position: string;
}

// Kiosk Startup API types
interface KioskStartupRequest {
  employeeId: string;
}

/**
 * Get timecard data - uses local API route which handles mock data processing
 */
export async function apiGetTimeCard({ payPeriod }: TimeCardRequest): Promise<ApiResult<TimeCardApiData>> {
  try {
    // Always use the local API route for consistent behavior
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/time-card?payPeriod=${payPeriod}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      data: {} as TimeCardApiData,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Kiosk Startup API response type
interface KioskStartupApiData {
  [key: string]: unknown;
}

// Company Setup API types  
interface CompanySetupApiData {
  [key: string]: unknown;
}

/**
 * Get kiosk startup data - uses local API route which handles mock data processing
 */
export async function apiGetKioskStartup({ employeeId }: KioskStartupRequest): Promise<ApiResult<KioskStartupApiData>> {
  try {
    // Always use the local API route for consistent behavior
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/kiosk-startup?employeeId=${encodeURIComponent(employeeId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      data: {} as KioskStartupApiData,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get company setup data - tries API first, falls back to structured response for mock data processing
 */
export async function apiGetCompanySetup({ companyName }: { companyName: string }): Promise<ApiResult<CompanySetupApiData>> {
  try {
    // Always make the API call to our local endpoint (whether dev or prod)
    // This ensures consistent behavior and proper mock data processing
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/company-setup?companyName=${encodeURIComponent(companyName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      data: {} as CompanySetupApiData,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
