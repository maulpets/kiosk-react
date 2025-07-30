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

// Kiosk Employee Data API types
interface KioskEmployeeDataRequest {
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
    const mockData = await fetch(`./mock-data/employee-timecard.json`)
    console.log('Using mock data for employee timecard:', mockData);
    if (mockData.ok) {
      const mockDataJson = await mockData.json();
      return {
        success: false,
        data: mockDataJson as TimeCardApiData,
        message: 'Using mock data'
      };
    }
    return {
      success: false,
      data: {} as TimeCardApiData,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Kiosk Employee Data API response type
interface KioskEmployeeDataApiData {
  [key: string]: unknown;
}

// Company Setup API types  
interface CompanySetupApiData {
  [key: string]: unknown;
}

/**
 * Get kiosk employee data - uses local API route which handles mock data processing
 */
export async function apiGetKioskEmployeeData({ employeeId }: KioskEmployeeDataRequest): Promise<ApiResult<KioskEmployeeDataApiData>> {
  try {
    // Always use the local API route for consistent behavior
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/kiosk-employee-data?employeeId=${encodeURIComponent(employeeId)}`, {
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
    const mockData = await fetch(`./mock-data/employee-data.json`)
    console.log('Using mock data for employee data:', mockData);
    if (mockData.ok) {
      const mockDataJson = await mockData.json();
      return {
        success: false,
        data: mockDataJson as KioskEmployeeDataApiData,
        message: 'Using mock data'
      };
    }
    return {
      success: false,
      data: {} as KioskEmployeeDataApiData,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get company setup data - tries API first, falls back to structured response for mock data processing
 */
export async function apiGetCompanySetup({ companyName }: { companyName: string }): Promise<ApiResult<CompanySetupApiData>> {
  try {
    console.log('apiGetCompanySetup called with companyName:', companyName);
    console.log('Making request to:', `${APP_CONFIG.API_BASE_URL}/api/v1/kiosk-setup`);
    
    // Make POST request to the kiosk API server
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/v1/kiosk-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company: { name: companyName }
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error:', errorText);
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('apiGetCompanySetup failed:', error);
    const mockData = await fetch(`./mock-data/company-setup.json`)
    console.log('Using mock data for company setup:', mockData);
    if (mockData.ok) {
      const mockDataJson = await mockData.json();
      return {
        success: false,
        data: mockDataJson as CompanySetupApiData,
        message: 'Using mock data'
      };
    }
    return {
      success: false,
      data: {} as CompanySetupApiData,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
