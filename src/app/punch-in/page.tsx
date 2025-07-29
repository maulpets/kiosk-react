'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWebViewBridge } from '@/hooks/useWebViewBridge';
import { useAppContext } from '@/store/AppContext';
import { useKioskStartup } from '@/hooks/useKioskStartup';
import { useI18n } from '@/hooks/useI18n';
import { SubOperation, Employee } from '@/types/kiosk';
import { KioskStartupResponse, TransferOperation } from '@/types';
import EmployeeMenu from '@/components/EmployeeMenu';
import TransferFlow from '@/components/TransferFlow';

// Type for the payload sent to native
interface PunchInPayload {
  operationFkeyguid: string;
  subOperationId: string;
  employeeId: string;
  timestamp: number;
  clockTime: string;
  callbackId?: number;
  callbackCaption?: string;
  transferSelections?: Array<{levelId: number; optionId: string; optionName: string}>;
}

interface PunchInConfirmationProps {
  subOperation: SubOperation;
  employee: Employee;
  selectedCallback?: {id: number; caption: string} | null;
  transferSelections?: Array<{levelId: number; optionId: string; optionName: string}> | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function PunchInConfirmation({ subOperation, employee, selectedCallback, transferSelections, onConfirm, onCancel }: PunchInConfirmationProps) {
  const { t } = useI18n();
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getActionDescription = () => {
    switch (subOperation.id) {
      case 'start-shift':
        return 'You are about to start your work shift. This will record your clock-in time and begin tracking your hours for today.';
      case 'end-break':
        return 'You are returning from your break. This will record the end of your break period and resume tracking your work hours.';
      case 'end-lunch':
        return 'You are returning from lunch. This will record the end of your lunch period and resume tracking your work hours.';
      default:
        return `You are about to perform: ${subOperation.description}`;
    }
  };

  const getNextSteps = () => {
    switch (subOperation.id) {
      case 'start-shift':
        return [
          'Your shift will begin at the recorded time',
          'Break time will be tracked automatically',
          'Remember to punch out for breaks and lunch'
        ];
      case 'end-break':
        return [
          'Your break time has been recorded',
          'Work time tracking has resumed',
          'Next scheduled break available in your timecard'
        ];
      case 'end-lunch':
        return [
          'Your lunch time has been recorded',
          'Work time tracking has resumed',
          'Remaining work hours will be tracked until shift end'
        ];
      default:
        return ['Action will be recorded in your timecard'];
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-company-primary to-company-accent rounded-full flex items-center justify-center">
          <span className="text-4xl">{subOperation.icon}</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {subOperation.name}
        </h1>
        <p className="text-xl text-muted-foreground">
          {subOperation.description}
        </p>
      </div>

      {/* Current Time & Date */}
      <div className="bg-muted rounded-2xl p-6 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground mb-2">
            {currentTime}
          </div>
          <div className="text-lg text-muted-foreground">
            {currentDate}
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <div className="bg-card rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {employee.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-card-foreground">{employee.name}</h3>
            <p className="text-muted-foreground">{t('dashboard.badge')} {employee.id}</p>
            <p className="text-muted-foreground">{employee.department} - {employee.role}</p>
          </div>
        </div>
      </div>

      {/* Action Description */}
      <div className="bg-company-primary/10 border border-company-primary/20 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-company-primary text-lg mb-3">
          What happens next?
        </h3>
        <p className="text-muted-foreground mb-4">
          {getActionDescription()}
        </p>
        <ul className="space-y-2">
          {getNextSteps().map((step, index) => (
            <li key={index} className="flex items-start space-x-2 text-muted-foreground">
              <span className="text-company-accent mt-1">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Callback Information */}
      {selectedCallback && (
        <div className="bg-muted border border-border rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-foreground text-lg mb-3">
            Callback Option Selected
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📞</span>
            <div>
              <p className="text-foreground font-medium">
                Call Center
              </p>
              <p className="text-muted-foreground text-sm">
                Additional support
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Information */}
      {transferSelections && transferSelections.length > 0 && (
        <div className="bg-muted border border-border rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-foreground text-lg mb-3">
            Transfer Selections
          </h3>
          <div className="space-y-2">
            {transferSelections.map((selection, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="text-destructive font-medium">
                    Level {selection.levelId + 1}: {selection.optionName}
                  </p>
                </div>
              </div>
            ))}
            <p className="text-muted-foreground text-sm mt-2">
              These transfer selections will be applied to your punch-in
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 py-4 px-6 bg-muted hover:bg-muted/80 text-muted-foreground font-bold rounded-xl transition-colors"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>❌</span>
            <span>Cancel</span>
          </div>
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>✅</span>
            <span>Confirm {subOperation.name}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

interface CallbackSelectionProps {
  options: Array<{id: number; caption: string}>;
  onSelect: (option: {id: number; caption: string}) => void;
  onCancel: () => void;
}

function CallbackSelection({ options, onSelect, onCancel }: CallbackSelectionProps) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary to-primary rounded-full flex items-center justify-center">
          <span className="text-4xl">📞</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Select Callback Option
        </h1>
        <p className="text-xl text-muted-foreground">
          Choose your callback preference for this punch-in
        </p>
      </div>

      {/* Callback Options */}
      <div className="space-y-4 mb-6">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            className="w-full p-6 rounded-xl text-left transition-all bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center space-x-4">
              <span className="text-3xl">📞</span>
              <div>
                <div className="font-bold text-lg">{option.caption}</div>
                <div className="text-sm opacity-90">Select this callback option</div>
              </div>
              <div className="ml-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Cancel Button */}
      <button
        onClick={onCancel}
        className="w-full py-4 px-6 bg-muted hover:bg-muted/80 text-muted-foreground font-bold rounded-xl transition-colors"
      >
        <div className="flex items-center justify-center space-x-2">
          <span>❌</span>
          <span>Cancel</span>
        </div>
      </button>
    </div>
  );
}

export default function PunchInPage() {
  const { state } = useAppContext();
  const { sendToNative, isConnected } = useWebViewBridge();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the sub-operation data from URL params
  const subOperationId = searchParams.get('subOperation');
  const operationId = searchParams.get('operation');
  const callbackId = searchParams.get('callback'); // New: callback selection
  const skipTransfer = searchParams.get('skipTransfer'); // New: skip transfer flag
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [subOperation, setSubOperation] = useState<SubOperation | null>(null);
  const [showCallbackSelection, setShowCallbackSelection] = useState(false);
  const [callbackOptions, setCallbackOptions] = useState<Array<{id: number; caption: string}>>([]);
  const [selectedCallback, setSelectedCallback] = useState<{id: number; caption: string} | null>(null);
  const [showTransferFlow, setShowTransferFlow] = useState(false);
  const [transferOperation, setTransferOperation] = useState<TransferOperation | null>(null);
  const [transferSelections, setTransferSelections] = useState<Array<{levelId: number; optionId: string; optionName: string}>>([]);

  // Fetch kiosk startup data to get the sub-operation details
  const { data: kioskData, loading, error } = useKioskStartup({
    employeeId: state.user?.id,
    autoFetch: true,
  });

  // Transform employee data from new API structure
  const employee = kioskData ? {
    id: (kioskData as KioskStartupResponse).basics?.idnum || '',
    name: `${(kioskData as KioskStartupResponse).basics?.firstName || ''} ${(kioskData as KioskStartupResponse).basics?.lastName || ''}`.trim(),
    email: (kioskData as KioskStartupResponse).personalInfo?.contactInfo?.emails?.find((e: { emailLabel: string; emailAddress: string }) => e.emailLabel === 'Work Email')?.emailAddress || '',
    role: (kioskData as KioskStartupResponse).basics?.homeWg?.workPositionName || '',
    department: (kioskData as KioskStartupResponse).basics?.homeWg?.description || '',
    permissions: ['clock-in-out', 'view-reports'],
    shift: { start: '07:00', end: '15:30', breakDuration: 30 }
  } : null;

  useEffect(() => {
    if (kioskData && operationId && subOperationId) {
      // Find the operation using the fkeyguid from URL
      const typedKioskData = kioskData as KioskStartupResponse;
      const operations = typedKioskData.context?.operations || [];
      const operation = operations.find((op) => op.fkeyguid === operationId);
      
      if (operation) {
        // Always set up the sub-operation first
        if (operation.prompts?.selections) {
          const selections = operation.prompts.selections;
          const foundSelection = selections.find((sel: { id?: number; caption?: string }) => 
            sel.id?.toString() === subOperationId
          );
          
          if (foundSelection) {
            setSubOperation({
              id: `sub-operation-${foundSelection.id}`,
              name: foundSelection.caption || 'Operation',
              description: foundSelection.caption || 'Perform operation',
              icon: '🕐',
              enabled: true,
              nativeAction: `OPERATION_${operation.operation}_SELECTION_${foundSelection.id}`
            });
          }
        } else {
          // Fallback if no selections available - use the operation itself
          setSubOperation({
            id: `operation-${operation.operation}`,
            name: operation.caption || 'Operation',
            description: operation.caption || 'Perform operation',
            icon: '🕐',
            enabled: true,
            nativeAction: `OPERATION_${operation.operation}`
          });
        }

        // Handle callback selection flow
        const needsCallback = operation.prompts?.askForCallback && operation.prompts?.callbackSelections;
        
        if (needsCallback && !callbackId) {
          // Show callback selection screen
          setCallbackOptions(operation.prompts?.callbackSelections || []);
          setShowCallbackSelection(true);
          setShowTransferFlow(false);
          return;
        }
        
        // If we have a callback, hide the callback selection screen
        setShowCallbackSelection(false);
        
        // If callback was selected, find and store it
        if (callbackId && operation.prompts?.callbackSelections) {
          const callback = operation.prompts.callbackSelections.find((cb) => cb.id.toString() === callbackId);
          setSelectedCallback(callback || null);
        }
        
        // Handle transfer selection flow
        const needsTransfer = operation.prompts?.askForXfer && operation.prompts?.xferOperation && !skipTransfer;
        
        if (needsTransfer && callbackId) {
          // Show transfer selection screen
          setTransferOperation((operation.prompts?.xferOperation as TransferOperation) || null);
          setShowTransferFlow(true);
          return;
        }
        
        // If we reach here, show the final confirmation screen
        setShowTransferFlow(false);
      }
    }
  }, [kioskData, operationId, subOperationId, callbackId, skipTransfer]);

  useEffect(() => {
    // Notify native that punch-in screen is loaded
    if (isConnected) {
      sendToNative('PUNCH_IN_SCREEN_LOADED', { 
        user: state.user?.id,
        subOperation: subOperationId,
        timestamp: Date.now() 
      });
    }
  }, [isConnected, sendToNative, state.user, subOperationId]);

  const handleConfirm = async () => {
    if (!subOperation || !kioskData) return;

    setIsProcessing(true);
    
    try {
      // Send to native app with dynamic operation data
      if (isConnected) {
        const payload: PunchInPayload = { 
          operationFkeyguid: operationId || '', // Use the fkeyguid from URL
          subOperationId: subOperationId || '', // Use the selection ID from URL
          employeeId: state.user?.id || '',
          timestamp: Date.now(),
          clockTime: new Date().toISOString()
        };
        
        // Include callback data if selected
        if (selectedCallback) {
          payload.callbackId = selectedCallback.id;
          payload.callbackCaption = selectedCallback.caption;
        }
        
        // Include transfer data if selected
        if (transferSelections.length > 0) {
          payload.transferSelections = transferSelections;
        }
        
        sendToNative(subOperation.nativeAction, payload);
      }

      // Show success message briefly then redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error processing operation:', error);
      setIsProcessing(false);
    }
  };

  const handleCallbackSelection = (callback: {id: number; caption: string}) => {
    // Navigate to the same page but with callback parameter
    const params = new URLSearchParams({
      operation: operationId || '',
      subOperation: subOperationId || '',
      callback: callback.id.toString()
    });
    
    router.push(`/punch-in?${params.toString()}`);
  };

  const handleTransferComplete = (selections: Array<{levelId: number; optionId: string; optionName: string}>) => {
    setTransferSelections(selections);
    setShowTransferFlow(false);
  };

  const handleTransferCancel = () => {
    // Continue without transfer
    const params = new URLSearchParams({
      operation: operationId || '',
      subOperation: subOperationId || '',
      callback: callbackId || '',
      skipTransfer: 'true'
    });
    
    router.push(`/punch-in?${params.toString()}`);
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-company-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !kioskData) {
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-destructive mb-4">
              <p>Error loading punch-in data: {error || 'Invalid operation'}</p>
            </div>
            <button
              onClick={handleCancel}
              className="bg-company-accent hover:opacity-90 text-white px-6 py-3 rounded-xl"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show callback selection screen if needed
  if (showCallbackSelection) {
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="flex">
          {/* Left Sidebar Menu */}
          <EmployeeMenu />
          
          {/* Main Content */}
          <div className="flex-1 px-6 py-8">
            <CallbackSelection
              options={callbackOptions}
              onSelect={handleCallbackSelection}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show transfer flow screen if needed
  if (showTransferFlow && transferOperation) {
    const typedKioskData = kioskData as KioskStartupResponse;
    const availablePlaces = typedKioskData.profileInfo?.availablePlaces || [];
    const workGroups = (kioskData as { workGroups?: { levels: Array<{ levelName: string; levelNamePlural: string; wgLevel: number; items: Array<{ text: string; wgnum: number; code: string; name: string; }> }> } }).workGroups;
    
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="flex">
          {/* Left Sidebar Menu */}
          <EmployeeMenu />
          
          {/* Main Content */}
          <div className="flex-1 px-6 py-8">
            <TransferFlow
              transferOperation={transferOperation}
              availablePlaces={availablePlaces}
              workGroups={workGroups}
              onComplete={handleTransferComplete}
              onCancel={handleTransferCancel}
              isSubFlow={true}
              title="Transfer Selection for Punch-In"
              allowSkip={true}
              onSkip={handleTransferComplete}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!subOperation) {
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-destructive mb-4">
              <p>Invalid operation</p>
            </div>
            <button
              onClick={handleCancel}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Processing {subOperation.name}...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we record your punch-in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-6">
      <div className="flex">
        {/* Left Sidebar Menu */}
        <EmployeeMenu />
        
        {/* Main Content */}
        <div className="flex-1 px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <PunchInConfirmation
              subOperation={subOperation}
              employee={employee!}
              selectedCallback={selectedCallback}
              transferSelections={transferSelections}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
