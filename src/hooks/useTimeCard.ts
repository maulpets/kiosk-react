import { useState, useEffect, useCallback } from 'react';
import { apiGetTimeCard } from '../lib/apiAdapter';
import { 
  WeeklyTimeCardData, 
  UseTimeCardResult
} from '@/types';

export function useTimeCard(payPeriod: 'current' | 'previous' = 'current', employeeId?: string): UseTimeCardResult {
  const [data, setData] = useState<WeeklyTimeCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!employeeId) {
      setError('Employee ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching timecard data for employee ${employeeId}, ${payPeriod} pay period`);
      
      // Use API adapter for environment-aware API calls
      const apiData = await apiGetTimeCard({ payPeriod, employeeId });

      if (!apiData.success) {
        throw new Error(apiData.message || 'API returned unsuccessful response');
      }

      // Backend now handles all data processing and transformation
      const finalData: WeeklyTimeCardData = apiData.data as WeeklyTimeCardData;
      
      setData(finalData);
      console.log('Timecard data loaded successfully', { 
        employee: finalData.employeeName, 
        entriesCount: finalData.entries?.length || 0,
        totalHours: finalData.totalHours 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching timecard data';
      console.error('Error fetching timecard data:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [payPeriod, employeeId]);

  // Fetch data when payPeriod changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Refetch timecard data manually
   */
  const refetch = async () => {
    await fetchData();
  };

  return { 
    data, 
    loading, 
    error, 
    refetch 
  };
}
