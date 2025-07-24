'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebViewBridge } from '@/hooks/useWebViewBridge';
import { useAppContext } from '@/store/AppContext';
import { useKioskStartup } from '@/hooks/useKioskStartup';
import { SubOperation } from '@/types/kiosk';

interface EmployeeMenuProps {
  onBack?: () => void;
  backLabel?: string;
}

interface DropdownMenuProps {
  label: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  subOperations: SubOperation[];
  onSubOperationClick: (subOperation: SubOperation) => void;
}

function DropdownMenu({ label, icon, isOpen, onToggle, subOperations, onSubOperationClick }: DropdownMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full p-3 rounded-lg text-left transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg flex items-center justify-between"
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {subOperations.map((subOperation) => (
            <button
              key={subOperation.id}
              onClick={() => onSubOperationClick(subOperation)}
              disabled={!subOperation.enabled}
              className={`w-full p-3 text-left transition-all first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                !subOperation.enabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{subOperation.icon}</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{subOperation.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{subOperation.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmployeeMenu({ onBack, backLabel = "Back" }: EmployeeMenuProps) {
  const router = useRouter();
  const { state } = useAppContext();
  const { data: kioskData } = useKioskStartup({ 
    employeeId: state.user?.id, 
    autoFetch: true 
  });
  const { isConnected, sendToNative } = useWebViewBridge();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Get operations data - updated for new API structure
  const operations = kioskData?.context?.operations || [];
  
  // Transform operations to match the same structure as dashboard
  const transformApiOperations = (apiOperations: any[] = []) => {
    return apiOperations.map(apiOp => {
      const baseOp = {
        id: apiOp.fkeyguid || `operation-${apiOp.operation}`,
        name: apiOp.caption || apiOp.description || '',
        description: apiOp.description || apiOp.caption || '',
        icon: apiOp.icon === 'fa fa-clock' ? '🕐' : 
              apiOp.icon === 'fa fa-exchange' ? '🔄' : 
              apiOp.icon === 'fa fa-dollar' ? '💰' : 
              apiOp.icon === 'fa fa-cog' ? '⚙️' : '🔹',
        enabled: apiOp.prerequisites?.enabled !== false,
        operation: apiOp.operation,
        prompts: apiOp.prompts
      };

      // Check if this operation has prompt selections
      const hasPromptSelections = apiOp.prompts?.selections && apiOp.prompts.selections.length > 0;
      
      if (hasPromptSelections) {
        // Create sub-operations from prompt selections
        const subOperations = apiOp.prompts.selections.map((selection: any) => ({
          id: `${baseOp.id}-${selection.id}`,
          name: selection.caption,
          description: selection.caption,
          icon: baseOp.icon,
          enabled: true,
          nativeAction: `OPERATION_${apiOp.operation}_SELECTION_${selection.id}`,
          selectionId: selection.id // Store the original selection ID
        }));

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

  const handleSubOperationClick = (subOperation: SubOperation, operation: any) => {
    setOpenDropdown(null);
    
    // Use the stored selectionId if available, otherwise extract from subOperation.id
    const selectionId = (subOperation as any).selectionId?.toString() || subOperation.id.split('-').pop();
    
    // Navigate to the appropriate punch page with sub-operation parameters
    const params = new URLSearchParams({
      operation: operation.id, // Use the fkeyguid
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
        operationFkeyguid: operation.id,
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
    <div className="w-full max-w-[300px] bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Action Items Button */}
      <button
        onClick={handleActionItemsClick}
        className="w-full p-3 rounded-lg text-left transition-all bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">⚠️</span>
            <span className="font-medium">Action Required</span>
          </div>
          <span className="bg-red-800 text-white text-sm font-bold px-2 py-1 rounded-full">
            {actionItems.length}
          </span>
        </div>
      </button>

      {/* Dynamic Operation Dropdowns */}
      {transformedOperations
        .filter(op => op.subOperations && op.subOperations.length > 0) // Only operations with sub-operations
        .sort((a, b) => a.operation - b.operation) // Sort by operation number (punch-in, punch-out, etc.)
        .map((operation) => (
          <DropdownMenu
            key={operation.id}
            label={operation.name}
            icon={operation.icon}
            isOpen={openDropdown === operation.id}
            onToggle={() => handleDropdownToggle(operation.id)}
            subOperations={operation.subOperations || []}
            onSubOperationClick={(subOp) => handleSubOperationClick(subOp, operation)}
          />
        ))}

      {/* Divider */}
      <div className="border-t border-gray-300 dark:border-gray-600"></div>

      {/* View Time Card */}
      <button
        onClick={handleViewTimeCard}
        className="w-full p-3 rounded-lg text-left transition-all bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">📋</span>
          <span className="font-medium">View Time Card</span>
        </div>
      </button>

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
        className="w-full p-3 rounded-lg text-left transition-all bg-yellow-600 hover:bg-yellow-700 text-white shadow-md hover:shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">💡</span>
          <span className="font-medium">Tips</span>
        </div>
      </button>

      {/* Divider */}
      <div className="border-t border-gray-300 dark:border-gray-600"></div>

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="w-full p-3 rounded-lg text-left transition-all bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">⬅️</span>
          <span className="font-medium">{backLabel}</span>
        </div>
      </button>
    </div>
  );
}
