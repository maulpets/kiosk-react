import { useState, useEffect, useCallback } from 'react';
import { apiGetTimeCard } from '../lib/apiAdapter';
import { 
  WeeklyTimeCardData, 
  UseTimeCardResult
} from '@/types';

// Type for raw API data structure
interface RawTimeCardData {
  basics?: {
    idnum?: string;
    firstName?: string;
    lastName?: string;
    homeWg?: {
      description?: string;
      workPositionName?: string;
    };
  };
  payPeriod?: {
    general?: {
      payClass?: {
        name?: string;
      };
      periods?: {
        previous?: { begins?: string; ends?: string };
        current?: { begins?: string; ends?: string };
        next?: { begins?: string; ends?: string };
        this?: { begins?: string; ends?: string };
      };
    };
    days?: Array<{
      date: string;
      workedShifts?: Array<{
        hours?: number;
        transactions?: {
          actual?: Array<{
            timestamp: string;
            transType: number;
            station?: number;
          }>;
        };
      }>;
      payLines?: Array<unknown>;
      adjustments?: Array<unknown>;
    }>;
  };
  [key: string]: unknown;
}

export function useTimeCard(payPeriod: 'previous' | 'current' | 'next' = 'current', employeeId?: string): UseTimeCardResult {
  const [data, setData] = useState<WeeklyTimeCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    console.log('fetchData called with employeeId:', employeeId);
    if (!employeeId) {
      console.log('No employeeId, setting error');
      setError('Employee ID is required');
      setLoading(false);
      return;
    }

    console.log('Starting data fetch...');
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching timecard data for employee ${employeeId}, ${payPeriod} pay period`);
      
      // Use API adapter for environment-aware API calls
      const apiData = await apiGetTimeCard({ payPeriod, employeeId });
      console.log('API data received:', apiData);
      if (!apiData.success) {
        throw new Error(apiData.message || 'API returned unsuccessful response');
      }

      // Backend now handles all data processing and transformation
      let finalData: WeeklyTimeCardData;
      
      // Check if data is already in the expected format or needs transformation
      if (apiData.data && typeof apiData.data === 'object' && 'entries' in apiData.data) {
        // Data is already in WeeklyTimeCardData format
        finalData = apiData.data as WeeklyTimeCardData;
      } else {
        // Data is in raw API format, transform it
        const rawData = apiData.data as unknown as RawTimeCardData;
        
        // Extract pay period info from raw data if available
        const payPeriodInfo = rawData?.payPeriod?.general?.periods;
        console.log('Raw pay period info:', payPeriodInfo);
        
        // Transform daily data into TimeEntry format
        const transformedEntries = rawData?.payPeriod?.days?.map((day) => {
          const dayDate = day.date.split('T')[0];
          
          // Get all transactions for this day across all shifts
          const allTransactions: Array<{ timestamp: string; transType: number; station?: number }> = [];
          let totalDayHours = 0;
          
          if (day.workedShifts && day.workedShifts.length > 0) {
            day.workedShifts.forEach((shift) => {
              if (shift.transactions?.actual) {
                allTransactions.push(...shift.transactions.actual);
              }
              // Add hours from this shift (convert from minutes to hours)
              totalDayHours += (shift.hours || 0) / 60;
            });
          }
          
          // Sort transactions by timestamp to get clock in/out times
          allTransactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          const clockIn = allTransactions.length > 0 ? 
            new Date(allTransactions[0].timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }) : '';
            
          const clockOut = allTransactions.length > 1 ? 
            new Date(allTransactions[allTransactions.length - 1].timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }) : undefined;
          
          const status: 'completed' | 'in-progress' | 'pending' = 
            allTransactions.length === 0 ? 'pending' :
            allTransactions.length % 2 === 0 ? 'completed' : 'in-progress';
          
          return {
            id: `${dayDate}-entry`,
            date: day.date,
            clockIn,
            clockOut,
            totalHours: totalDayHours > 0 ? Math.round(totalDayHours * 100) / 100 : undefined,
            status,
            workedShifts: day.workedShifts?.length || 0,
            payLines: day.payLines?.length || 0,
            adjustments: day.adjustments?.length || 0,
            transactions: allTransactions.map((t) => ({
              time: new Date(t.timestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
              type: t.transType === 98 ? 'punch' : 'other',
              department: rawData.basics?.homeWg?.description || '',
              notes: t.transType === 98 ? 'Time Punch' : `Transaction ${t.transType}`,
              transType: t.transType,
              timestamp: t.timestamp,
              station: t.station
            }))
          };
        }) || [];
        
        // Calculate totals
        const totalHours = transformedEntries.reduce((sum: number, entry) => sum + (entry.totalHours || 0), 0);
        const regularHours = Math.min(totalHours, 40); // Assume 40hr regular work week
        const overtimeHours = Math.max(0, totalHours - 40);
        
        finalData = {
          weekStart: payPeriodInfo?.[payPeriod]?.begins?.split('T')[0] || '',
          weekEnd: payPeriodInfo?.[payPeriod]?.ends?.split('T')[0] || '',
          entries: transformedEntries, // Use transformed entries instead of empty array
          totalHours: Math.round(totalHours * 100) / 100,
          overtimeHours: Math.round(overtimeHours * 100) / 100,
          regularHours: Math.round(regularHours * 100) / 100,
          employeeId: rawData.basics?.idnum || '',
          employeeName: `${rawData.basics?.firstName || ''} ${rawData.basics?.lastName || ''}`.trim(),
          payPeriod: payPeriod,
          payClass: rawData?.payPeriod?.general?.payClass?.name || 'Regular',
          department: rawData.basics?.homeWg?.description || '',
          position: rawData.basics?.homeWg?.workPositionName || '',
          // Include the raw pay period data for the UI to use
          rawPayPeriods: payPeriodInfo
        };
        
        console.warn('Timecard data in raw format, using transformed placeholder data');
      }
      
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
    console.log('useEffect triggered, calling fetchData');
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
