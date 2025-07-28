'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { useI18n } from '@/hooks/useI18n';

interface TimeEntry {
  id: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakTime?: number;
  totalHours?: number;
  status: 'completed' | 'in-progress' | 'pending';
  project?: string;
  notes?: string;
  workedShifts: number;
  payLines: number;
  adjustments: number;
}

interface WeeklyData {
  weekStart: string;
  weekEnd: string;
  entries: TimeEntry[];
  totalHours: number;
  overtimeHours: number;
  regularHours: number;
  employeeId: string;
  employeeName: string;
  payPeriod: string;
  payClass?: string;
  department?: string;
  position?: string;
}

const getWeekStart = (weeksAgo: number): string => {
  const today = new Date();
  const currentDay = today.getDay();
  const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1; // Monday start
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysToSubtract - (weeksAgo * 7));
  return weekStart.toISOString().split('T')[0];
};

const getWeekEnd = (weeksAgo: number): string => {
  const weekStart = new Date(getWeekStart(weeksAgo));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd.toISOString().split('T')[0];
};

const generateMockEntries = (weeksAgo: number): TimeEntry[] => {
  const entries: TimeEntry[] = [];
  const weekStart = new Date(getWeekStart(weeksAgo));
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip weekends for most entries
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Current week, today might be in progress
    const isToday = weeksAgo === 0 && date.toDateString() === new Date().toDateString();
    const isFuture = date > new Date();
    
    if (isFuture) continue;
    
    entries.push({
      id: `entry-${dateStr}`,
      date: dateStr,
      clockIn: '08:00',
      clockOut: isToday ? undefined : '17:00',
      breakTime: isToday ? undefined : 60,
      totalHours: isToday ? undefined : 8.5,
      status: isToday ? 'in-progress' : 'completed',
      project: 'General',
      notes: i === 2 ? 'Team meeting in the morning' : undefined,
      workedShifts: 1,
      payLines: 1,
      adjustments: 0
    });
  }
  
  return entries;
};

export default function TimeCardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeCardData, setTimeCardData] = useState<WeeklyData | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, -1 = last week, etc.

  const fetchTimeCardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call the API endpoint
      const response = await fetch(`/api/time-card?weekOffset=${Math.abs(selectedWeek)}&employeeId=1234`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setTimeCardData(result.data);
      } else {
        console.error('API returned error:', result.message);
        // Fallback to mock data if API fails
        const mockData: WeeklyData = {
          weekStart: getWeekStart(selectedWeek),
          weekEnd: getWeekEnd(selectedWeek),
          entries: generateMockEntries(selectedWeek),
          totalHours: 42.5,
          regularHours: 40,
          overtimeHours: 2.5,
          employeeId: '1234',
          employeeName: 'Test User',
          payPeriod: 'Mock Data'
        };
        setTimeCardData(mockData);
      }
    } catch (error) {
      console.error('Error fetching timecard data:', error);
      // Fallback to mock data on error
      const mockData: WeeklyData = {
        weekStart: getWeekStart(selectedWeek),
        weekEnd: getWeekEnd(selectedWeek),
        entries: generateMockEntries(selectedWeek),
        totalHours: 42.5,
        regularHours: 40,
        overtimeHours: 2.5,
        employeeId: '1234',
        employeeName: 'Test User',
        payPeriod: 'Mock Data'
      };
      setTimeCardData(mockData);
    } finally {
      setLoading(false);
    }
  }, [selectedWeek]);

  useEffect(() => {
    fetchTimeCardData();
  }, [fetchTimeCardData]);

  useEffect(() => {
    fetchTimeCardData();
  }, [fetchTimeCardData]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateRange = (startStr: string, endStr: string): string => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
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

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('dashboard.timeCard')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {timeCardData && formatDateRange(timeCardData.weekStart, timeCardData.weekEnd)}
            </p>
            {timeCardData && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">{timeCardData.employeeName}</span> • ID: {timeCardData.employeeId}
                </p>
                {timeCardData.position && timeCardData.department && (
                  <p className="text-sm text-muted-foreground">
                    {timeCardData.position} • {timeCardData.department}
                  </p>
                )}
                {timeCardData.payClass && (
                  <p className="text-sm text-muted-foreground">
                    {timeCardData.payClass}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedWeek(selectedWeek - 1)}
              className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              ← Previous
            </button>
            <span className="px-3 py-2 text-sm font-medium">
              {selectedWeek === 0 ? 'Current Week' : `${Math.abs(selectedWeek)} week${Math.abs(selectedWeek) > 1 ? 's' : ''} ago`}
            </span>
            <button
              onClick={() => setSelectedWeek(selectedWeek + 1)}
              disabled={selectedWeek >= 0}
              className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Weekly Summary */}
        {timeCardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Regular Hours</div>
              <div className="text-2xl font-bold text-foreground">{timeCardData.regularHours}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Overtime Hours</div>
              <div className="text-2xl font-bold text-company-accent">{timeCardData.overtimeHours}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Total Hours</div>
              <div className="text-2xl font-bold text-foreground">{timeCardData.totalHours}</div>
            </div>
          </div>
        )}

        {/* Time Entries */}
        {timeCardData && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Daily Entries</h2>
            </div>
            
            <div className="divide-y divide-border">
              {timeCardData.entries.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground">
                  No time entries for this week
                </div>
              ) : (
                timeCardData.entries.map((entry) => (
                  <div key={entry.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          entry.status === 'completed' ? 'bg-green-500' : 
                          entry.status === 'in-progress' ? 'bg-company-primary' : 'bg-orange-500'
                        }`} />
                        <div>
                          <div className="font-medium text-foreground">
                            {formatDate(entry.date)}
                          </div>
                          {entry.project && (
                            <div className="text-sm text-muted-foreground">
                              {entry.project}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          {entry.clockIn} - {entry.clockOut || 'In Progress'}
                        </div>
                        {entry.totalHours && (
                          <div className="text-sm text-muted-foreground">
                            {entry.totalHours}h total
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <div className="mt-2 text-sm text-muted-foreground pl-7">
                        📝 {entry.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
          >
            ← {t('common.back')} to Dashboard
          </button>
          
          <button
            onClick={() => {
              // In a real app, this would trigger a print/export function
              window.print();
            }}
            className="px-6 py-3 bg-company-primary hover:bg-company-primary/90 text-white rounded-lg transition-colors"
          >
            📄 Print Time Card
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
