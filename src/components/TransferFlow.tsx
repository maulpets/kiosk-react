'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface WgRenderingLevel {
  wgLevel: number;
  name: string;
  plural: string;
  captionUses: string;
}

interface TransferOperation {
  operation: number;
  description: string;
  caption: string;
  fkeyguid: string;
  hint: string;
  icon: string;
  alsoPunch?: boolean;
  transType?: number;
  callbackTransType?: number;
  xferStyle?: number;
  xferStyleDescr?: string;
  wgRendering?: {
    caption: string;
    levels: WgRenderingLevel[];
  };
}

interface TransferSelection {
  levelId: number;
  optionId: string;
  optionName: string;
}

interface TransferFlowProps {
  transferOperation: TransferOperation;
  availablePlaces?: Array<{
    wgName: string;
    wgCode: string;
    wgNum: number;
  }>;
  onComplete: (selections: TransferSelection[]) => void;
  onCancel: () => void;
  isSubFlow?: boolean; // True when used within punch-in flow
  title?: string;
}

interface LevelSelectorProps {
  level: WgRenderingLevel;
  options: Array<{
    wgName: string;
    wgCode: string;
    wgNum: number;
  }>;
  onSelect: (option: any) => void;
  isActive: boolean;
}

function LevelSelector({ level, options, onSelect, isActive }: LevelSelectorProps) {
  if (!isActive || !options.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Select {level.name}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Choose from available {level.plural.toLowerCase() || level.name.toLowerCase()}
      </p>
      
      <div className="grid gap-4">
        {options.map((option) => (
          <button
            key={option.wgNum}
            onClick={() => onSelect(option)}
            className="w-full p-6 rounded-xl text-left transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg">
                  {level.captionUses === 'wgCode' ? option.wgCode : option.wgName}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  {level.captionUses === 'wgCode' ? option.wgName : option.wgCode}
                </div>
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

interface TransferSelectionDisplayProps {
  selections: TransferSelection[];
  levels: WgRenderingLevel[];
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

interface ConfirmationSectionProps {
  selections: TransferSelection[];
  levels: WgRenderingLevel[];
  onConfirm: () => void;
  onBack: () => void;
  isSubFlow?: boolean;
}

function ConfirmationSection({ selections, levels, onConfirm, onBack, isSubFlow }: ConfirmationSectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {isSubFlow ? 'Confirm Transfer Selection' : 'Confirm Transfer'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Review your transfer details
        </p>
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
          {isSubFlow ? 'Continue with Transfer' : 'Confirm Transfer'}
        </button>
      </div>
    </div>
  );
}

export default function TransferFlow({ 
  transferOperation, 
  availablePlaces = [], 
  onComplete, 
  onCancel, 
  isSubFlow = false,
  title 
}: TransferFlowProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selections, setSelections] = useState<TransferSelection[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const transferLevels = useMemo(() => 
    transferOperation?.wgRendering?.levels || [], 
    [transferOperation]
  );

  const handleLevelSelection = (option: any) => {
    const currentLevel = transferLevels[currentLevelIndex];
    const newSelection: TransferSelection = {
      levelId: currentLevel.wgLevel,
      optionId: option.wgNum.toString(),
      optionName: currentLevel.captionUses === 'wgCode' ? option.wgCode : option.wgName
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
    onComplete(selections);
  };

  const handleBack = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
    } else if (currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
      setSelections(selections.slice(0, -1));
    } else {
      onCancel();
    }
  };

  // For multilist style (xferStyle: 0), we need to show options based on current level
  const getCurrentLevelOptions = () => {
    if (transferOperation.xferStyle !== 0) return [];
    
    // For now, we'll use the availablePlaces for all levels
    // In a real implementation, this would filter based on previous selections
    return availablePlaces;
  };

  const currentLevel = transferLevels[currentLevelIndex];
  const currentOptions = getCurrentLevelOptions();

  if (!transferOperation || !transferLevels.length) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Transfer Not Available</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Transfer options could not be loaded.
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          {isSubFlow ? 'Continue Without Transfer' : 'Return to Dashboard'}
        </button>
      </div>
    );
  }

  return (
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
          {title || (isSubFlow ? 'Transfer Selection' : 'Employee Transfer')}
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Progress Indicator */}
      {!showConfirmation && transferLevels.length > 1 && (
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
          selections={selections}
          levels={transferLevels}
          onConfirm={handleConfirmTransfer}
          onBack={handleBack}
          isSubFlow={isSubFlow}
        />
      ) : (
        <LevelSelector
          level={currentLevel}
          options={currentOptions}
          onSelect={handleLevelSelection}
          isActive={true}
        />
      )}
    </div>
  );
}
