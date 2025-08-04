'use client';

import { useState } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { DayDetailData, WeeklyTimeCardData } from '@/types';
import { getLocaleString } from '@/lib/i18n';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDayData: DayDetailData | null;
  timeCardData: WeeklyTimeCardData | null;
  onNavigateDate: (direction: 'prev' | 'next') => void;
}

export default function DayDetailModal({ 
  isOpen, 
  onClose, 
  selectedDayData, 
  timeCardData,
  onNavigateDate 
}: DayDetailModalProps) {
  const { t, locale } = useI18n();
  const localeString = getLocaleString(locale);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'payLines' | 'incidents'>('overview');

  // Debug logging
  if (isOpen && selectedDayData) {
    console.log('DayDetailModal - selectedDayData:', selectedDayData);
    console.log('DayDetailModal - rawNotes:', selectedDayData.rawNotes);
    console.log('DayDetailModal - rawNotes length:', selectedDayData.rawNotes?.length);
  }

  if (!isOpen || !selectedDayData) return null;

  const date = new Date(selectedDayData.date || new Date());
  const formattedDate = date.toLocaleDateString(localeString, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Helper to check if navigation is available
  const canNavigatePrev = () => {
    if (!timeCardData?.entries) return false;
    const currentDateStr = selectedDayData.date?.split('T')[0];
    const currentIndex = timeCardData.entries.findIndex(entry => 
      entry.date.split('T')[0] === currentDateStr
    );
    return currentIndex > 0;
  };

  const canNavigateNext = () => {
    if (!timeCardData?.entries) return false;
    const currentDateStr = selectedDayData.date?.split('T')[0];
    const currentIndex = timeCardData.entries.findIndex(entry => 
      entry.date.split('T')[0] === currentDateStr
    );
    return currentIndex < timeCardData.entries.length - 1;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-company-primary to-company-secondary p-4 text-white">
          <div className="flex items-center justify-between">
            {/* Left Navigation */}
            <button
              onClick={() => onNavigateDate('prev')}
              disabled={!canNavigatePrev()}
              className={`p-2 rounded-full transition-colors ${
                canNavigatePrev() 
                  ? 'hover:bg-white/20 text-white' 
                  : 'text-white/50 cursor-not-allowed'
              }`}
              title="Previous day"
            >
              ←
            </button>
            
            {/* Centered Date */}
            <div className="text-center">
              <h2 className="text-xl font-bold">{formattedDate}</h2>
            </div>
            
            {/* Right side with Navigation and Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateDate('next')}
                disabled={!canNavigateNext()}
                className={`p-2 rounded-full transition-colors ${
                  canNavigateNext() 
                    ? 'hover:bg-white/20 text-white' 
                    : 'text-white/50 cursor-not-allowed'
                }`}
                title="Next day"
              >
                →
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-white/70 text-2xl font-bold ml-2"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex flex-col max-h-[calc(90vh-120px)]">
          
          {/* Tab Navigation */}
          <div className="border-b border-border px-6 pt-4">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: t('timecard.overview'), icon: '📊' },
                { id: 'notes', label: t('timecard.notes'), icon: '📝', count: selectedDayData.rawNotes?.length || 0 },
                { id: 'payLines', label: t('timecard.payLines'), icon: '💰', count: selectedDayData.rawPayLines?.length || 0 },
                { id: 'incidents', label: t('timecard.incidents'), icon: '⚠️', count: selectedDayData.dailyExceptions?.length || 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'notes' | 'payLines' | 'incidents')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-company-primary text-company-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === tab.id
                          ? 'bg-company-primary text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Summary Section */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-foreground">{t('timecard.summary')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('timecard.totalHours')}:</span>
                  <span className="font-medium">{selectedDayData.totalHours || 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('timecard.status')}:</span>
                  <span className={`font-medium capitalize ${
                    selectedDayData.status === t('timecard.completed') ? 'text-accent' :
                    selectedDayData.status === t('timecard.inProgress') ? 'text-company-accent' :
                    'text-muted-foreground'
                  }`}>
                    {selectedDayData.status || t('timecard.noData')}
                  </span>
                </div>
                {selectedDayData.clockIn && (
                  <div className="flex justify-between">
                    <span>{t('timecard.clockIn')}:</span>
                    <span className="font-medium">{selectedDayData.clockIn}</span>
                  </div>
                )}
                {selectedDayData.clockOut && (
                  <div className="flex justify-between">
                    <span>{t('timecard.clockOut')}:</span>
                    <span className="font-medium">{selectedDayData.clockOut}</span>
                  </div>
                )}
                {selectedDayData.ptoHours && selectedDayData.ptoHours > 0 && (
                  <div className="flex justify-between">
                    <span>{t('timecard.ptoHours')}:</span>
                    <span className="font-medium text-company-accent">{selectedDayData.ptoHours}h ({selectedDayData.ptoType})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Transactions Section */}
            {selectedDayData.transactions && selectedDayData.transactions.length > 0 && (
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <h3 className="text-lg font-semibold mb-3 text-foreground">{t('timecard.transactions')}</h3>
                <div className="space-y-2">
                  {selectedDayData.transactions?.map((transaction, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm border-b border-primary/20 pb-2">
                      <div>
                        <span className="font-medium">{transaction.time}</span>
                        <span className="text-muted-foreground ml-2">{transaction.notes}</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.type === 'punch' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
                        }`}>
                          {transaction.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pay Lines Section - spanning full width if exists */}
            {selectedDayData.rawPayLines && selectedDayData.rawPayLines.length > 0 && (
              <div className="lg:col-span-2 bg-accent/5 rounded-lg p-4 border border-accent/10">
                <h3 className="text-lg font-semibold mb-3 text-foreground">{t('timecard.payLines')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDayData.rawPayLines?.map((payLine, idx: number) => (
                    <div key={idx} className="bg-card rounded p-3 border border-accent/20">
                      <div className="text-sm space-y-1">
                        <div className="font-medium text-card-foreground">{payLine.payDes?.name || t('timecard.payLine')}</div>
                        <div className="text-muted-foreground">{t('timecard.hours')}: {payLine.hundHours || 0}h</div>
                        <div className="text-muted-foreground">{t('timecard.workGroup')}: {payLine.wg?.workPositionName || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adjustments Section */}
            {selectedDayData.rawAdjustments && selectedDayData.rawAdjustments.length > 0 && (
              <div className="lg:col-span-2 bg-company-accent/5 rounded-lg p-4 border border-company-accent/10">
                <h3 className="text-lg font-semibold mb-3 text-foreground">{t('timecard.adjustments')}</h3>
                <div className="space-y-3">
                  {selectedDayData.rawAdjustments?.slice(0, 5).map((adjustment, idx: number) => (
                    <div key={idx} className="bg-card rounded p-3 border border-company-accent/20">
                      <div className="text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-card-foreground">{t('timecard.editType')}: {adjustment.editType}</div>
                            <div className="text-muted-foreground">{t('timecard.hours')}: {adjustment.hundHours || 0}h</div>
                            <div className="text-muted-foreground">{t('timecard.user')}: {adjustment.aeUserCode}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {adjustment.timestamp ? new Date(adjustment.timestamp).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(selectedDayData.rawAdjustments?.length || 0) > 5 && (
                    <div className="text-center text-sm text-muted-foreground">
                      {t('timecard.moreAdjustments', [(selectedDayData.rawAdjustments?.length || 0) - 5])}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Daily Exceptions Section */}
            {selectedDayData.dailyExceptions && selectedDayData.dailyExceptions.length > 0 && (
              <div className="lg:col-span-2 bg-destructive/5 rounded-lg p-4 border border-destructive/10">
                <h3 className="text-lg font-semibold mb-3 text-foreground">{t('timecard.dailyExceptions')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDayData.dailyExceptions?.map((exception, idx: number) => (
                    <div key={idx} className="bg-card rounded p-3 border border-destructive/20">
                      <div className="text-sm">
                        <div className="font-medium text-destructive">{exception.name}</div>
                        <div className="text-muted-foreground">{t('timecard.hours')}: {exception.hundHours || 0}h</div>
                        <div className="text-muted-foreground">{t('timecard.exceptionId')}: {exception.shiftException}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {selectedDayData.rawNotes && selectedDayData.rawNotes.length > 0 && (
              <div className="lg:col-span-2 bg-secondary/5 rounded-lg p-4 border border-secondary/10">
                <h3 className="text-lg font-semibold mb-3 text-foreground">{t('timecard.notes')}</h3>
                <div className="space-y-2">
                  {selectedDayData.rawNotes?.map((note, idx: number) => (
                    <div key={idx} className="bg-card rounded p-3 border border-secondary/20">
                      <div className="text-sm">
                        <div className="font-medium text-card-foreground">{t('timecard.note')} {note.itemdata}</div>
                        <div className="text-muted-foreground mt-1">{note.memoText}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-foreground">{t('timecard.notes')}</h3>
                  <button className="px-4 py-2 bg-company-primary text-white rounded-lg hover:bg-company-primary/90 transition-colors">
                    {t('timecard.addNote')}
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedDayData.rawNotes && selectedDayData.rawNotes.length > 0 ? (
                    selectedDayData.rawNotes.map((note, index) => (
                      <div key={index} className="bg-card p-4 rounded-lg border border-border shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm text-muted-foreground">
                            {t('timecard.note')} {note.itemdata}
                          </div>
                          <button className="text-muted-foreground hover:text-foreground">
                            ⋯
                          </button>
                        </div>
                        <div className="text-card-foreground">{note.memoText}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground text-4xl mb-2">📝</div>
                      <div className="text-muted-foreground">{t('timecard.noNotesRecorded')}</div>
                      <div className="text-sm text-muted-foreground mt-1">{t('timecard.clickToCreateFirstNote')}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'payLines' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-foreground">{t('timecard.payLines')}</h3>
                  <button className="px-4 py-2 bg-company-primary text-white rounded-lg hover:bg-company-primary/90 transition-colors">
                    {t('timecard.addPayLine')}
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedDayData.rawPayLines && selectedDayData.rawPayLines.length > 0 ? (
                    selectedDayData.rawPayLines.map((payLine, index) => (
                      <div key={index} className="bg-card p-4 rounded-lg border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-lg text-card-foreground">{payLine.payDes?.name || t('timecard.payLine')}</span>
                              <span className="font-bold text-company-primary text-xl">{payLine.hundHours}h</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div>{t('timecard.workGroup')}: <span className="font-medium">{payLine.wg?.workPositionName || 'N/A'}</span></div>
                              <div>{t('timecard.hours')}: <span className="font-medium">{payLine.hundHours || 0}h</span></div>
                            </div>
                          </div>
                          <button className="text-muted-foreground hover:text-foreground ml-4">
                            ⋯
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground text-4xl mb-2">💰</div>
                      <div className="text-muted-foreground">{t('timecard.noPayLinesRecorded')}</div>
                      <div className="text-sm text-muted-foreground mt-1">{t('timecard.clickToCreateFirstPayLine')}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'incidents' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-foreground">{t('timecard.incidents')}</h3>
                  <button className="px-4 py-2 bg-company-primary text-white rounded-lg hover:bg-company-primary/90 transition-colors">
                    {t('timecard.reportIncident')}
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedDayData.dailyExceptions && selectedDayData.dailyExceptions.length > 0 ? (
                    selectedDayData.dailyExceptions.map((exception, index) => (
                      <div key={index} className="bg-card p-4 rounded-lg border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-lg text-card-foreground">{exception.name}</span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
                                {t('timecard.exception')}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {t('timecard.hours')}: {exception.hundHours || 0}h - ID: {exception.shiftException}
                            </div>
                            <div className="text-card-foreground">{t('timecard.exceptionRecordedFor', [exception.name || 'Unknown'])}</div>
                          </div>
                          <button className="text-muted-foreground hover:text-foreground ml-4">
                            ⋯
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground text-4xl mb-2">⚠️</div>
                      <div className="text-muted-foreground">{t('timecard.noIncidentsRecorded')}</div>
                      <div className="text-sm text-muted-foreground mt-1">{t('timecard.clickToReportIncident')}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
