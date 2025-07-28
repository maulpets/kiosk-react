import { useState, useEffect } from 'react';

// Types for the raw mock data structure
interface RawTransaction {
  timestamp: string;
  transType: number;
  station?: number;
}

interface RawWorkedShift {
  transactions?: {
    actual?: RawTransaction[];
  };
}

interface RawDayData {
  date: string;
  workedShifts: RawWorkedShift[];
  payLines: Array<{ dop: number }>;
  adjustments: Array<{ prevEffTime: string }>;
  notes: Array<{ note: string }>;
  distributed: unknown[];
  summaries: unknown[];
  incidents: unknown[];
  notifConds: unknown[];
  dailyExceptions: unknown[];
  schedules: unknown[];
}

interface RawMockData {
  basics: {
    filekey: number;
    lastName: string;
    firstName: string;
    middle: string;
    idnum: string;
    badge: number;
    homeWg: {
      description: string;
      workPositionWgName: string;
      workPositionWgCode: string;
      workPositionName: string;
      workPositionAbb: string;
      levels: Array<{
        wgLevel: number;
        wgNum: number;
        caption: string;
      }>;
    };
  };
  payPeriod: {
    general: {
      payClass: {
        id: number;
        name: string;
        effective: string;
      };
      wasApproved: boolean;
      wasEmployeeApproved: boolean;
      isSecure: boolean;
      payPeriodLength: number;
      compType: number;
      periods: {
        this: { begins: string; ends: string };
        previous: { begins: string; ends: string };
        current: { begins: string; ends: string };
        next: { begins: string; ends: string };
      };
    };
    days: RawDayData[];
  };
}

// Frontend interfaces
export interface Transaction {
  time: string;
  type: string;
  department: string;
  notes: string;
  transType: number;
  timestamp: string;
  station?: number;
}

export interface TimeEntry {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
  breakTime: number;
  totalHours: number;
  status: string;
  project: string;
  notes?: string;
  workedShifts: number;
  payLines: number;
  adjustments: number;
  transactions?: Transaction[];
}

export interface WeeklyTimeCardData {
  weekStart: string;
  weekEnd: string;
  entries: TimeEntry[];
  totalHours: number;
  overtimeHours: number;
  regularHours: number;
  employeeId: string;
  employeeName: string;
  payPeriod: string;
  payClass: string;
  department: string;
  position: string;
}

interface UseTimeCardResult {
  data: WeeklyTimeCardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTimeCard(payPeriod: 'current' | 'previous' = 'current'): UseTimeCardResult {
  const [data, setData] = useState<WeeklyTimeCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockData, setMockData] = useState<RawMockData | null>(null);

  // Fetch mock data once
  useEffect(() => {
    const fetchMockData = async () => {
      try {
        console.log('Fetching mock data from /timecard-mock-data.json');
        const response = await fetch('/timecard-mock-data.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch mock data: ${response.status}`);
        }
        const data = await response.json();
        console.log('Mock data loaded successfully', { basics: data.basics?.firstName, daysCount: data.payPeriod?.days?.length });
        setMockData(data);
      } catch (err) {
        console.error('Error fetching mock data:', err);
        setError('Failed to load timecard data');
      }
    };

    fetchMockData();
  }, []);

  // Refetch when payPeriod or mockData changes
  useEffect(() => {
    const fetchData = async () => {
      if (!mockData) return;

      setLoading(true);
      setError(null);

      try {
        // Get basic API structure
        const apiResponse = await fetch(`/api/time-card?payPeriod=${payPeriod}`);
        if (!apiResponse.ok) {
          throw new Error(`API responded with status: ${apiResponse.status}`);
        }
        const apiData = await apiResponse.json();

        if (!apiData.success) {
          throw new Error(apiData.message || 'API returned unsuccessful response');
        }

        // Process mock data to create entries
        const processedData = processMockData(mockData);
        
        // Combine API structure with processed mock data
        const finalData: WeeklyTimeCardData = {
          ...apiData.data,
          ...processedData
        };

        setData(finalData);
      } catch (err) {
        console.error('Error fetching timecard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        
        // Fallback to just processed mock data if API fails
        try {
          const processedData = processMockData(mockData);
          const fallbackData: WeeklyTimeCardData = {
            weekStart: payPeriod === 'current' ? '2019-08-11' : '2019-07-28',
            weekEnd: payPeriod === 'current' ? '2019-08-24' : '2019-08-10',
            employeeId: "496",
            employeeName: "Harry Howard",
            payPeriod: payPeriod === 'current' ? 'Current Pay Period' : 'Previous Pay Period',
            payClass: "Full Time Hourly",
            department: "Glenwood Gardens",
            position: "CNA",
            entries: processedData.entries || [],
            totalHours: processedData.totalHours || 0,
            overtimeHours: processedData.overtimeHours || 0,
            regularHours: processedData.regularHours || 0
          };
          setData(fallbackData);
          setError(null); // Clear error since we have fallback data
        } catch (fallbackErr) {
          console.error('Error processing fallback data:', fallbackErr);
          setError('Failed to load timecard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [payPeriod, mockData]);

  const refetch = async () => {
    if (!mockData) return;

    setLoading(true);
    setError(null);

    try {
      // Get basic API structure
      const apiResponse = await fetch(`/api/time-card?payPeriod=${payPeriod}`);
      if (!apiResponse.ok) {
        throw new Error(`API responded with status: ${apiResponse.status}`);
      }
      const apiData = await apiResponse.json();

      if (!apiData.success) {
        throw new Error(apiData.message || 'API returned unsuccessful response');
      }

      // Process mock data to create entries
      const processedData = processMockData(mockData);
      
      // Combine API structure with processed mock data
      const finalData: WeeklyTimeCardData = {
        ...apiData.data,
        ...processedData
      };

      setData(finalData);
    } catch (err) {
      console.error('Error fetching timecard data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Fallback to just processed mock data if API fails
      try {
        const processedData = processMockData(mockData);
        const fallbackData: WeeklyTimeCardData = {
          weekStart: payPeriod === 'current' ? '2019-08-11' : '2019-07-28',
          weekEnd: payPeriod === 'current' ? '2019-08-24' : '2019-08-10',
          employeeId: "496",
          employeeName: "Harry Howard",
          payPeriod: payPeriod === 'current' ? 'Current Pay Period' : 'Previous Pay Period',
          payClass: "Full Time Hourly",
          department: "Glenwood Gardens",
          position: "CNA",
          entries: processedData.entries || [],
          totalHours: processedData.totalHours || 0,
          overtimeHours: processedData.overtimeHours || 0,
          regularHours: processedData.regularHours || 0
        };
        setData(fallbackData);
        setError(null); // Clear error since we have fallback data
      } catch (fallbackErr) {
        console.error('Error processing fallback data:', fallbackErr);
        setError('Failed to load timecard data');
      }
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// Helper function to process mock data
function processMockData(mockData: RawMockData): Partial<WeeklyTimeCardData> {
  console.log('Processing mock data:', { 
    employee: mockData.basics?.firstName, 
    daysCount: mockData.payPeriod?.days?.length 
  });
  
  const employee = mockData.basics;
  const payPeriodData = mockData.payPeriod;
  
  // Map transaction types to readable names
  const getTransactionTypeName = (transType: number): string => {
    const typeMap: { [key: number]: string } = {
      0: 'Clock In',
      1: 'Clock Out', 
      2: 'Break Out',
      3: 'Break In',
      4: 'Meal Out',
      5: 'Meal In',
      6: 'Transfer Out',
      7: 'Transfer In',
      98: 'System Punch',
      99: 'Manual Entry'
    };
    return typeMap[transType] || `Type ${transType}`;
  };

  // Extract transactions from worked shifts
  const extractTransactions = (workedShifts: RawWorkedShift[]): Transaction[] => {
    const allTransactions: Transaction[] = [];
    
    workedShifts.forEach((shift, shiftIndex) => {
      if (shift.transactions && shift.transactions.actual) {
        shift.transactions.actual.forEach((transaction: RawTransaction) => {
          if (transaction.timestamp) {
            const transDate = new Date(transaction.timestamp);
            const time = transDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });
            
            allTransactions.push({
              time,
              type: getTransactionTypeName(transaction.transType || 0),
              department: employee.homeWg.levels[0].caption,
              notes: `Shift ${shiftIndex + 1}`,
              transType: transaction.transType || 0,
              timestamp: transaction.timestamp,
              station: transaction.station
            });
          }
        });
      }
    });
    
    // Sort transactions by time
    return allTransactions.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  };

  // Process days data
  const entries: TimeEntry[] = [];
  const relevantDays = mockData.payPeriod.days.slice(0, 14); // Get first 14 days

  relevantDays.forEach((dayData) => {
    const dayDate = new Date(dayData.date);
    
    // Skip weekends
    if (dayDate.getDay() === 0 || dayDate.getDay() === 6) {
      return;
    }
    
    // Only process days with work activity
    if (dayData.workedShifts.length === 0) {
      return;
    }

    const dateStr = dayDate.toISOString().split('T')[0];
    const transactions = extractTransactions(dayData.workedShifts);
    
    // Get first and last transaction times for clock in/out
    const firstTransaction = transactions[0];
    const lastTransaction = transactions[transactions.length - 1];
    const clockIn = firstTransaction?.time || '07:00';
    const clockOut = lastTransaction?.time || '15:30';
    
    // Calculate hours
    const clockInTime = new Date(`2025-01-01T${clockIn}:00`);
    const clockOutTime = new Date(`2025-01-01T${clockOut}:00`);
    const diffMs = clockOutTime.getTime() - clockInTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const totalHours = Math.round((diffHours - 0.5) * 10) / 10; // Subtract 30 min for break

    entries.push({
      id: `entry-${dateStr}`,
      date: dateStr,
      clockIn,
      clockOut,
      breakTime: 30,
      totalHours,
      status: 'completed',
      project: employee.homeWg.levels[0].caption,
      notes: dayData.notes.length > 0 ? dayData.notes[0].note : undefined,
      workedShifts: dayData.workedShifts.length,
      payLines: dayData.payLines.length,
      adjustments: dayData.adjustments.length,
      transactions
    });
  });

  // Calculate totals
  const totalHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  const regularHours = Math.min(totalHours, 80);
  const overtimeHours = Math.max(totalHours - 80, 0);

  console.log('Processed timecard data:', { 
    entriesCount: entries.length, 
    totalHours, 
    regularHours, 
    overtimeHours 
  });

  return {
    entries,
    totalHours: Math.round(totalHours * 10) / 10,
    regularHours: Math.round(regularHours * 10) / 10,
    overtimeHours: Math.round(overtimeHours * 10) / 10,
    employeeId: employee.idnum,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    payClass: payPeriodData.general.payClass.name,
    department: employee.homeWg.levels[0].caption,
    position: employee.homeWg.workPositionName
  };
}
