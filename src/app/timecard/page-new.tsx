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

interface PayPeriodInfo {
  id: string;
  name: string;
  begins: string;
  ends: string;
  isCurrent: boolean;
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
  payPeriodInfo?: PayPeriodInfo;
}

export default function TimeCardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeCardData, setTimeCardData] = useState<WeeklyData | null>(null);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<'current' | 'previous'>('current');

  const payPeriods: PayPeriodInfo[] = [
    {
      id: 'current',
      name: 'Current Pay Period',
      begins: '2019-08-11',
      ends: '2019-08-24',
      isCurrent: true
    },
    {
      id: 'previous', 
      name: 'Previous Pay Period',
      begins: '2019-07-28',
      ends: '2019-08-10',
      isCurrent: false
    }
  ];

  const fetchTimeCardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call the API endpoint
      const response = await fetch(`/api/time-card?payPeriod=${selectedPayPeriod}&employeeId=496`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const selectedPeriod = payPeriods.find(p => p.id === selectedPayPeriod);
        setTimeCardData({
          ...result.data,
          payPeriodInfo: selectedPeriod
        });
      } else {
        console.error('API returned error:', result.message);
        // Fallback to mock data if API fails
        const selectedPeriod = payPeriods.find(p => p.id === selectedPayPeriod);
        const mockData: WeeklyData = {
          weekStart: selectedPeriod?.begins || '2019-08-11',
          weekEnd: selectedPeriod?.ends || '2019-08-24',
          entries: [],
          totalHours: 42.5,
          regularHours: 40,
          overtimeHours: 2.5,
          employeeId: '496',
          employeeName: 'Harry Howard',
          payPeriod: selectedPeriod?.name || 'Current Pay Period',
          payPeriodInfo: selectedPeriod
        };
        setTimeCardData(mockData);
      }
    } catch (error) {
      console.error('Error fetching timecard data:', error);
      // Fallback to mock data on error
      const selectedPeriod = payPeriods.find(p => p.id === selectedPayPeriod);
      const mockData: WeeklyData = {
        weekStart: selectedPeriod?.begins || '2019-08-11',
        weekEnd: selectedPeriod?.ends || '2019-08-24',
        entries: [],
        totalHours: 42.5,
        regularHours: 40,
        overtimeHours: 2.5,
        employeeId: '496',
        employeeName: 'Harry Howard',
        payPeriod: selectedPeriod?.name || 'Current Pay Period',
        payPeriodInfo: selectedPeriod
      };
      setTimeCardData(mockData);
    } finally {
      setLoading(false);
    }
  }, [selectedPayPeriod]);

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

  const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getDayNumber = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.getDate().toString();
  };

  const getMonthYear = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Employee Info */}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground">
                {timeCardData?.employeeName || 'Employee'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-company-primary rounded-full"></span>
                  ID: {timeCardData?.employeeId}
                </span>
                {timeCardData?.position && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-company-accent rounded-full"></span>
                    {timeCardData.position}
                  </span>
                )}
                {timeCardData?.department && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-company-secondary rounded-full"></span>
                    {timeCardData.department}
                  </span>
                )}
              </div>
            </div>

            {/* Pay Period Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Pay Period</label>
                <div className="flex bg-muted rounded-lg p-1">
                  {payPeriods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPayPeriod(period.id as 'current' | 'previous')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedPayPeriod === period.id
                          ? 'bg-company-primary text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {period.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {timeCardData?.payPeriodInfo && (
                <div className="text-right space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {formatDateRange(timeCardData.payPeriodInfo.begins, timeCardData.payPeriodInfo.ends)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {timeCardData.payClass}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {timeCardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Regular Hours</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{timeCardData.regularHours}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🕒</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Overtime Hours</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{timeCardData.overtimeHours}</p>
                </div>
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">⚡</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Hours</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{timeCardData.totalHours}</p>
                </div>
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Work Days</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{timeCardData.entries.length}</p>
                </div>
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📅</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Entries Grid */}
        {timeCardData && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-company-primary to-company-secondary p-6">
              <h2 className="text-xl font-bold text-white">Daily Time Entries</h2>
              <p className="text-white/80 text-sm mt-1">
                Detailed breakdown for {timeCardData.payPeriodInfo?.name}
              </p>
            </div>
            
            <div className="p-6">
              {timeCardData.entries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-muted-foreground">📋</span>
                  </div>
                  <p className="text-muted-foreground text-lg">No time entries for this pay period</p>
                  <p className="text-muted-foreground text-sm mt-1">Time entries will appear here when available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {timeCardData.entries.map((entry) => (
                    <div key={entry.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                      {/* Date Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-foreground">{getDayNumber(entry.date)}</div>
                            <div className="text-xs text-muted-foreground">{getMonthYear(entry.date)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{getDayName(entry.date)}</div>
                            <div className="text-sm text-muted-foreground">{formatDate(entry.date)}</div>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          entry.status === 'completed' ? 'bg-green-500' : 
                          entry.status === 'in-progress' ? 'bg-company-primary' : 'bg-orange-500'
                        }`} />
                      </div>
                      
                      {/* Time Info */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Clock In:</span>
                          <span className="font-medium text-foreground">{entry.clockIn}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Clock Out:</span>
                          <span className="font-medium text-foreground">
                            {entry.clockOut || 'In Progress'}
                          </span>
                        </div>
                        {entry.totalHours && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-bold text-company-accent">{entry.totalHours}h</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Activity Indicators */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          <span>🏢</span>
                          <span>{entry.workedShifts} shifts</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                          <span>💰</span>
                          <span>{entry.payLines} pay</span>
                        </div>
                        {entry.adjustments > 0 && (
                          <div className="flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                            <span>⚙️</span>
                            <span>{entry.adjustments} adj</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Project & Notes */}
                      {entry.project && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Project:</span> {entry.project}
                        </div>
                      )}
                      
                      {entry.notes && (
                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          <span className="font-medium">📝</span> {entry.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors flex items-center gap-2"
          >
            <span>←</span>
            {t('common.back')} to Dashboard
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-company-primary hover:bg-company-primary/90 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>🖨️</span>
            Print Time Card
          </button>
          
          <button
            onClick={() => {
              // Future: Export functionality
              alert('Export functionality coming soon!');
            }}
            className="px-6 py-3 bg-company-secondary hover:bg-company-secondary/90 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>📤</span>
            Export Data
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
