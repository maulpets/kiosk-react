/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWebViewBridge } from '@/hooks/useWebViewBridge';
import { useAppContext } from '@/store/AppContext';
import { useKioskStartup } from '@/hooks/useKioskStartup';
import { TransferLevel, TransferOption, Employee } from '@/types/kiosk';
import EmployeeMenu from '@/components/EmployeeMenu';

interface TransferSelection {
  levelId: number;
  optionId: string;
  optionName: string;
}

interface TransferSelectionDisplayProps {
  selections: TransferSelection[];
  levels: TransferLevel[];
}

function TransferSelectionDisplay({ selections, levels }: TransferSelectionDisplayProps) {
  if (selections.length === 0) return null;

  return (
    <div className="bg-company-primary/10 border-l-4 border-company-primary p-4 mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-2">Current Selection</h3>
      <div className="space-y-1">
        {selections.map((selection) => {
          const level = levels.find(l => l.wgLevel === selection.levelId);
          return (
            <div key={selection.levelId} className="text-foreground">
              <span className="font-medium">{level?.name}:</span> {selection.optionName}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LevelSelectorProps {
  level: TransferLevel;
  onSelect: (option: TransferOption) => void;
  isActive: boolean;
}

function LevelSelector({ level, onSelect, isActive }: LevelSelectorProps) {
  if (!isActive || !level.options) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">
        Select {level.name}
      </h2>
      <p className="text-muted-foreground mb-6">
        Choose from available {level.plural.toLowerCase()}
      </p>
      
      <div className="grid gap-4">
        {level.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            disabled={!option.enabled}
            className={`w-full p-6 rounded-xl text-left transition-all ${
              option.enabled
                ? 'bg-company-secondary hover:opacity-90 text-white shadow-lg hover:shadow-xl'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg">{option.name}</div>
                {option.description && (
                  <div className="text-sm opacity-90 mt-1">{option.description}</div>
                )}
              </div>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ConfirmationSectionProps {
  employee: Employee;
  selections: TransferSelection[];
  levels: TransferLevel[];
  onConfirm: () => void;
  onBack: () => void;
}

function ConfirmationSection({ employee, selections, levels, onConfirm, onBack }: ConfirmationSectionProps) {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Confirm Transfer
        </h1>
        <p className="text-xl text-muted-foreground">
          {currentTime}
        </p>
      </div>

      {/* Employee Info */}
      <div className="bg-muted rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Employee Information
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>
            <div className="font-semibold">{employee.name}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Current Role:</span>
            <div className="font-semibold">{employee.role}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Department:</span>
            <div className="font-semibold">{employee.department}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Shift:</span>
            <div className="font-semibold">{employee.shift.start} - {employee.shift.end}</div>
          </div>
        </div>
      </div>

      {/* Transfer Details */}
      <div className="bg-muted border-l-4 border-primary p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Transfer Details</h3>
        <div className="space-y-3">
          {selections.map((selection) => {
            const level = levels.find(l => l.wgLevel === selection.levelId);
            return (
              <div key={selection.levelId} className="flex justify-between items-center">
                <span className="text-foreground font-medium">{level?.name}:</span>
                <span className="text-foreground font-semibold">{selection.optionName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-6">
        <button
          onClick={onBack}
          className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all
                     bg-muted hover:bg-muted/80 text-muted-foreground shadow-lg hover:shadow-xl"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all
                     bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
        >
          Confirm Transfer
        </button>
      </div>
    </div>
  );
}

export default function TransferPage() {
  const router = useRouter();
  const { state } = useAppContext();
  const { data: kioskData, loading, error } = useKioskStartup({ 
    employeeId: state.user?.id, 
    autoFetch: true 
  });
  const { isConnected, sendToNative } = useWebViewBridge();
  
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selections, setSelections] = useState<TransferSelection[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get transfer operation data - updated for new API structure
  const operations = (kioskData as any)?.context?.operations || [];
  const transferOperation = operations.find((op: any) => op.operation === 2); // Transfer is operation 2
  const transferData = transferOperation || null;
  const transferLevels = useMemo(() => transferData?.wgRendering?.levels || [], [transferData]);

  // Transform employee data from new API structure
  const employee = kioskData ? {
    id: (kioskData as any).basics?.idnum || '',
    name: `${(kioskData as any).basics?.firstName || ''} ${(kioskData as any).basics?.lastName || ''}`.trim(),
    email: (kioskData as any).personalInfo?.contactInfo?.emails?.find((e: { emailLabel: string; emailAddress: string }) => e.emailLabel === 'Work Email')?.emailAddress || '',
    role: (kioskData as any).basics?.homeWg?.workPositionName || '',
    department: (kioskData as any).basics?.homeWg?.description || '',
    permissions: ['clock-in-out', 'view-reports'],
    shift: { start: '07:00', end: '15:30', breakDuration: 30 }
  } : null;

  useEffect(() => {
    if (isConnected) {
      sendToNative('TRANSFER_SCREEN_LOADED', { 
        user: state.user?.id,
        timestamp: Date.now() 
      });
    }
  }, [isConnected, sendToNative, state.user]);

  const handleLevelSelection = (option: TransferOption) => {
    const currentLevel = transferLevels[currentLevelIndex];
    const newSelection: TransferSelection = {
      levelId: currentLevel.wgLevel,
      optionId: option.id,
      optionName: option.name
    };

    const updatedSelections = [...selections, newSelection];
    setSelections(updatedSelections);

    // Move to next level or show confirmation
    if (currentLevelIndex < transferLevels.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
    } else {
      setShowConfirmation(true);
    }
  };

  const handleConfirmTransfer = () => {
    if (isConnected && transferData?.nativeAction) {
      const transferPayload = {
        transferType: 'STANDARD_TRANSFER',
        selections: selections,
        employee: employee,
        transType: transferData.transType,
        xferStyle: transferData.xferStyle,
        timestamp: Date.now()
      };

      sendToNative(transferData.nativeAction, transferPayload);
    }
    
    // Navigate back to dashboard
    router.push('/dashboard');
  };

  const handleBack = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
    } else if (currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
      setSelections(selections.slice(0, -1));
    } else {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading transfer options...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transferOperation || !transferData) {
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Transfer Not Available</h1>
            <p className="text-muted-foreground mb-8">
              {error || 'Transfer options could not be loaded.'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentLevel = transferLevels[currentLevelIndex];

  return (
    <div className="min-h-screen bg-background pt-6">
      <div className="flex">
        {/* Left Sidebar Menu */}
        <EmployeeMenu />
        
        {/* Main Content */}
        <div className="flex-1 px-6 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-foreground">
                Employee Transfer
              </h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Progress Indicator */}
            {!showConfirmation && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Step {currentLevelIndex + 1} of {transferLevels.length}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(((currentLevelIndex + 1) / transferLevels.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentLevelIndex + 1) / transferLevels.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Selection Display */}
            <TransferSelectionDisplay selections={selections} levels={transferLevels} />

            {/* Content */}
            {showConfirmation ? (
              <ConfirmationSection
                employee={employee!}
                selections={selections}
                levels={transferLevels}
                onConfirm={handleConfirmTransfer}
                onBack={handleBack}
              />
            ) : (
              <LevelSelector
                level={currentLevel}
                onSelect={handleLevelSelection}
                isActive={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
