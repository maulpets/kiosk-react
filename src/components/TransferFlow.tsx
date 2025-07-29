'use client';

import React, { useState, useMemo } from 'react';

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

interface WorkGroupItem {
  text: string;
  wgnum: number;
  code: string;
  name: string;
}

interface WorkGroupsLevel {
  levelName: string;
  levelNamePlural: string;
  wgLevel: number;
  items: WorkGroupItem[];
}

interface WorkGroups {
  levels: WorkGroupsLevel[];
}

interface TransferFlowProps {
  transferOperation: TransferOperation;
  availablePlaces?: Array<{
    wgName: string;
    wgCode: string;
    wgNum: number;
  }>;
  workGroups?: WorkGroups; // New: work groups data from kiosk startup
  onComplete: (selections: TransferSelection[]) => void;
  onCancel: () => void;
  isSubFlow?: boolean; // True when used within punch-in flow
  title?: string;
  allowSkip?: boolean; // New: allow skipping the entire transfer process
  onSkip?: (selections: TransferSelection[]) => void; // New: callback for skipping transfers
}

interface LevelSelectorProps {
  level: WgRenderingLevel;
  options: WorkGroupItem[];
  onSelect: (option: WorkGroupItem) => void;
  isActive: boolean;
}

// Helper function to get the correct display value based on captionUses
function getDisplayValue(captionUses: string, option: WorkGroupItem, displayType: 'primary' | 'secondary'): string {
  const getValue = (useType: string) => {
    switch (useType) {
      case 'wgCode':
        return option.code;
      case 'wgName':
        return option.name;
      case 'wgNum':
        return option.wgnum.toString();
      default:
        return option.name; // Default fallback
    }
  };

  if (displayType === 'primary') {
    return getValue(captionUses);
  } else {
    // For secondary display, show a different property for context
    switch (captionUses) {
      case 'wgCode':
        return option.name; // Show name when code is primary
      case 'wgName':
        return option.code; // Show code when name is primary
      case 'wgNum':
        return option.name; // Show name when number is primary
      default:
        return option.code; // Default fallback
    }
  }
}

function LevelSelector({ level, options, onSelect, isActive }: LevelSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isActive || !options.length) return null;

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const searchLower = searchTerm.toLowerCase();
    return (
      option.name.toLowerCase().includes(searchLower) ||
      option.code.toLowerCase().includes(searchLower) ||
      option.text.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-lg md:text-2xl font-bold text-foreground">
          Select {level.name}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Choose from available {level.plural.toLowerCase() || level.name.toLowerCase()}
        </p>
      </div>

      {/* Search Input */}
      {options.length > 5 && (
        <div className="mb-4 md:mb-6">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={`Search ${level.plural.toLowerCase() || level.name.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 md:pl-10 pr-4 py-2 md:py-3 border border-border rounded-lg 
                       bg-background text-foreground text-sm md:text-base
                       focus:ring-2 focus:ring-company-accent focus:border-transparent
                       placeholder:text-muted-foreground"
            />
          </div>
          {searchTerm && (
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              Showing {filteredOptions.length} of {options.length} results
            </p>
          )}
        </div>
      )}
      
      <div className="grid gap-3 md:gap-4 max-h-96 overflow-y-auto">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <button
              key={option.wgnum}
              onClick={() => onSelect(option)}
              className="w-full p-4 md:p-6 rounded-xl text-left transition-all bg-company-secondary hover:opacity-90 text-white shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base md:text-lg truncate">
                    {getDisplayValue(level.captionUses, option, 'primary')}
                  </div>
                  <div className="text-sm opacity-90 mt-1 line-clamp-2">
                    {getDisplayValue(level.captionUses, option, 'secondary')}
                  </div>
                </div>
                <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm md:text-base">No {level.plural.toLowerCase() || level.name.toLowerCase()} found matching &ldquo;{searchTerm}&rdquo;</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-primary hover:text-primary/80 font-medium text-sm md:text-base"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface TransferSelectionDisplayProps {
  selections: TransferSelection[];
  levels: WgRenderingLevel[];
  onSelectLevel?: (levelIndex: number) => void; // New: callback to jump to a specific level
}

function TransferSelectionDisplay({ selections, levels, onSelectLevel }: TransferSelectionDisplayProps) {
  if (selections.length === 0) return null;

  return (
    <div className="mb-4 md:mb-6">
      <h3 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-3">Current Selection</h3>
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3 md:pb-4 pt-1 md:pt-2 px-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-background">
        {selections.map((selection, index) => {
          const level = levels.find(l => l.wgLevel === selection.levelId);
          const isClickable = onSelectLevel !== undefined;
          
          return (
            <div 
              key={selection.levelId} 
              className={`flex-shrink-0 min-w-[160px] md:min-w-[200px] p-3 md:p-4 rounded-xl bg-primary text-primary-foreground shadow-lg transition-all duration-200 ${
                isClickable 
                  ? 'hover:opacity-90 hover:shadow-xl cursor-pointer hover:-translate-y-1' 
                  : ''
              }`}
              onClick={isClickable ? () => onSelectLevel(index) : undefined}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={isClickable ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectLevel(index);
                }
              } : undefined}
            >
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-company-accent rounded-full flex items-center justify-center flex-shrink-0">
                  {isClickable ? (
                    <span className="text-xs md:text-sm font-bold">✏️</span>
                  ) : (
                    <span className="text-xs md:text-sm font-bold">✓</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs md:text-sm text-primary-foreground">
                    {level?.name}
                  </div>
                  <div className="font-bold text-sm md:text-base text-white truncate">
                    {selection.optionName}
                  </div>
                  {isClickable && (
                    <div className="text-xs text-primary-foreground/80 mt-1">
                      Click to edit
                    </div>
                  )}
                </div>
              </div>
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
    <div className="space-y-4 md:space-y-6">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {isSubFlow ? 'Confirm Transfer Selection' : 'Confirm Transfer'}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Review your transfer details
        </p>
      </div>

      {/* Transfer Details */}
      <div className="bg-company-primary/10 border-l-4 border-company-primary p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4">Transfer Details</h3>
        <div className="space-y-2 md:space-y-3">
          {selections.map((selection) => {
            const level = levels.find(l => l.wgLevel === selection.levelId);
            return (
              <div key={selection.levelId} className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium text-sm md:text-base">{level?.name}:</span>
                <span className="text-foreground font-semibold text-sm md:text-base">{selection.optionName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 md:pt-6">
        <button
          onClick={onBack}
          className="w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-base md:text-lg transition-all
                     bg-muted hover:bg-muted/80 text-muted-foreground shadow-lg hover:shadow-xl"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-base md:text-lg transition-all
                     bg-company-accent hover:opacity-90 text-white shadow-lg hover:shadow-xl"
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
  workGroups,
  onComplete, 
  onCancel, 
  isSubFlow = false,
  title,
  allowSkip = false,
  onSkip
}: TransferFlowProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selections, setSelections] = useState<TransferSelection[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const transferLevels = useMemo(() => 
    transferOperation?.wgRendering?.levels || [], 
    [transferOperation]
  );

  const handleLevelSelection = (option: WorkGroupItem) => {
    const currentLevel = transferLevels[currentLevelIndex];
    const newSelection: TransferSelection = {
      levelId: currentLevel.wgLevel,
      optionId: option.wgnum.toString(),
      optionName: getDisplayValue(currentLevel.captionUses, option, 'primary')
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

  const handleJumpToLevel = (selectionIndex: number) => {
    // Jump back to the level at the given selection index
    // This will allow the user to change their selection for that level
    setCurrentLevelIndex(selectionIndex);
    // Truncate selections to only include selections up to this level
    setSelections(selections.slice(0, selectionIndex));
    // Make sure we're not in confirmation mode
    setShowConfirmation(false);
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
  const getCurrentLevelOptions = (): WorkGroupItem[] => {
    if (transferOperation.xferStyle !== 0) return [];
    
    // Use workGroups data if available, otherwise fall back to availablePlaces
    if (workGroups && workGroups.levels) {
      const currentLevel = transferLevels[currentLevelIndex];
      if (!currentLevel) return [];
      
      // Find the corresponding workGroup level by wgLevel
      const workGroupLevel = workGroups.levels.find(
        level => level.wgLevel === currentLevel.wgLevel
      );
      
      return workGroupLevel?.items || [];
    }
    
    // Fallback to availablePlaces converted to WorkGroupItem format
    return availablePlaces.map(place => ({
      text: place.wgCode,
      wgnum: place.wgNum,
      code: place.wgCode,
      name: place.wgName
    }));
  };

  const currentLevel = transferLevels[currentLevelIndex];
  const currentOptions = getCurrentLevelOptions();

  if (!transferOperation || !transferLevels.length) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Transfer Not Available</h1>
        <p className="text-muted-foreground mb-8">
          Transfer options could not be loaded.
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-company-primary hover:opacity-90 text-white rounded-lg font-semibold"
        >
          {isSubFlow ? 'Continue Without Transfer' : 'Return to Dashboard'}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full max-w-4xl mx-auto overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8 px-4 pt-4">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg md:text-2xl font-bold text-foreground text-center flex-1 mx-4">
          {title || (isSubFlow ? 'Transfer Selection' : 'Employee Transfer')}
        </h1>
        {allowSkip && onSkip && !showConfirmation && (
          <button
            onClick={() => onSkip(selections)}
            className="px-3 py-2 md:px-4 md:py-2 bg-company-accent hover:opacity-90 text-white rounded-lg font-medium transition-colors text-sm md:text-base flex-shrink-0"
          >
            Skip Transfers
          </button>
        )}
        {(!allowSkip || !onSkip || showConfirmation) && <div className="w-10 md:w-16 flex-shrink-0"></div>}
      </div>

      {/* Progress Indicator */}
      {!showConfirmation && transferLevels.length > 1 && (
        <div className="mb-6 md:mb-8 px-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              Step {currentLevelIndex + 1} of {transferLevels.length}
            </span>
            <span className="text-xs md:text-sm text-muted-foreground">
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
      <div className="px-4">
        <TransferSelectionDisplay 
          selections={selections} 
          levels={transferLevels} 
          onSelectLevel={!showConfirmation ? handleJumpToLevel : undefined}
        />
      </div>

      {/* Content */}
      <div className="px-4 pb-4 flex-1">
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
    </div>
  );
}
