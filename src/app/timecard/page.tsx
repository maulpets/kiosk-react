'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { EmployeeMenu } from '@/components/shared/EmployeeMenu';
import { useI18n } from '@/hooks/useI18n';
import { useTimeCard } from '@/hooks/useTimeCard';
import { useAppContext } from '@/store/AppContext';
import { WeeklyTimeCardData, PayPeriodInfo, TimeEntry } from '@/types';

export default function TimeCardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { state } = useAppContext();
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<'previous' | 'current' | 'next'>('current');

  // Get the logged-in user's employee ID
  const employeeId = state.user?.id || '496'; // Use test employee for debugging
  console.log('TimeCardPage employeeId:', employeeId, 'state.user:', state.user);

  // Get timecard data using the hook
  const { data: timeCardData, loading, error } = useTimeCard(selectedPayPeriod, employeeId);
  console.log('TimeCardPage hook results:', { timeCardData, loading, error });
  
  // TEMPORARY: Create mock timecard data with entries so we can see calendar functionality
  const mockTimeCardData = useMemo(() => timeCardData || {
    weekStart: '2019-08-11',
    weekEnd: '2019-08-24',
    entries: [
      {
        id: '2019-08-11-entry',
        date: '2019-08-11T00:00:00.000',
        clockIn: '8:00 AM',
        clockOut: '5:00 PM',
        totalHours: 8.0,
        status: 'completed' as const,
        workedShifts: 1,
        payLines: 2,
        adjustments: 0,
        transactions: [
          { time: '8:00 AM', type: 'punch', department: 'Nursing', notes: 'Clock In', transType: 0, timestamp: '2019-08-11T08:00:00.000' },
          { time: '12:00 PM', type: 'break', department: 'Nursing', notes: 'Lunch Out', transType: 2, timestamp: '2019-08-11T12:00:00.000' },
          { time: '1:00 PM', type: 'break', department: 'Nursing', notes: 'Lunch In', transType: 3, timestamp: '2019-08-11T13:00:00.000' },
          { time: '5:00 PM', type: 'punch', department: 'Nursing', notes: 'Clock Out', transType: 1, timestamp: '2019-08-11T17:00:00.000' }
        ],
        ptoHours: 0,
        overtimeHours: 0
      },
      {
        id: '2019-08-12-entry', 
        date: '2019-08-12T00:00:00.000',
        clockIn: '7:30 AM',
        clockOut: '6:30 PM',
        totalHours: 10.0,
        status: 'completed' as const,
        workedShifts: 1,
        payLines: 2,
        adjustments: 1,
        transactions: [
          { time: '7:30 AM', type: 'punch', department: 'Nursing', notes: 'Clock In', transType: 0, timestamp: '2019-08-12T07:30:00.000' },
          { time: '11:45 AM', type: 'break', department: 'Nursing', notes: 'Break Out', transType: 2, timestamp: '2019-08-12T11:45:00.000' },
          { time: '12:00 PM', type: 'break', department: 'Nursing', notes: 'Break In', transType: 3, timestamp: '2019-08-12T12:00:00.000' },
          { time: '4:00 PM', type: 'break', department: 'Nursing', notes: 'Dinner Out', transType: 2, timestamp: '2019-08-12T16:00:00.000' },
          { time: '4:30 PM', type: 'break', department: 'Nursing', notes: 'Dinner In', transType: 3, timestamp: '2019-08-12T16:30:00.000' },
          { time: '6:30 PM', type: 'punch', department: 'Nursing', notes: 'Clock Out', transType: 1, timestamp: '2019-08-12T18:30:00.000' }
        ],
        ptoHours: 0,
        overtimeHours: 2.0
      },
      {
        id: '2019-08-13-entry',
        date: '2019-08-13T00:00:00.000',
        clockIn: '',
        clockOut: '',
        totalHours: 8.0,
        status: 'pending' as const,
        workedShifts: 0,
        payLines: 1,
        adjustments: 0,
        transactions: [],
        ptoHours: 8.0,
        overtimeHours: 0,
        ptoType: 'Vacation'
      },
      {
        id: '2019-08-14-entry',
        date: '2019-08-14T00:00:00.000',
        clockIn: '8:00 AM',
        clockOut: '',
        totalHours: 0,
        status: 'in-progress' as const,
        workedShifts: 1,
        payLines: 0,
        adjustments: 0,
        transactions: [
          { time: '8:00 AM', type: 'punch', department: 'Nursing', notes: 'Clock In', transType: 0, timestamp: '2019-08-14T08:00:00.000' }
        ],
        ptoHours: 0,
        overtimeHours: 0
      },
      {
        id: '2019-08-15-entry',
        date: '2019-08-15T00:00:00.000',
        clockIn: '',
        clockOut: '',
        totalHours: 0,
        status: 'pending' as const,
        workedShifts: 0,
        payLines: 0,
        adjustments: 0,
        transactions: [],
        ptoHours: 0,
        overtimeHours: 0,
        scheduledStart: '8:00 AM',
        scheduledEnd: '5:00 PM',
        scheduledHours: 8.0
      }
    ],
    totalHours: 26.0,
    overtimeHours: 2.0,
    regularHours: 24.0,
    employeeId: '496',
    employeeName: 'Harry Howard',
    payPeriod: selectedPayPeriod,
    payClass: 'Full Time Hourly',
    department: 'Glenwood Gardens-DFT-9-Certified Nursing Assistant',
    position: 'CNA',
    rawPayPeriods: {
      previous: { begins: '2019-07-28T00:00:00.000', ends: '2019-08-10T00:00:00.000' },
      current: { begins: '2019-08-11T00:00:00.000', ends: '2019-08-24T00:00:00.000' },
      next: { begins: '2019-08-25T00:00:00.000', ends: '2019-09-07T00:00:00.000' }
    }
  }, [timeCardData, selectedPayPeriod]);

  // Extract pay periods from timecard data instead of employee data
  const payPeriods: PayPeriodInfo[] = useMemo(() => {
    // Use mock data for now to get working selector
    const dataToUse = mockTimeCardData;
    if (!dataToUse?.rawPayPeriods) {
      console.log('No rawPayPeriods found in timeCardData:', dataToUse);
      // Fallback with hardcoded dates from the mock data so we can see the selector
      return [
        {
          id: 'previous',
          name: 'Previous',
          begins: '2019-07-28',
          ends: '2019-08-10',
          isCurrent: false
        },
        {
          id: 'current',
          name: 'Current', 
          begins: '2019-08-11',
          ends: '2019-08-24',
          isCurrent: true
        },
        {
          id: 'next',
          name: 'Next',
          begins: '2019-08-25', 
          ends: '2019-09-07',
          isCurrent: false
        }
      ];
    }

    const periods = dataToUse.rawPayPeriods;
    console.log('Raw periods data:', periods);
    return [
      {
        id: 'previous',
        name: 'Previous',
        begins: periods.previous?.begins?.split('T')[0] || '',
        ends: periods.previous?.ends?.split('T')[0] || '',
        isCurrent: false
      },
      {
        id: 'current',
        name: 'Current',
        begins: periods.current?.begins?.split('T')[0] || '',
        ends: periods.current?.ends?.split('T')[0] || '',
        isCurrent: true
      },
      {
        id: 'next',
        name: 'Next',
        begins: periods.next?.begins?.split('T')[0] || '',
        ends: periods.next?.ends?.split('T')[0] || '',
        isCurrent: false
      }
    ];
  }, [mockTimeCardData]);

  // Add pay period info to timecard data
  const enrichedTimeCardData: WeeklyTimeCardData | null = useMemo(() => {
    const dataToUse = mockTimeCardData; // Use mock data for now
    if (!dataToUse) return null;
    
    const selectedPeriod = payPeriods.find(p => p.id === selectedPayPeriod);
    return {
      ...dataToUse,
      payPeriodInfo: selectedPeriod
    };
  }, [mockTimeCardData, payPeriods, selectedPayPeriod]);

  // Handle redirect to login if no user - use useEffect to avoid setState during render
  // useEffect(() => {
  //   if (!state.user) {
  //     router.push('/login');
  //   }
  // }, [state.user, router]);

  // Show loading or return early if no user - COMMENTED OUT FOR DEBUGGING
  // if (!state.user) {
  //   return null;
  // }

  // Helper function to create local date from YYYY-MM-DD string to avoid timezone issues
  const createLocalDate = (dateString: string): Date => {
    const parts = dateString.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };

  const formatDateRange = (startStr: string, endStr: string): string => {
    const start = createLocalDate(startStr);
    const end = createLocalDate(endStr);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Generate calendar grid for the pay period
  const generateCalendarGrid = (): (Date | null)[][] => {
    if (!enrichedTimeCardData?.payPeriodInfo) return [];

    const startDate = createLocalDate(enrichedTimeCardData.payPeriodInfo.begins);
    const endDate = createLocalDate(enrichedTimeCardData.payPeriodInfo.ends);
    
    // Generate all dates in the pay period
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group dates by week (starting on Sunday)
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    
    dates.forEach(date => {
      if (currentWeek.length === 0) {
        // Fill in empty cells for start of first week
        const dayOfWeek = date.getDay(); // 0 = Sunday
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push(null);
        }
      }
      
      currentWeek.push(date);
      
      if (currentWeek.length === 7 || date === dates[dates.length - 1]) {
        // Fill in empty cells for end of last week
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  };

  const calendarWeeks = generateCalendarGrid();

  // Helper to get entry for a specific date
  const getEntryForDate = (date: Date) => {
    if (!enrichedTimeCardData?.entries) return null;
    const dateStr = date.toISOString().split('T')[0];
    return enrichedTimeCardData.entries.find(entry => 
      entry.date.split('T')[0] === dateStr
    );
  };

  // Function to determine cell style and render content
  const renderCalendarCell = (date: Date, entry: TimeEntry | null) => {
    const isToday = date.toDateString() === new Date().toDateString();
    
    // Style 1: Full work day with multiple transactions
    if (entry && entry.transactions && entry.transactions.length > 2 && entry.status === 'completed') {
      return (
        <div className={`border-2 border-green-400 bg-green-50 rounded-lg p-2 min-h-[120px] ${isToday ? 'ring-2 ring-company-primary' : ''}`}>
          <div className="text-xs bg-red-100 text-red-800 px-1 rounded mb-1">Style 1</div>
          <div className="text-sm font-bold text-green-800 mb-1">{date.getDate()}</div>
          <div className="space-y-1">
            {entry.transactions.map((transaction, idx: number) => (
              <div key={idx} className="text-xs flex justify-between">
                <span className={transaction.type === 'punch' ? 'text-green-700 font-medium' : 'text-blue-600'}>
                  {transaction.time}
                </span>
                <span className="text-xs text-gray-600">
                  {transaction.type === 'punch' ? '🕐' : '☕'}
                </span>
              </div>
            ))}
            <div className="text-xs font-bold text-green-800 border-t pt-1">
              {entry.totalHours}h {entry.overtimeHours && entry.overtimeHours > 0 && <span className="text-orange-600">+{entry.overtimeHours}OT</span>}
            </div>
          </div>
        </div>
      );
    }
    
    // Style 2: Simple work day (few transactions)
    if (entry && entry.transactions && entry.transactions.length <= 2 && entry.status === 'completed') {
      return (
        <div className={`border border-blue-300 bg-blue-50 rounded p-2 min-h-[100px] ${isToday ? 'ring-2 ring-company-primary' : ''}`}>
          <div className="text-xs bg-red-100 text-red-800 px-1 rounded mb-1">Style 2</div>
          <div className="text-sm font-bold text-blue-800 mb-1">{date.getDate()}</div>
          <div className="space-y-1">
            <div className="text-xs text-blue-700">
              {entry.clockIn} - {entry.clockOut}
            </div>
            <div className="text-xs font-bold text-blue-800">
              {entry.totalHours}h
            </div>
            <div className="flex justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      );
    }
    
    // Style 3: Work in progress (clocked in, not out)
    if (entry && entry.status === 'in-progress') {
      return (
        <div className={`border-2 border-orange-400 bg-orange-50 rounded p-2 min-h-[100px] animate-pulse ${isToday ? 'ring-2 ring-company-primary' : ''}`}>
          <div className="text-xs bg-red-100 text-red-800 px-1 rounded mb-1">Style 3</div>
          <div className="text-sm font-bold text-orange-800 mb-1">{date.getDate()}</div>
          <div className="space-y-1">
            <div className="text-xs text-orange-700 font-medium">
              🔴 Active: {entry.clockIn}
            </div>
            {entry.transactions && entry.transactions.map((transaction, idx: number) => (
              <div key={idx} className="text-xs text-orange-600">
                {transaction.time} - {transaction.notes}
              </div>
            ))}
            <div className="text-xs text-orange-800 font-bold">
              Currently Working...
            </div>
          </div>
        </div>
      );
    }
    
    // Style 4: PTO/Vacation day
    if (entry && entry.ptoHours && entry.ptoHours > 0) {
      return (
        <div className={`border-2 border-purple-400 bg-purple-50 rounded p-2 min-h-[100px] ${isToday ? 'ring-2 ring-company-primary' : ''}`}>
          <div className="text-xs bg-red-100 text-red-800 px-1 rounded mb-1">Style 4</div>
          <div className="text-sm font-bold text-purple-800 mb-1">{date.getDate()}</div>
          <div className="space-y-1">
            <div className="text-center">
              <span className="text-2xl">🏖️</span>
            </div>
            <div className="text-xs text-purple-700 font-medium text-center">
              {entry.ptoType || 'PTO'}
            </div>
            <div className="text-xs font-bold text-purple-800 text-center">
              {entry.ptoHours}h
            </div>
          </div>
        </div>
      );
    }
    
    // Style 5: Scheduled day (no work yet)
    if (entry && entry.scheduledStart && !entry.clockIn) {
      return (
        <div className={`border border-gray-300 bg-gray-50 rounded p-2 min-h-[100px] ${isToday ? 'ring-2 ring-company-primary' : ''}`}>
          <div className="text-xs bg-red-100 text-red-800 px-1 rounded mb-1">Style 5</div>
          <div className="text-sm font-bold text-gray-700 mb-1">{date.getDate()}</div>
          <div className="space-y-1">
            <div className="text-center">
              <span className="text-lg">📅</span>
            </div>
            <div className="text-xs text-gray-600 text-center">
              Scheduled
            </div>
            <div className="text-xs text-gray-700 text-center">
              {entry.scheduledStart} - {entry.scheduledEnd}
            </div>
            <div className="text-xs font-medium text-gray-700 text-center">
              {entry.scheduledHours}h
            </div>
          </div>
        </div>
      );
    }
    
    // Style 6: No data/empty day
    return (
      <div className={`border border-gray-200 bg-gray-25 rounded p-2 min-h-[80px] ${isToday ? 'ring-2 ring-company-primary' : ''}`}>
        <div className="text-xs bg-red-100 text-red-800 px-1 rounded mb-1">Style 6</div>
        <div className="text-sm font-medium text-gray-500 mb-1">{date.getDate()}</div>
        <div className="text-center">
          <span className="text-lg text-gray-300">—</span>
        </div>
        <div className="text-xs text-gray-400 text-center mt-1">
          No activity
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-company-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-destructive text-lg mb-4">⚠️</div>
            <p className="text-destructive">{error}</p>
            <button
              onClick={() => window?.location.reload()}
              className="mt-4 px-4 py-2 bg-company-primary text-white rounded-lg hover:bg-company-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="h-full flex flex-col max-w-full overflow-hidden">
        {/* Employee Menu */}
        <EmployeeMenu />
        
        <div className="flex-1 overflow-hidden p-4 space-y-4">
          {/* Compact Header */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              {/* Employee Info - Compact */}
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {enrichedTimeCardData?.employeeName || 'Employee'}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>ID: {enrichedTimeCardData?.employeeId}</span>
                    {enrichedTimeCardData?.position && <span>{enrichedTimeCardData.position}</span>}
                  </div>
                </div>
              </div>

              {/* Pay Period Selector - Compact */}
              <div className="flex items-center gap-4">
                {/* Show selector with fallback data */}
                <div className="flex bg-muted rounded-md p-1 min-w-[200px]">
                  {payPeriods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPayPeriod(period.id as 'previous' | 'current' | 'next')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        selectedPayPeriod === period.id
                          ? 'bg-company-primary text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {period.name}
                    </button>
                  ))}
                </div>
                
                {enrichedTimeCardData?.payPeriodInfo && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {formatDateRange(enrichedTimeCardData.payPeriodInfo.begins, enrichedTimeCardData.payPeriodInfo.ends)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
            {/* Summary Cards - Compact */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-primary">Regular</p>
                    <p className="text-lg font-bold text-foreground">{enrichedTimeCardData?.regularHours || 0}h</p>
                  </div>
                  <span className="text-primary text-lg">🕒</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-company-accent/10 to-company-accent/20 border border-company-accent/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-company-accent">Overtime</p>
                    <p className="text-lg font-bold text-foreground">{enrichedTimeCardData?.overtimeHours || 0}h</p>
                  </div>
                  <span className="text-company-accent text-lg">⚡</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-accent/10 to-accent/20 border border-accent/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-accent-foreground">Total</p>
                    <p className="text-lg font-bold text-foreground">{enrichedTimeCardData?.totalHours || 0}h</p>
                  </div>
                  <span className="text-accent-foreground text-lg">📊</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-secondary/10 to-secondary/20 border border-secondary/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-secondary-foreground">Days</p>
                    <p className="text-lg font-bold text-foreground">{enrichedTimeCardData?.entries?.length || 0}</p>
                  </div>
                  <span className="text-secondary-foreground text-lg">📅</span>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="lg:col-span-3 bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-company-primary to-company-secondary p-3">
                <h2 className="text-lg font-bold text-white">Time Card Calendar</h2>
                <p className="text-white/80 text-sm">
                  {enrichedTimeCardData?.payPeriodInfo?.name || 'Pay Period'}
                </p>
              </div>
              
              <div className="p-4 overflow-auto flex-1">
                {calendarWeeks.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl text-muted-foreground mb-4 block">📋</span>
                    <p className="text-muted-foreground">No timecard data available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar Weeks */}
                    {calendarWeeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 gap-1">
                        {week.map((date: Date | null, dayIndex: number) => {
                          if (!date) {
                            return <div key={dayIndex} className="p-2"></div>;
                          }
                          
                          const entry = getEntryForDate(date);
                          return (
                            <div key={dayIndex}>
                              {renderCalendarCell(date, entry || null)}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <span>←</span>
              Back to Dashboard
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-company-primary hover:bg-company-primary/90 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <span>🖨️</span>
                Print
              </button>
              
              <button
                onClick={() => alert('Export functionality coming soon!')}
                className="px-4 py-2 bg-company-secondary hover:bg-company-secondary/90 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <span>📤</span>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
