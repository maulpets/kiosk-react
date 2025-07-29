import { useState, useCallback } from 'react';
import { CompanySetupResponse } from '@/types/company';
import { apiGetCompanySetup } from '@/lib/apiAdapter';

interface UseCompanySetupReturn {
  data: CompanySetupResponse | null;
  loading: boolean;
  error: string | null;
  setupCompany: (companyName: string) => Promise<CompanySetupResponse>;
}

export function useCompanySetup(): UseCompanySetupReturn {
  const [data, setData] = useState<CompanySetupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupCompany = useCallback(async (companyName: string): Promise<CompanySetupResponse> => {
    if (!companyName.trim()) {
      throw new Error('Company name is required');
    }

    setLoading(true);
    setError(null);

    try {
      // Always use the API route which handles the JSON loading and processing
      const apiData = await apiGetCompanySetup({ companyName });

      if (!apiData.success) {
        throw new Error(apiData.message || 'API returned unsuccessful response');
      }

      // The API already handles mock data processing, so just use the response
      const finalData = apiData.data as unknown as CompanySetupResponse;
      setData(finalData);
      return finalData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error setting up company:', err);
      throw err; // Re-throw the error so the UI can handle it
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    setupCompany,
  };
}
