'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebViewBridge } from '@/hooks/useWebViewBridge';
import { useAppContext } from '@/store/AppContext';
import { useKioskEmployeeData } from '@/hooks/useKioskEmployeeData';
import { useI18n } from '@/hooks/useI18n';
import { SubOperation } from '@/types/kiosk';
import { Operation, PromptSelection } from '@/types/kioskStartup';

// Extended operation type to include subOperations
interface ExtendedOperation extends Operation {
  subOperations?: SubOperation[];
}

// Extended SubOperation to include selectionId
interface ExtendedSubOperation extends SubOperation {
  selectionId?: number;
}

interface EmployeeMenuProps {
  onBack?: () => void;
  backLabel?: string;
}

interface DropdownMenuProps {
  label: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  subOperations: ExtendedSubOperation[];
  onSubOperationClick: (subOperation: ExtendedSubOperation) => void;
}

function DropdownMenu({ label, icon, isOpen, onToggle, subOperations, onSubOperationClick }: DropdownMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full p-3 rounded-lg text-left transition-all bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">{icon}</span>
          <span className="font-medium">{label}</span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border z-50">
          {subOperations.map((subOperation) => (
            <button
              key={subOperation.id}
              onClick={() => onSubOperationClick(subOperation)}
              disabled={!subOperation.enabled}
              className={`w-full p-3 text-left transition-all first:rounded-t-lg last:rounded-b-lg hover:bg-muted ${
                !subOperation.enabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{subOperation.icon}</span>
                <div>
                  <div className="font-medium text-foreground">{subOperation.name}</div>
                  <div className="text-sm text-muted-foreground">{subOperation.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmployeeMenu({ onBack, backLabel }: EmployeeMenuProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { state } = useAppContext();
  const { data: kioskData } = useKioskEmployeeData({ 
    employeeId: state.user?.id, 
    autoFetch: true 
  });
  const { isConnected, sendToNative } = useWebViewBridge();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Get operations data - updated for new API structure
  const operations = kioskData?.context?.operations || [];
  
  // Transform operations to match the same structure as dashboard
  const transformApiOperations = (apiOperations: Operation[] = []): ExtendedOperation[] => {
    return apiOperations.map(apiOp => {
      const baseOp: ExtendedOperation = {
        ...apiOp, // Keep all original Operation properties
        subOperations: undefined // Initialize as undefined
      };

      // Check if this operation has prompt selections
      const hasPromptSelections = apiOp.prompts?.selections && apiOp.prompts.selections.length > 0;
      
      if (hasPromptSelections) {
        // Create sub-operations from prompt selections
        const subOperations: ExtendedSubOperation[] = apiOp.prompts?.selections.map((selection: PromptSelection) => ({
          id: `${apiOp.fkeyguid}-${selection.id}`,
          name: selection.caption,
          description: selection.caption,
          icon: apiOp.icon === 'fa fa-clock' ? '🕐' : 
                apiOp.icon === 'fa fa-exchange' ? '🔄' : 
                apiOp.icon === 'fa fa-dollar' ? '💰' : 
                apiOp.icon === 'fa fa-cog' ? '⚙️' : '🔹',
          enabled: true,
          nativeAction: `OPERATION_${apiOp.operation}_SELECTION_${selection.id}`,
          selectionId: selection.id // Store the original selection ID
        })) || [];

        return {
          ...baseOp,
          subOperations
        };
      }

      return baseOp;
    });
  };

  const transformedOperations = transformApiOperations(operations);
  const actionItems = []; // actionItems don't exist in new structure, using empty array

  const handleDropdownToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const handleSubOperationClick = (subOperation: ExtendedSubOperation, operation: ExtendedOperation) => {
    setOpenDropdown(null);
    
    // Use the stored selectionId if available, otherwise extract from subOperation.id
    const selectionId = subOperation.selectionId?.toString() || subOperation.id.split('-').pop();
    
    // Navigate to the appropriate punch page with sub-operation parameters
    const params = new URLSearchParams({
      operation: operation.fkeyguid, // Use the fkeyguid
      subOperation: selectionId || subOperation.id // Use the selection ID
    });
    
    // Determine route based on operation type
    let route = '/punch-in'; // default
    if (operation.operation === 1) route = '/punch-out';
    else if (operation.operation === 2) route = '/transfer';
    
    router.push(`${route}?${params.toString()}`);
    
    // Also send to native if connected
    if (isConnected) {
      sendToNative(subOperation.nativeAction, {
        operationFkeyguid: operation.fkeyguid,
        subOperationId: selectionId,
        timestamp: Date.now()
      });
    }
  };

  const handleActionItemsClick = () => {
    router.push('/action-items');
  };

  const handleViewTimeCard = () => {
    router.push('/timecard');
  };

  const handleSendNote = () => {
    if (isConnected) {
      sendToNative('ADD_TIMECARD_NOTE', {
        timestamp: Date.now()
      });
    }
  };

  const handleTips = () => {
    router.push('/tips');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <div className="w-full max-w-[300px] bg-muted border-r border-border p-4 space-y-4">
      {/* Action Items Button */}
      <button
        onClick={handleActionItemsClick}
        className="w-full p-3 rounded-lg text-left transition-all bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-md hover:shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">⚠️</span>
            <span className="font-medium">Action Required</span>
          </div>
          <span className="bg-destructive text-destructive-foreground text-sm font-bold px-2 py-1 rounded-full">
            {actionItems.length}
          </span>
        </div>
      </button>

      {/* Dynamic Operation Dropdowns */}
      {transformedOperations
        .filter(op => op.subOperations && op.subOperations.length > 0) // Only operations with sub-operations
        .sort((a, b) => a.operation - b.operation) // Sort by operation number (punch-in, punch-out, etc.)
        .map((operation) => (
          <React.Fragment key={operation.fkeyguid}>
            <DropdownMenu
              label={operation.caption || operation.description || ''}
              icon={operation.icon === 'fa fa-clock' ? '🕐' : 
                    operation.icon === 'fa fa-exchange' ? '🔄' : 
                    operation.icon === 'fa fa-dollar' ? '💰' : 
                    operation.icon === 'fa fa-cog' ? '⚙️' : '🔹'}
              isOpen={openDropdown === operation.fkeyguid}
              onToggle={() => handleDropdownToggle(operation.fkeyguid)}
              subOperations={operation?.subOperations || []}
              onSubOperationClick={(subOp) => handleSubOperationClick(subOp, operation)}
            />
            
            {/* Add Time Card button directly after transfers (operation 2) */}
            {operation.operation === 2 && (
              <button
                onClick={handleViewTimeCard}
                className="w-full p-3 rounded-lg text-left transition-all bg-gradient-to-r from-company-primary/90 to-company-secondary/90 hover:from-company-primary hover:to-company-secondary text-white shadow-md hover:shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📋</span>
                  <span className="font-medium">Time Card</span>
                </div>
              </button>
            )}
          </React.Fragment>
        ))}

      {/* Divider */}
      <div className="border-t border-border"></div>

      {/* Send Note */}
      <button
        onClick={handleSendNote}
        className="w-full p-3 rounded-lg text-left transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">📝</span>
          <span className="font-medium">Send Note</span>
        </div>
      </button>

      {/* Tips */}
      <button
        onClick={handleTips}
        className="w-full p-3 rounded-lg text-left transition-all bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-md hover:shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">💡</span>
          <span className="font-medium">Tips</span>
        </div>
      </button>

      {/* Divider */}
      <div className="border-t border-border"></div>

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="w-full p-3 rounded-lg text-left transition-all bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-md hover:shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">⬅️</span>
          <span className="font-medium">{backLabel || t('common.back')}</span>
        </div>
      </button>
    </div>
  );
}
