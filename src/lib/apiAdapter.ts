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
 * Get timecard data - tries API first, falls back to structured response for mock data processing
 */
export async function apiGetTimeCard({ payPeriod }: TimeCardRequest): Promise<ApiResult<TimeCardApiData>> {
  try {
    // In development or when API is unavailable, return basic structure for mock data merging
    if (process.env.NODE_ENV === 'development') {
      // Return basic structure that will be merged with processed mock data
      return {
        success: true,
        data: {
          weekStart: payPeriod === 'current' ? '2019-08-11' : '2019-07-28',
          weekEnd: payPeriod === 'current' ? '2019-08-24' : '2019-08-10',
          employeeId: "496",
          employeeName: "Harry Howard",
          payPeriod: payPeriod === 'current' ? 'Current Pay Period' : 'Previous Pay Period',
          payClass: "Full Time Hourly",
          department: "Glenwood Gardens",
          position: "CNA"
        }
      };
    }

    // In production, make actual API call
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
  useMockData?: boolean;
  employeeId?: string;
  [key: string]: unknown;
}

// Company Setup API types
interface CompanySetupApiData {
  useMockData?: boolean;
  companyName?: string;
  [key: string]: unknown;
}

/**
 * Get kiosk startup data - tries API first, falls back to structured response for mock data processing
 */
export async function apiGetKioskStartup({ employeeId }: KioskStartupRequest): Promise<ApiResult<KioskStartupApiData>> {
  try {
    // In development or when API is unavailable, return basic structure for mock data merging
    if (process.env.NODE_ENV === 'development') {
      // Return basic structure that indicates we should use mock data
      return {
        success: true,
        data: {
          useMockData: true,
          employeeId
        }
      };
    }

    // In production, make actual API call
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
    // In development or when API is unavailable, return basic structure for mock data merging
    if (process.env.NODE_ENV === 'development') {
      // Return basic structure that indicates we should use mock data
      return {
        success: true,
        data: {
          useMockData: true,
          companyName
        }
      };
    }

    // In production, make actual API call
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/company-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companyName }),
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
