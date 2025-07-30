'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { useI18n } from '@/hooks/useI18n';
import { useTimeCard } from '@/hooks/useTimeCard';
import { useKioskEmployeeData } from '@/hooks/useKioskEmployeeData';
import { useAppContext } from '@/store/AppContext';
import { WeeklyTimeCardData, PayPeriodInfo } from '@/types';

export default function TimeCardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { state } = useAppContext();
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<'current' | 'previous'>('current');

  // Get the logged-in user's employee ID
  const employeeId = state.user?.id;

  // Get employee data to extract pay periods
  const { data: employeeData } = useKioskEmployeeData({ 
    employeeId: employeeId || '', 
    autoFetch: !!employeeId 
  });

  // Get timecard data using the hook
  const { data: timeCardData, loading, error } = useTimeCard(selectedPayPeriod, employeeId);

  // Extract pay periods from employee data
  const payPeriods: PayPeriodInfo[] = useMemo(() => {
    if (!employeeData?.context) {
      return [];
    }

    const context = employeeData.context;
    return [
      {
        id: 'current',
        name: 'Current Pay Period',
        begins: context.currentPeriodBegins?.split('T')[0] || '',
        ends: context.currentPeriodEnds?.split('T')[0] || '',
        isCurrent: true
      },
      {
        id: 'previous',
        name: 'Previous Pay Period', 
        begins: context.previousPeriodBegins?.split('T')[0] || '',
        ends: context.previousPeriodEnds?.split('T')[0] || '',
        isCurrent: false
      }
    ];
  }, [employeeData]);

  // Add pay period info to timecard data
  const enrichedTimeCardData: WeeklyTimeCardData | null = useMemo(() => {
    if (!timeCardData) return null;
    
    const selectedPeriod = payPeriods.find(p => p.id === selectedPayPeriod);
    return {
      ...timeCardData,
      payPeriodInfo: selectedPeriod
    };
  }, [timeCardData, payPeriods, selectedPayPeriod]);

  // If no user is logged in, redirect to login
  if (!state.user) {
    router.push('/login');
    return null;
  }

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Employee Info */}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground">
                {enrichedTimeCardData?.employeeName || 'Employee'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-company-primary rounded-full"></span>
                  ID: {enrichedTimeCardData?.employeeId}
                </span>
                {enrichedTimeCardData?.position && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-company-accent rounded-full"></span>
                    {enrichedTimeCardData.position}
                  </span>
                )}
                {enrichedTimeCardData?.department && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-company-secondary rounded-full"></span>
                    {enrichedTimeCardData.department}
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
              
              {enrichedTimeCardData?.payPeriodInfo && (
                <div className="text-right space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {formatDateRange(enrichedTimeCardData.payPeriodInfo.begins, enrichedTimeCardData.payPeriodInfo.ends)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {enrichedTimeCardData.payClass}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {enrichedTimeCardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Regular Hours</p>
                  <p className="text-2xl font-bold text-foreground">{enrichedTimeCardData.regularHours}</p>
                </div>
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground text-lg">🕒</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-company-accent/10 to-company-accent/20 border border-company-accent/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-company-accent">Overtime Hours</p>
                  <p className="text-2xl font-bold text-foreground">{enrichedTimeCardData.overtimeHours}</p>
                </div>
                <div className="w-10 h-10 bg-company-accent rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">⚡</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-accent/10 to-accent/20 border border-accent/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-accent-foreground">Total Hours</p>
                  <p className="text-2xl font-bold text-foreground">{enrichedTimeCardData.totalHours}</p>
                </div>
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-foreground text-lg">📊</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 border border-secondary/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-foreground">Work Days</p>
                  <p className="text-2xl font-bold text-foreground">{enrichedTimeCardData.entries.length}</p>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <span className="text-secondary-foreground text-lg">📅</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Entries Grid */}
        {enrichedTimeCardData && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-company-primary to-company-secondary p-6">
              <h2 className="text-xl font-bold text-white">Daily Time Entries</h2>
              <p className="text-white/80 text-sm mt-1">
                Detailed breakdown for {enrichedTimeCardData.payPeriodInfo?.name}
              </p>
            </div>
            
            <div className="p-6">
              {enrichedTimeCardData.entries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-muted-foreground">📋</span>
                  </div>
                  <p className="text-muted-foreground text-lg">No time entries for this pay period</p>
                  <p className="text-muted-foreground text-sm mt-1">Time entries will appear here when available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {enrichedTimeCardData.entries.map((entry) => (
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
                          entry.status === 'completed' ? 'bg-accent' : 
                          entry.status === 'in-progress' ? 'bg-company-primary' : 'bg-muted'
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
                        <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          <span>🏢</span>
                          <span>{entry.workedShifts} shifts</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs bg-accent/10 text-accent-foreground px-2 py-1 rounded">
                          <span>💰</span>
                          <span>{entry.payLines} pay</span>
                        </div>
                        {entry.adjustments > 0 && (
                          <div className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
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
