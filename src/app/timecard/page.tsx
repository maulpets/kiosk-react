'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import EmployeeMenu from '@/components/EmployeeMenu';
import { useI18n } from '@/hooks/useI18n';
import { useTimeCard } from '@/hooks/useTimeCard';

export default function TimeCardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<'current' | 'previous'>('current');
  
  // Use the new timecard hook
  const { data: timeCardData, loading, error } = useTimeCard(selectedPayPeriod);

  const payPeriods = [
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

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading timecard data: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-company-primary text-white rounded hover:bg-company-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex h-full">
        {/* Employee Menu Sidebar */}
        <EmployeeMenu />
        
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
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
              
              {timeCardData && (
                <div className="text-right space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {formatDateRange(timeCardData.weekStart, timeCardData.weekEnd)}
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
            <div className="bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Regular Hours</p>
                  <p className="text-2xl font-bold text-foreground">{timeCardData.regularHours}</p>
                </div>
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground text-lg">🕒</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-company-accent/10 to-company-accent/20 border border-company-accent/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-company-accent">Overtime Hours</p>
                  <p className="text-2xl font-bold text-foreground">{timeCardData.overtimeHours}</p>
                </div>
                <div className="w-10 h-10 bg-company-accent rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">⚡</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-company-secondary/10 to-company-secondary/20 border border-company-secondary/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-company-secondary">Total Hours</p>
                  <p className="text-2xl font-bold text-foreground">{timeCardData.totalHours}</p>
                </div>
                <div className="w-10 h-10 bg-company-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-muted to-muted/50 border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Work Days</p>
                  <p className="text-2xl font-bold text-foreground">{timeCardData.entries.length}</p>
                </div>
                <div className="w-10 h-10 bg-muted-foreground rounded-lg flex items-center justify-center">
                  <span className="text-background text-lg">📅</span>
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
                Detailed breakdown for {timeCardData.payPeriod}
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
                <div className="space-y-6">
                  {timeCardData.entries.map((entry) => (
                    <div key={entry.id} className="space-y-4">
                      {/* Date Header */}
                      <div className="flex items-center justify-between bg-gradient-to-r from-accent to-accent/80 text-accent-foreground p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <div className="text-sm text-accent-foreground/80">
                          {entry.totalHours} hours
                        </div>
                      </div>

                      {/* Day Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-card border rounded-lg p-4">
                          <div className="text-sm text-muted-foreground mb-1">Clock In</div>
                          <div className="text-lg font-semibold text-foreground">{entry.clockIn}</div>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                          <div className="text-sm text-muted-foreground mb-1">Clock Out</div>
                          <div className="text-lg font-semibold text-foreground">{entry.clockOut}</div>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                          <div className="text-sm text-muted-foreground mb-1">Break Time</div>
                          <div className="text-lg font-semibold text-foreground">{entry.breakTime} min</div>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                          <div className="text-sm text-muted-foreground mb-1">Total Hours</div>
                          <div className="text-lg font-semibold text-foreground">{entry.totalHours}</div>
                        </div>
                      </div>

                      {/* All Transactions Timeline */}
                      {entry.transactions && entry.transactions.length > 0 && (
                        <div className="bg-card border rounded-lg p-6">
                          <h4 className="text-md font-semibold text-foreground mb-4 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Transaction Timeline
                          </h4>
                          <div className="space-y-3">
                            {entry.transactions.map((transaction, index) => (
                              <div key={index} className="flex items-center justify-between border-l-2 border-primary/20 pl-4 py-2">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    <div className="w-3 h-3 bg-primary rounded-full -ml-6 border-2 border-background"></div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground">{transaction.type}</div>
                                    <div className="text-sm text-muted-foreground">{transaction.department}</div>
                                    {transaction.notes && (
                                      <div className="text-sm text-muted-foreground italic">{transaction.notes}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono text-sm text-foreground">{transaction.time}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Trans #{transaction.transType}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Activity Indicators */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          <span>🏢</span>
                          <span>{entry.workedShifts} shifts</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs bg-company-secondary/10 text-company-secondary px-2 py-1 rounded">
                          <span>💰</span>
                          <span>{entry.payLines} pay</span>
                        </div>
                        {entry.adjustments > 0 && (
                          <div className="flex items-center gap-1 text-xs bg-company-accent/10 text-company-accent px-2 py-1 rounded">
                            <span>⚙️</span>
                            <span>{entry.adjustments} adj</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {entry.notes && (
                        <div className="bg-muted/50 border rounded-lg p-4">
                          <div className="text-sm text-muted-foreground mb-1">Notes</div>
                          <div className="text-foreground">{entry.notes}</div>
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
        </div>
      </div>
    </PageLayout>
  );
}
