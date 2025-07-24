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
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">Current Selection</h3>
      <div className="space-y-1">
        {selections.map((selection) => {
          const level = levels.find(l => l.wgLevel === selection.levelId);
          return (
            <div key={selection.levelId} className="text-blue-700">
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
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Select {level.name}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
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
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Confirm Transfer
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {currentTime}
        </p>
      </div>

      {/* Employee Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Employee Information
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-300">Name:</span>
            <div className="font-semibold">{employee.name}</div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-300">Current Role:</span>
            <div className="font-semibold">{employee.role}</div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-300">Department:</span>
            <div className="font-semibold">{employee.department}</div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-300">Shift:</span>
            <div className="font-semibold">{employee.shift.start} - {employee.shift.end}</div>
          </div>
        </div>
      </div>

      {/* Transfer Details */}
      <div className="bg-purple-50 border-l-4 border-purple-400 p-6">
        <h3 className="text-xl font-semibold text-purple-800 mb-4">Transfer Details</h3>
        <div className="space-y-3">
          {selections.map((selection) => {
            const level = levels.find(l => l.wgLevel === selection.levelId);
            return (
              <div key={selection.levelId} className="flex justify-between items-center">
                <span className="text-purple-700 font-medium">{level?.name}:</span>
                <span className="text-purple-900 font-semibold">{selection.optionName}</span>
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
                     bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all
                     bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
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
  const operations = kioskData?.context?.operations || [];
  const transferOperation = operations.find(op => op.operation === 2); // Transfer is operation 2
  const transferData = transferOperation || null;
  const transferLevels = useMemo(() => transferData?.wgRendering?.levels || [], [transferData]);

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading transfer options...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transferOperation || !transferData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Transfer Not Available</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {error || 'Transfer options could not be loaded.'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6">
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
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Employee Transfer
              </h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Progress Indicator */}
            {!showConfirmation && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Step {currentLevelIndex + 1} of {transferLevels.length}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {Math.round(((currentLevelIndex + 1) / transferLevels.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
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
