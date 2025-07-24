'use client';

import { useState, useCallback } from 'react';
import { useAppContext } from '@/store/AppContext';
import { apiClient, ApiError } from '@/lib/api/client';

interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiError) => void;
  showLoading?: boolean;
}

export function useApi<T = unknown>(options: UseApiOptions = {}) {
  const { setLoading, setError } = useAppContext();
  const { onSuccess, onError, showLoading = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<{ data: T }>) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setLocalLoading(true);
        setLocalError(null);
        setError(null);

        const response = await apiCall();
        setData(response.data);
        
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        return response.data;
      } catch (error) {
        const apiError = error instanceof ApiError ? error : new ApiError(
          error instanceof Error ? error.message : 'Unknown error',
          'UNKNOWN_ERROR',
          0
        );
        
        setLocalError(apiError.message);
        
        if (showLoading) {
          setError(apiError.message);
        }
        
        if (onError) {
          onError(apiError);
        }
        
        throw apiError;
      } finally {
        if (showLoading) {
          setLoading(false);
        }
        setLocalLoading(false);
      }
    },
    [setLoading, setError, onSuccess, onError, showLoading]
  );

  const reset = useCallback(() => {
    setData(null);
    setLocalError(null);
    setLocalLoading(false);
  }, []);

  return {
    data,
    loading: localLoading,
    error: localError,
    execute,
    reset,
  };
}

// Specific API hooks
export function useApiGet<T = unknown>(endpoint: string, options: UseApiOptions = {}) {
  const api = useApi<T>(options);
  
  const get = useCallback(() => {
    return api.execute(() => apiClient.get<T>(endpoint));
  }, [api, endpoint]);

  return {
    ...api,
    get,
  };
}

export function useApiPost<T = unknown>(endpoint: string, options: UseApiOptions = {}) {
  const api = useApi<T>(options);
  
  const post = useCallback((body?: unknown) => {
    return api.execute(() => apiClient.post<T>(endpoint, body));
  }, [api, endpoint]);

  return {
    ...api,
    post,
  };
}
