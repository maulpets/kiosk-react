/**
 * API Adapter - Environment-aware API calls
 * Handles switching between real API calls and mock data based on environment
 */

import { API_ENDPOINTS, APP_CONFIG } from '@/constants';
import { 
  KioskStartupResponse,
  KioskEmployeeDataRequest,
  TimeCardRequest,
  WeeklyTimeCardData,
  CompanySetupResponse,
  ApiResult
} from '@/types';

/**
 * Get timecard data - calls backend server for timecard data
 */
export async function apiGetTimeCard({ payPeriod, employeeId }: TimeCardRequest): Promise<ApiResult<WeeklyTimeCardData>> {
  try {
    // Build query parameters
    const searchParams = new URLSearchParams({
      payPeriod
    });
    
    if (employeeId) {
      searchParams.append('employeeId', employeeId);
    }
    
    // Call backend server API endpoint
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/v1/time-card?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Timecard data fetched successfully:', data);
    return data;
  } catch (error) {
    console.log('API call failed, using mock data:', error);
    try {
      const mockData = await fetch(`./mock-data/employee-timecard.json`);
      if (mockData.ok) {
        const mockDataJson = await mockData.json();
        console.log('Using mock data for employee timecard:', mockDataJson);
        // Return mock data in the correct ApiResult format
        return {
          success: true,
          data: mockDataJson,
          message: 'Using mock data'
        };
      }
    } catch (mockError) {
      console.error('Failed to load mock data:', mockError);
    }
    
    return {
      success: false,
      data: {} as WeeklyTimeCardData,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get kiosk employee data - uses local API route which handles mock data processing
 */
export async function apiGetKioskEmployeeData({ employeeId }: KioskEmployeeDataRequest): Promise<ApiResult<KioskStartupResponse>> {
  try {
    // Always use the local API route for consistent behavior
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.KIOSK_EMPLOYEE_DATA}?employeeId=${encodeURIComponent(employeeId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Kiosk employee data fetched successfully:', data);
    return data;
  } catch (error) {
    console.log('API call failed:', error);
    const mockData = await fetch(`./mock-data/employee-data.json`)
    if (mockData.ok) {
      const mockDataJson = await mockData.json();
      console.log('Using mock data for employee data:', mockDataJson);
      return {
        success: true,
        data: mockDataJson as KioskStartupResponse,
        message: 'Using mock data'
      };
    }
    return {
      success: false,
      data: {} as KioskStartupResponse,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get company setup data - tries API first, falls back to structured response for mock data processing
 */
export async function apiGetCompanySetup({ companyName }: { companyName: string }): Promise<ApiResult<CompanySetupResponse>> {
  try {
    console.log('apiGetCompanySetup called with companyName:', companyName);
    console.log('Making request to:', `${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.KIOSK_COMPANY_SETUP}`);
    
    // Make POST request to the kiosk API server
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.KIOSK_COMPANY_SETUP}`, {
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
    if (mockData.ok) {
      const mockDataJson = await mockData.json();
      console.log('Using mock data for company setup:', mockDataJson);
      return {
        success: true,
        data: { company: mockDataJson } as CompanySetupResponse,
        message: 'Using mock data'
      };
    }
    return {
      success: false,
      data: {} as CompanySetupResponse,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
