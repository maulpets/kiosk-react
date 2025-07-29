'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWebViewBridge } from '@/hooks/useWebViewBridge';
import { useAppContext } from '@/store/AppContext';
import { useKioskStartup } from '@/hooks/useKioskStartup';
import { useI18n } from '@/hooks/useI18n';
import { SubOperation, Employee } from '@/types/kiosk';
import EmployeeMenu from '@/components/EmployeeMenu';

interface PunchOutConfirmationProps {
  subOperation: SubOperation;
  employee: Employee;
  onConfirm: () => void;
  onCancel: () => void;
}

function PunchOutConfirmation({ subOperation, employee, onConfirm, onCancel }: PunchOutConfirmationProps) {
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
      case 'end-shift':
        return 'You are about to end your work shift. This will record your clock-out time and calculate your total hours for today.';
      case 'start-break':
        return 'You are starting your break. This will pause tracking your work hours until you return from break.';
      case 'start-lunch':
        return 'You are starting your lunch period. This will pause tracking your work hours until you return from lunch.';
      default:
        return `You are about to perform: ${subOperation.description}`;
    }
  };

  const getNextSteps = () => {
    switch (subOperation.id) {
      case 'end-shift':
        return [
          'Your total hours for today will be calculated',
          'Timecard will be updated with your shift completion',
          'Have a great rest of your day!'
        ];
      case 'start-break':
        return [
          'Work time tracking is paused',
          'Remember to punch back in when returning',
          'Break time will be tracked separately'
        ];
      case 'start-lunch':
        return [
          'Work time tracking is paused',
          'Remember to punch back in when returning',
          'Lunch time will be tracked separately'
        ];
      default:
        return ['Action will be recorded in your timecard'];
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
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
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
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
      <div className="bg-accent border border-border rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-accent-foreground text-lg mb-3">
          What happens next?
        </h3>
        <p className="text-muted-foreground mb-4">
          {getActionDescription()}
        </p>
        <ul className="space-y-2">
          {getNextSteps().map((step, index) => (
            <li key={index} className="flex items-start space-x-2 text-muted-foreground">
              <span className="text-primary mt-1">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 py-4 px-6 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold rounded-xl transition-colors"
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

function PunchOutPageContent() {
  const { state } = useAppContext();
  const { sendToNative, isConnected } = useWebViewBridge();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the sub-operation data from URL params
  const subOperationId = searchParams.get('subOperation');
  const operationId = searchParams.get('operation');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [subOperation, setSubOperation] = useState<SubOperation | null>(null);

  // Fetch kiosk startup data to get the sub-operation details
  const { data: kioskData, loading, error } = useKioskStartup({
    employeeId: state.user?.id,
    autoFetch: true,
  });

  // Transform employee data from new API structure
  const employee = kioskData ? {
    id: kioskData.basics?.idnum || '',
    name: `${kioskData.basics?.firstName || ''} ${kioskData.basics?.lastName || ''}`.trim(),
    email: kioskData.personalInfo?.contactInfo?.emails?.find((e: { emailLabel: string; emailAddress: string }) => e.emailLabel === 'Work Email')?.emailAddress || '',
    role: kioskData.basics?.homeWg?.workPositionName || '',
    department: kioskData.basics?.homeWg?.description || '',
    permissions: ['clock-in-out', 'view-reports'],
    shift: { start: '07:00', end: '15:30', breakDuration: 30 }
  } : null;

  useEffect(() => {
    if (kioskData && operationId && subOperationId) {
      // Find the operation and sub-operation from new API structure
      const operations = kioskData.context?.operations || [];
      const operation = operations.find(op => op.operation === 1); // Punch Out is operation 1
      
      // Create sub-operations from prompts selections if available
      if (operation?.prompts?.selections) {
        const selections = operation.prompts.selections;
        const foundSelection = selections.find((sel: { id?: number; caption?: string }) => sel.id?.toString() === subOperationId);
        if (foundSelection) {
          setSubOperation({
            id: `punch-out-${foundSelection.id}`,
            name: foundSelection.caption || 'End Shift',
            description: foundSelection.caption || 'End your work shift',
            icon: '⏹️',
            enabled: true,
            nativeAction: 'CLOCK_OUT'
          });
        }
      } else {
        // Default sub-operation
        setSubOperation({
          id: 'punch-out-default',
          name: 'End Shift',
          description: 'End your work shift',
          icon: '⏹️',
          enabled: true,
          nativeAction: 'CLOCK_OUT'
        });
      }
    }
  }, [kioskData, operationId, subOperationId]);

  useEffect(() => {
    // Notify native that punch-out screen is loaded
    if (isConnected) {
      sendToNative('PUNCH_OUT_SCREEN_LOADED', { 
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
      // Send to native app
      if (isConnected) {
        sendToNative(subOperation.nativeAction, { 
          operationId: operationId,
          subOperationId: subOperation.id,
          employeeId: state.user?.id,
          timestamp: Date.now(),
          clockTime: new Date().toISOString()
        });
      }

      // Show success message briefly then redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error processing punch out:', error);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !kioskData || !subOperation) {
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-destructive mb-4">
              <p>Error loading punch-out data: {error || 'Invalid operation'}</p>
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
              Please wait while we record your punch-out.
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
            <PunchOutConfirmation
              subOperation={subOperation}
              employee={employee!}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function PunchOutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PunchOutPageContent />
    </Suspense>
  );
}
