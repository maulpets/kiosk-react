'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import { useKioskEmployeeData } from '@/hooks/useKioskEmployeeData';
import { useI18n } from '@/hooks/useI18n';
import { getLocaleString } from '@/lib/i18n';
import { KioskStartupResponse, OpenItem } from '@/types';

// Response types for different attestation types
interface TimeCardApprovalResponse {
  approval: 'approve';
}

interface MissingPunchResponse {
  date: string;
  time: string;
  punchType: 'missing_punch';
}

interface YesNoResponse {
  choice: 'yes' | 'no';
}

type AttestResponse = TimeCardApprovalResponse | MissingPunchResponse | YesNoResponse;

interface ActionItemCardProps {
  item: OpenItem;
  onItemClick: (item: OpenItem) => void;
  t: (key: string, variables?: (string | number)[]) => string;
  locale: string;
}

interface AttestFormProps {
  item: OpenItem;
  onSubmit: (item: OpenItem, response: AttestResponse) => void;
  onCancel: () => void;
  t: (key: string, variables?: (string | number)[]) => string;
}

function AttestForm({ item, onSubmit, onCancel, t }: AttestFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [yesNoChoice, setYesNoChoice] = useState<'yes' | 'no' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize date field for missing punch attest
  React.useEffect(() => {
    if (item.responseRequest.emplOperation === 2 && item.responseRequestEvent?.eventDate) {
      const eventDate = new Date(item.responseRequestEvent.eventDate);
      const minDate = new Date(item.responseRequestEvent.minDate);
      const maxDate = new Date(item.responseRequestEvent.maxDate);
      
      // If eventDate is within range, use it as default
      if (eventDate >= minDate && eventDate <= maxDate) {
        setSelectedDate(item.responseRequestEvent.eventDate.split('T')[0]);
      }
    }
  }, [item]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    let response: AttestResponse;
    
    switch (item.responseRequest.emplOperation) {
      case 1: // Time card approval
        response = { approval: 'approve' };
        break;
      case 2: // Missing punch attest
        if (!selectedDate || !selectedTime) {
          alert(t('actionRequired.missingPunchError'));
          setIsSubmitting(false);
          return;
        }
        response = { 
          date: selectedDate,
          time: selectedTime,
          punchType: 'missing_punch'
        };
        break;
      case 3: // Yes/No attest
        if (!yesNoChoice) {
          alert(t('actionRequired.yesNoError'));
          setIsSubmitting(false);
          return;
        }
        response = { choice: yesNoChoice };
        break;
      default:
        alert(t('actionRequired.unknownAttestType'));
        setIsSubmitting(false);
        return;
    }
    
    try {
      await onSubmit(item, response);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting attest:', error);
      alert(t('actionRequired.submitError'));
      setIsSubmitting(false);
    }
  };

  const handleViewTimecard = () => {
    router.push('/timecard');
  };

  const getAttestTypeTitle = () => {
    switch (item.responseRequest.emplOperation) {
      case 1: return t('actionRequired.timeCardApproval');
      case 2: return t('actionRequired.missingPunchAttest');
      case 3: return t('actionRequired.yesNoAttest');
      default: return t('actionRequired.attest');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-card-foreground">
                {getAttestTypeTitle()}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {item.responseRequest.descr}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Instructions */}
          {item.responseRequest.instructions && (
            <div className="bg-muted/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-muted-foreground">
                {item.responseRequest.instructions}
              </p>
            </div>
          )}

          {/* Form Content based on emplOperation */}
          <div className="space-y-4">
            {/* Time Card Approval (emplOperation 1) */}
            {item.responseRequest.emplOperation === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('actionRequired.timeCardApprovalDesc')}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleViewTimecard}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {t('actionRequired.viewTimecard')}
                  </button>
                </div>
              </div>
            )}

            {/* Missing Punch Attest (emplOperation 2) */}
            {item.responseRequest.emplOperation === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    {t('actionRequired.selectDate')}
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={item.responseRequestEvent?.minDate?.split('T')[0]}
                    max={item.responseRequestEvent?.maxDate?.split('T')[0]}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                  {item.responseRequestEvent?.minDate && item.responseRequestEvent?.maxDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('actionRequired.dateRange', [
                        new Date(item.responseRequestEvent.minDate).toLocaleDateString(),
                        new Date(item.responseRequestEvent.maxDate).toLocaleDateString()
                      ])}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    {t('actionRequired.selectTime')}
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>
            )}

            {/* Yes/No Attest (emplOperation 3) */}
            {item.responseRequest.emplOperation === 3 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('actionRequired.yesNoDesc')}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setYesNoChoice('yes')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                      yesNoChoice === 'yes'
                        ? 'border-company-accent bg-company-accent/10 text-company-accent'
                        : 'border-border hover:border-company-accent/50'
                    }`}
                  >
                    {t('actionRequired.yes')}
                  </button>
                  <button
                    onClick={() => setYesNoChoice('no')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                      yesNoChoice === 'no'
                        ? 'border-destructive bg-destructive/10 text-destructive'
                        : 'border-border hover:border-destructive/50'
                    }`}
                  >
                    {t('actionRequired.no')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-border">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {t('actionRequired.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-company-accent hover:bg-company-accent/90 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? t('actionRequired.submitting') : t('actionRequired.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionItemCard({ item, onItemClick, t, locale }: ActionItemCardProps) {
  const getItemTypeColor = (emplOperation: number) => {
    switch (emplOperation) {
      case 1: // Time card approval
        return 'bg-company-primary/10 text-company-primary border-company-primary/20';
      case 2: // Missing punch
        return 'bg-company-accent/10 text-company-accent border-company-accent/20';
      case 3: // Yes/No attestation
        return 'bg-company-secondary/10 text-company-secondary border-company-secondary/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getItemTypeLabel = (item: OpenItem) => {
    switch (item.responseRequest.emplOperation) {
      case 1:
        return t('actionRequired.itemTypes.timeCardApproval');
      case 2:
        return t('actionRequired.itemTypes.missingPunch');
      case 3:
        return t('actionRequired.itemTypes.attestation');
      default:
        return t('actionRequired.itemTypes.default');
    }
  };

  return (
    <button
      onClick={() => onItemClick(item)}
      className="w-full p-4 md:p-6 border border-border rounded-xl hover:bg-muted/30 transition-colors text-left"
    >
      <div className="flex items-start justify-between space-x-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getItemTypeColor(item.responseRequest.emplOperation)}`}>
              {getItemTypeLabel(item)}
            </span>
            {item.responseRequestEvent?.eventDate && (
              <span className="text-xs text-muted-foreground">
                {new Date(item.responseRequestEvent.eventDate).toLocaleDateString(locale, { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            )}
          </div>
          
          <h3 className="font-bold text-card-foreground text-base md:text-lg mb-2">
            {item.responseRequest.descr}
          </h3>
          
          {item.responseRequest.caption && item.responseRequest.caption !== item.responseRequest.descr && (
            <h4 className="font-medium text-muted-foreground text-sm mb-2">
              {item.responseRequest.caption}
            </h4>
          )}
          
          {item.responseRequest.instructions && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.responseRequest.instructions}
            </p>
          )}
          
          <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
            {item.responseRequestEvent?.eventDate && (
              <span>
                {t('actionRequired.event')} {new Date(item.responseRequestEvent.eventDate).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center space-x-1">
              <span>{item.icon}</span>
              <span>{t('actionRequired.id')} {item.itemdata}</span>
            </span>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

export default function ActionRequiredPage() {
  const { state } = useAppContext();
  const { t, locale } = useI18n();
  const localeString = getLocaleString(locale);
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<OpenItem | null>(null);
  
  // Fetch kiosk startup data
  const { data: kioskData, loading, error } = useKioskEmployeeData({
    employeeId: state.user?.id,
    autoFetch: true,
  });

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleItemClick = (item: OpenItem) => {
    setSelectedItem(item);
  };

  const handleAttestSubmit = async (item: OpenItem, response: AttestResponse) => {
    // Here you would submit the attestation to the backend
    console.log('Submitting attestation:', { item: item.itemdata, response });
    
    // For now, just show success message and close form
    alert(t('actionRequired.submitSuccess'));
    setSelectedItem(null);
    
    // In a real app, you might want to:
    // 1. Call an API to submit the attestation
    // 2. Refresh the open items list
    // 3. Show proper success/error handling
  };

  const handleAttestCancel = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-background flex items-center justify-center">
        <div className="w-full max-w-full px-4 md:px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-company-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !kioskData) {
    return (
      <div className="h-full w-full bg-background flex items-center justify-center">
        <div className="w-full max-w-full px-4 md:px-6 py-8">
          <div className="text-center text-destructive">
            <p>{t('actionRequired.errorLoading', [error || t('actionRequired.unknownError')])}</p>
            <button 
              onClick={handleBackToDashboard}
              className="mt-4 px-4 py-2 bg-company-accent text-white rounded-lg"
            >
              {t('actionRequired.backToDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const typedKioskData = kioskData as KioskStartupResponse;
  const openItems = typedKioskData?.openItems || [];

  return (
    <div className="h-full w-full bg-background overflow-auto">
      <div className="w-full max-w-full px-4 md:px-6 py-4 md:py-8 min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('actionRequired.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {openItems.length === 1 
                ? t('actionRequired.subtitleSingle')
                : t('actionRequired.subtitleMultiple', [openItems.length.toString()])
              }
            </p>
          </div>
          
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{t('actionRequired.backToDashboard')}</span>
          </button>
        </div>

        {/* Action Items List */}
        {openItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-card-foreground mb-2">
              {t('actionRequired.noActionsTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('actionRequired.noActionsMessage')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {openItems.map((item) => (
              <ActionItemCard
                key={item.itemdata}
                item={item}
                onItemClick={handleItemClick}
                t={t}
                locale={localeString}
              />
            ))}
          </div>
        )}

        {/* Attest Form Modal */}
        {selectedItem && (
          <AttestForm
            item={selectedItem}
            onSubmit={handleAttestSubmit}
            onCancel={handleAttestCancel}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
