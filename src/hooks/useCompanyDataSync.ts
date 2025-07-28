import { useEffect } from 'react';
import { useWebViewBridge } from './useWebViewBridge';
import { CompanyData } from '@/types';

interface UseCompanyDataProps {
  companyData: CompanyData | null;
}

export function useCompanyDataSync({ companyData }: UseCompanyDataProps) {
  const { sendToNative, isConnected } = useWebViewBridge();

  // Send company data to native app whenever it changes
  useEffect(() => {
    if (companyData && isConnected) {
      sendToNative('COMPANY_DATA_UPDATE', {
        companyData,
        timestamp: Date.now()
      });
    }
  }, [companyData, isConnected, sendToNative]);

  // Send a request to store company data in native storage
  const syncToNative = (data: CompanyData) => {
    if (isConnected) {
      sendToNative('STORE_COMPANY_DATA', {
        companyData: data,
        timestamp: Date.now()
      });
    }
  };

  return {
    syncToNative,
    isConnectedToNative: isConnected
  };
}
