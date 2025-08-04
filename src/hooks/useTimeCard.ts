import { useState, useEffect, useCallback } from 'react';
import { apiGetTimeCard } from '../lib/apiAdapter';
import { 
  WeeklyTimeCardData, 
  UseTimeCardResult,
  RawMockData
} from '@/types';

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
        const rawData = apiData.data as unknown as RawMockData;
        
        // Extract pay period info from raw data if available
        const payPeriodInfo = rawData?.payPeriod?.general?.periods;
        console.log('Raw pay period info:', payPeriodInfo);
        
        // Transform daily data into TimeEntry format
        // Now processing comprehensive daily data including:
        // ✓ notes: Employee notes for the day
        // ✓ incidents: Any incidents that occurred (when available)
        // ✓ dailyExceptions: Daily exceptions like unscheduled work
        // ✓ distributed: Distributed pay information  
        // ✓ summaries: Daily summaries
        // ✓ notifConds: Notification conditions
        // ✓ schedules: Full schedule details with confirmation states
        // ✓ payLines: Complete pay line data with work groups
        // ✓ adjustments: Detailed adjustment tracking with audit info
        // Note: Additional shift-level data still available:
        // - workedShifts[].monitoredItems: Detailed arrival/departure tracking
        // - workedShifts[].grossHours, dop, dow, scheduled flags, etc.
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
          
          // Extract scheduled shift information if available
          const scheduleInfo = day.schedules && day.schedules.length > 0 ? day.schedules[0] : null;
          const scheduledStart = scheduleInfo?.startTime ? 
            new Date(scheduleInfo.startTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }) : undefined;
          const scheduledEnd = scheduleInfo?.endTime ? 
            new Date(scheduleInfo.endTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }) : undefined;
          const scheduledHours = scheduleInfo?.hundHours || undefined;
          
          // Calculate PTO hours from pay lines
          let ptoHours = 0;
          let ptoType: string | undefined;
          day.payLines?.forEach(payLine => {
            const payDesName = payLine.payDes?.name?.toLowerCase() || '';
            if (payDesName.includes('pto') || payDesName.includes('vacation') || payDesName.includes('sick')) {
              ptoHours += payLine.hundHours || 0;
              ptoType = payLine.payDes?.name || 'PTO';
            }
          });
          
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
            // Include PTO information
            ptoHours: ptoHours > 0 ? Math.round(ptoHours * 100) / 100 : undefined,
            ptoType: ptoType,
            // Include scheduled shift information  
            scheduledStart,
            scheduledEnd,
            scheduledHours,
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
            })),
            // Enhanced data from raw API
            rawNotes: day.notes?.length > 0 ? day.notes.map(note => ({
              itemdata: note.itemdata,
              memoText: note.memoText,
              memoNoteCatId: note.memoNoteCatId,
              uniqueId: note.uniqueId
            })) : undefined,
            rawPayLines: day.payLines?.length > 0 ? day.payLines.map(payLine => ({
              dop: payLine.dop,
              payDes: payLine.payDes ? {
                name: payLine.payDes.name,
                abb: payLine.payDes.abb,
                multiplier: payLine.payDes.multiplier,
                num: payLine.payDes.num,
                isHours: payLine.payDes.isHours,
                memberships: payLine.payDes.memberships
              } : undefined,
              hundHours: payLine.hundHours,
              hours: payLine.hours,
              rate: payLine.rate,
              dollars: payLine.dollars,
              wg: payLine.wg ? {
                description: payLine.wg.description,
                workPositionName: payLine.wg.workPositionName
              } : undefined
            })) : undefined,
            rawAdjustments: day.adjustments?.length > 0 ? day.adjustments.map(adj => ({
              editType: adj.editType,
              hours: adj.hours,
              hundHours: adj.hundHours,
              aeUserCode: adj.aeUserCode,
              timestamp: adj.timestamp,
              cancelled: adj.cancelled,
              uniqueId: adj.uniqueId
            })) : undefined,
            dailyExceptions: day.dailyExceptions?.length > 0 ? day.dailyExceptions.map(exc => ({
              name: exc.name,
              hours: exc.hours,
              hundHours: exc.hundHours,
              shiftException: exc.shiftException
            })) : undefined,
            distributed: day.distributed?.length > 0 ? day.distributed.map(dist => ({
              payDes: dist.payDes ? {
                name: dist.payDes.name,
                abb: dist.payDes.abb,
                hours: dist.hours,
                hundHours: dist.hundHours
              } : undefined,
              wg: dist.wg ? {
                description: dist.wg.description,
                workPositionName: dist.wg.workPositionName
              } : undefined
            })) : undefined,
            summaries: day.summaries?.length > 0 ? day.summaries.map(summary => ({
              payDes: summary.payDes ? {
                name: summary.payDes.name,
                abb: summary.payDes.abb,
                hours: summary.hours,
                hundHours: summary.hundHours
              } : undefined
            })) : undefined,
            incidents: day.incidents?.length > 0 ? day.incidents : undefined,
            notifConds: day.notifConds?.length > 0 ? day.notifConds.map(notif => ({
              uniqueId: notif.uniqueId
            })) : undefined,
            scheduleDetails: day.schedules?.length > 0 ? day.schedules.map(schedule => ({
              date: schedule.date,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              description: schedule.description,
              confirmState: schedule.confirmState,
              hundHours: schedule.hundHours
            })) : undefined
          };
        }) || [];
        
        // Calculate totals from periodSummaries if available, otherwise use legacy calculation
        let totalHours = 0;
        let regularHours = 0;
        let overtimeHours = 0;
        
        if (rawData?.payPeriod?.periodSummaries?.byPayDes) {
          // Calculate from period summaries
          rawData.payPeriod.periodSummaries.byPayDes.forEach(summary => {
            const hours = summary.hundHours || 0;
            totalHours += hours;
            
            // Check membership to categorize hours
            if (summary.payDes?.memberships?.includes('workedTime')) {
              if (summary.payDes?.multiplier === 1.0) {
                regularHours += hours;
              } else if (summary.payDes?.multiplier && summary.payDes.multiplier > 1.0) {
                overtimeHours += hours;
              }
            }
          });
        } else {
          // Legacy calculation from entries
          totalHours = transformedEntries.reduce((sum: number, entry) => sum + (entry.totalHours || 0), 0);
          regularHours = Math.min(totalHours, 40); // Assume 40hr regular work week
          overtimeHours = Math.max(0, totalHours - 40);
        }
        
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
          periodSummaries: rawData?.payPeriod?.periodSummaries,
          // Include the raw pay period data for the UI to use
          rawPayPeriods: payPeriodInfo,
          // Include the current pay period info for easy access
          payPeriodInfo: payPeriodInfo?.[payPeriod] ? {
            id: payPeriod,
            name: `${payPeriod.charAt(0).toUpperCase() + payPeriod.slice(1)} Pay Period`,
            begins: payPeriodInfo[payPeriod].begins || '',
            ends: payPeriodInfo[payPeriod].ends || '',
            isCurrent: payPeriod === 'current'
          } : undefined
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
