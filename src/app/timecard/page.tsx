'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeMenu from '@/components/EmployeeMenu';
import DayDetailModal from '@/components/DayDetailModal';
import { useI18n } from '@/hooks/useI18n';
import { useTimeCard } from '@/hooks/useTimeCard';
import { useAppContext } from '@/store/AppContext';
import { getLocaleString } from '@/lib/i18n';
import { WeeklyTimeCardData, PayPeriodInfo, TimeEntry, DayDetailData } from '@/types';

export default function TimeCardPage() {
  const { t, locale } = useI18n();
  const { state } = useAppContext();
  const router = useRouter();
  const localeString = getLocaleString(locale);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<'previous' | 'current' | 'next'>('current');
  const [selectedDayData, setSelectedDayData] = useState<DayDetailData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get the logged-in user's employee ID
  const employeeId = state.user?.id;
  console.log('TimeCardPage employeeId:', employeeId, 'state.user:', state.user);

  // Handle redirect to login if no user
  useEffect(() => {
    if (!state.user) {
      router.push('/login');
    }
  }, [state.user, router]);

  // Get timecard data using the hook
  const { data: timeCardData, loading, error } = useTimeCard(selectedPayPeriod, employeeId);
  console.log('TimeCardPage hook results:', { timeCardData, loading, error });

  // Helper function to create local date from YYYY-MM-DD string to avoid timezone issues
  const createLocalDate = (dateString: string): Date => {
    const parts = dateString.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };

  const formatDateRange = useCallback((startStr: string, endStr: string): string => {
    const start = createLocalDate(startStr);
    const end = createLocalDate(endStr);
    return `${start.toLocaleDateString(localeString, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(localeString, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [localeString]);

  // Extract pay periods from timecard data instead of employee data
  const payPeriods: PayPeriodInfo[] = useMemo(() => {
    if (!timeCardData?.rawPayPeriods) {
      console.log('No rawPayPeriods found in timeCardData:', timeCardData);
      // Return empty array when no data available
      return [];
    }

    const periods = timeCardData.rawPayPeriods;
    console.log('Raw periods data:', periods);
    return [
      {
        id: 'previous',
        name: t('timecard.previous'),
        begins: periods.previous?.begins?.split('T')[0] || '',
        ends: periods.previous?.ends?.split('T')[0] || '',
        isCurrent: false
      },
      {
        id: 'current',
        name: t('timecard.current'),
        begins: periods.current?.begins?.split('T')[0] || '',
        ends: periods.current?.ends?.split('T')[0] || '',
        isCurrent: true
      },
      {
        id: 'next',
        name: t('timecard.next'),
        begins: periods.next?.begins?.split('T')[0] || '',
        ends: periods.next?.ends?.split('T')[0] || '',
        isCurrent: false
      }
    ];
  }, [timeCardData, t]);

  // Add pay period info to timecard data
    const enrichedTimeCardData: WeeklyTimeCardData | null = useMemo(() => {
    return timeCardData;
  }, [timeCardData]);
  // Calculate detailed summaries from period summaries data
  const payPeriodSummary = useMemo(() => {
    if (!enrichedTimeCardData?.periodSummaries?.byPayDes) {
      return {
        totalHours: enrichedTimeCardData?.totalHours || 0,
        regularHours: enrichedTimeCardData?.regularHours || 0,
        overtimeHours: enrichedTimeCardData?.overtimeHours || 0,
        holidayHours: 0,
        ptoHours: 0,
        weekendHours: 0,
        daysWorked: enrichedTimeCardData?.entries?.length || 0,
        payDesCategories: []
      };
    }

    const summaries = enrichedTimeCardData.periodSummaries.byPayDes;
    let totalHours = 0;
    const payDesCategories: Array<{ name: string; hours: number; abb?: string }> = [];

    // Create categories directly from the payDes data
    summaries.forEach(summary => {
      const hours = summary.hundHours || 0;
      totalHours += hours;

      if (hours > 0) { // Only include categories with hours
        payDesCategories.push({
          name: summary.payDes?.name || 'Unknown',
          abb: summary.payDes?.abb,
          hours: Math.round(hours * 100) / 100
        });
      }
    });

    // Legacy categorization for backward compatibility (still calculate these for charts/widgets)
    let regularHours = 0;
    let overtimeHours = 0;
    let holidayHours = 0;
    let ptoHours = 0;
    let weekendHours = 0;

    summaries.forEach(summary => {
      const hours = summary.hundHours || 0;
      const payDesName = summary.payDes?.name?.toLowerCase() || '';
      const payDesAbb = summary.payDes?.abb?.toLowerCase() || '';

      if (payDesName.includes('regular') || payDesAbb.includes('rg')) {
        regularHours += hours;
      } else if (payDesName.includes('overtime') || payDesAbb.includes('ot') || summary.payDes?.multiplier && summary.payDes.multiplier > 1.0) {
        overtimeHours += hours;
      } else if (payDesName.includes('holiday') || payDesAbb.includes('hol')) {
        holidayHours += hours;
      } else if (payDesName.includes('pto') || payDesName.includes('vacation') || payDesName.includes('sick')) {
        ptoHours += hours;
      } else if (payDesName.includes('weekend') || payDesAbb.includes('wk')) {
        weekendHours += hours;
      }
    });

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      regularHours: Math.round(regularHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      holidayHours: Math.round(holidayHours * 100) / 100,
      ptoHours: Math.round(ptoHours * 100) / 100,
      weekendHours: Math.round(weekendHours * 100) / 100,
      daysWorked: enrichedTimeCardData?.entries?.filter(entry => entry.totalHours && entry.totalHours > 0).length || 0,
      payDesCategories
    };
  }, [enrichedTimeCardData]);

  // Get the current selected pay period info for header display
  const selectedPayPeriodInfo = useMemo(() => {
    const selectedPeriod = payPeriods.find(p => p.id === selectedPayPeriod);
    if (selectedPeriod && selectedPeriod.begins && selectedPeriod.ends) {
      return {
        name: selectedPeriod.name,
        dateRange: formatDateRange(selectedPeriod.begins, selectedPeriod.ends)
      };
    }
    return {
      name: t('timecard.payPeriod'),
      dateRange: 'Loading dates...'
    };
  }, [payPeriods, selectedPayPeriod, t, formatDateRange]);

  // Show loading or return early if no user
  if (!state.user) {
    return null;
  }

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

  // Handle day cell click to open detailed view
  const handleDayClick = (date: Date, dayData: TimeEntry | DayDetailData) => {
    if (dayData) {
      setSelectedDayData(dayData as DayDetailData);
      setIsModalOpen(true);
    }
  };

  // Handle navigation between dates in modal
  const handleNavigateDate = (direction: 'prev' | 'next') => {
    if (!enrichedTimeCardData?.entries || !selectedDayData) return;
    
    const currentDateStr = selectedDayData.date?.split('T')[0];
    const currentIndex = enrichedTimeCardData.entries.findIndex(entry => 
      entry.date.split('T')[0] === currentDateStr
    );
    
    let newIndex = -1;
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < enrichedTimeCardData.entries.length - 1) {
      newIndex = currentIndex + 1;
    }
    
    if (newIndex >= 0) {
      const newEntry = enrichedTimeCardData.entries[newIndex];
      setSelectedDayData(newEntry as unknown as DayDetailData);
    }
  };

  // Function to determine cell style and render content
  const renderCalendarCell = (date: Date, entry: TimeEntry | null) => {
    const isToday = date.toDateString() === new Date().toDateString();
    
    // Style 1: Full work day with multiple transactions
    if (entry && entry.transactions && entry.transactions.length > 2 && entry.status === 'completed') {
      return (
        <div 
          className={`border-2 border-accent bg-accent/10 rounded-lg p-2 min-h-[120px] cursor-pointer hover:bg-accent/20 transition-colors ${isToday ? 'ring-2 ring-company-primary' : ''}`}
          onClick={() => handleDayClick(date, entry)}
        >
          <div className="text-sm font-bold text-accent-foreground mb-1">{date.getDate()}</div>
          <div className="space-y-1">
            {entry.transactions.map((transaction, idx: number) => (
              <div key={idx} className="text-xs flex justify-between">
                <span className={transaction.type === 'punch' ? 'text-accent-foreground/90 font-medium' : 'text-primary'}>
                  {transaction.time}
                </span>
                <span className="text-xs text-muted-foreground">
                  {transaction.type === 'punch' ? '🕐' : '☕'}
                </span>
              </div>
            ))}
            <div className="text-xs font-bold text-accent-foreground border-t pt-1">
              {entry.totalHours}h {entry.overtimeHours && entry.overtimeHours > 0 && <span className="text-destructive">+{entry.overtimeHours}OT</span>}
            </div>
          </div>
        </div>
      );
    }
    
    // Style 2: Simple work day (few transactions)
    if (entry && entry.transactions && entry.transactions.length <= 2 && entry.status === 'completed') {
      return (
        <div 
          className={`border border-secondary bg-secondary/10 rounded p-2 min-h-[100px] cursor-pointer hover:bg-secondary/20 transition-colors ${isToday ? 'ring-2 ring-company-primary' : ''}`}
          onClick={() => handleDayClick(date, entry)}
        >
          <div className="text-sm font-bold text-secondary-foreground mb-1">{date.getDate()}</div>
          <div className="space-y-1">
            <div className="text-xs text-secondary-foreground/80">
              {entry.clockIn} - {entry.clockOut}
            </div>
            <div className="text-xs font-bold text-secondary-foreground">
              {entry.totalHours}h
            </div>
            <div className="flex justify-center">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
            </div>
          </div>
        </div>
      );
    }
    
    // Style 3: Work in progress (clocked in, not out)
    if (entry && entry.status === 'in-progress') {
      return (
        <div 
          className={`border-2 border-primary bg-primary/10 rounded p-2 min-h-[100px] animate-pulse cursor-pointer hover:bg-primary/20 transition-colors ${isToday ? 'ring-2 ring-company-primary' : ''}`}
          onClick={() => handleDayClick(date, entry)}
        >
          <div className="text-sm font-bold text-primary-foreground mb-1">{date.getDate()}</div>
          <div className="space-y-1">
            <div className="text-xs text-primary-foreground/90 font-medium">
              🔴 {t('timecard.active')}: {entry.clockIn}
            </div>
            {entry.transactions && entry.transactions.map((transaction, idx: number) => (
              <div key={idx} className="text-xs text-primary-foreground/80">
                {transaction.time} - {transaction.notes}
              </div>
            ))}
            <div className="text-xs text-primary-foreground font-bold">
              {t('timecard.currentlyWorking')}
            </div>
          </div>
        </div>
      );
    }
    
    // Style 4: PTO/Vacation day
    if (entry && entry.ptoHours && entry.ptoHours > 0) {
      return (
        <div 
          className={`border-2 border-accent bg-accent/10 rounded p-2 min-h-[100px] cursor-pointer hover:bg-accent/20 transition-colors ${isToday ? 'ring-2 ring-company-primary' : ''}`}
          onClick={() => handleDayClick(date, entry)}
        >
          <div className="text-sm font-bold text-accent-foreground mb-1">{date.getDate()}</div>
          <div className="space-y-1">
            <div className="text-center">
              <span className="text-2xl">🏖️</span>
            </div>
            <div className="text-xs text-accent-foreground/80 font-medium text-center">
              {entry.ptoType || t('timecard.ptoHours')}
            </div>
            <div className="text-xs font-bold text-accent-foreground text-center">
              {entry.ptoHours}h
            </div>
          </div>
        </div>
      );
    }
    
    // Style 5: Scheduled day (no work yet)
    if (entry && entry.scheduledStart && !entry.clockIn) {
      return (
        <div 
          className={`border border-muted bg-muted/50 rounded p-2 min-h-[100px] cursor-pointer hover:bg-muted transition-colors ${isToday ? 'ring-2 ring-company-primary' : ''}`}
          onClick={() => handleDayClick(date, entry)}
        >
          <div className="text-sm font-bold text-muted-foreground mb-1">{date.getDate()}</div>
          <div className="space-y-1">
            <div className="text-center">
              <span className="text-lg">📅</span>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {t('timecard.scheduled')}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {entry.scheduledStart} - {entry.scheduledEnd}
            </div>
            <div className="text-xs font-medium text-muted-foreground text-center">
              {entry.scheduledHours}h
            </div>
          </div>
        </div>
      );
    }
    
    // Style 6: No data/empty day
    return (
      <div className={`border border-border bg-background rounded p-2 min-h-[80px] ${isToday ? 'ring-2 ring-company-primary' : ''}`}>
        <div className="text-sm font-medium text-muted-foreground mb-1">{date.getDate()}</div>
        <div className="text-center">
          <span className="text-lg text-muted-foreground/50">—</span>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-1">
          {t('timecard.noActivity')}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-company-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-6">
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
      </div>
    );
  }

  return (
    <>
      {/* Day Detail Modal */}
      <DayDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDayData={selectedDayData}
        timeCardData={enrichedTimeCardData}
        onNavigateDate={handleNavigateDate}
      />
      
      <div className="min-h-screen bg-background pt-6">
      <div className="flex">
        {/* Left Sidebar Menu */}
        <EmployeeMenu />
        
        {/* Main Content */}
        <div className="flex-1 px-6 py-8 overflow-hidden">
          {/* Compact Header with Employee Info */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between">
              {/* Employee Info - Compact */}
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {enrichedTimeCardData?.employeeName || t('common.defaultUser')}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{t('timecard.employeeId')}: {enrichedTimeCardData?.employeeId}</span>
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
              </div>
            </div>
          </div>

          {/* Calendar with Totals Header */}
          <div className="bg-card border border-border rounded-lg overflow-hidden flex-1">
            <div className="bg-gradient-to-r from-company-primary to-company-secondary p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">{t('timecard.timeCardSummary')}</h2>
                  <p className="text-white/80 text-sm">
                    {selectedPayPeriodInfo.dateRange}
                  </p>
                </div>
                
                {/* Totals in Header - Dynamic based on payDes categories */}
                <div className="flex items-center gap-6">
                  {payPeriodSummary.payDesCategories.map((category, index) => (
                    <div key={index} className="text-center">
                      <p className="text-xs font-medium text-white/80">{category.abb || category.name}</p>
                      <p className="text-xl font-bold text-white">{category.hours}h</p>
                    </div>
                  ))}
                  <div className="text-center">
                    <p className="text-xs font-medium text-white/80">{t('timecard.total')}</p>
                    <p className="text-xl font-bold text-white">{payPeriodSummary.totalHours}h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-white/80">{t('timecard.days')}</p>
                    <p className="text-xl font-bold text-white">{payPeriodSummary.daysWorked}</p>
                  </div>
                </div>
              </div>
            </div>
              
                          
            <div className="p-4 overflow-auto flex-1">
              {!enrichedTimeCardData || calendarWeeks.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl text-muted-foreground mb-4 block">📋</span>
                  <p className="text-muted-foreground">{t('timecard.noTimecardDataAvailable')}</p>
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
      </div>
    </div>
    </>
  );
}
