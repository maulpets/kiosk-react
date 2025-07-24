'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebViewBridge } from '@/hooks/useWebViewBridge';
import { useAppContext } from '@/store/AppContext';
import { useKioskStartup } from '@/hooks/useKioskStartup';
import { Operation, ActionItem, TimeCardEntry, SubOperation } from '@/types/kiosk';

interface OperationButtonProps {
  operation: Operation;
  onClick: () => void;
}

function OperationButton({ operation, onClick }: OperationButtonProps) {
  const { enabled, icon, name, description } = operation;
  
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`w-full p-6 rounded-xl text-left transition-all ${
        enabled
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center space-x-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <div className="font-bold text-lg">{name}</div>
          <div className="text-sm opacity-90">{description}</div>
        </div>
        {'subOperations' in operation && operation.subOperations && (
          <div className="ml-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}

interface SubOperationButtonProps {
  subOperation: SubOperation;
  onClick: () => void;
}

function SubOperationButton({ subOperation, onClick }: SubOperationButtonProps) {
  const { enabled, icon, name, description } = subOperation;
  
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`w-full p-4 rounded-lg text-left transition-all ${
        enabled
          ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-bold">{name}</div>
          <div className="text-sm opacity-90">{description}</div>
        </div>
      </div>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-lg text-left transition-all bg-gray-500 hover:bg-gray-600 text-white shadow-md hover:shadow-lg"
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">⬅️</span>
        <div>
          <div className="font-bold">Back to Main Menu</div>
          <div className="text-sm opacity-90">Return to main operations</div>
        </div>
      </div>
    </button>
  );
}

interface TimeActivityProps {
  entries: TimeCardEntry[];
}

function TimeActivity({ entries }: TimeActivityProps) {
  // Get last 2 days of entries
  const recentEntries = entries.slice(-2);
  
  return (
    <div className="space-y-3">
      {recentEntries.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              entry.status === 'completed' ? 'bg-green-500' : 
              entry.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
            }`} />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {new Date(entry.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {entry.clockIn} - {entry.clockOut || 'In Progress'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900 dark:text-white">
              {entry.totalHours?.toFixed(2) || '0.00'}h
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {entry.status.replace('-', ' ')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ActionItemListProps {
  actionItems: ActionItem[];
}

function ActionItemList({ actionItems }: ActionItemListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      {actionItems.map((item) => (
        <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                  {item.priority.toUpperCase()}
                </span>
                {item.dueDate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Due {new Date(item.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
              {item.estimatedMinutes && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                  ~{item.estimatedMinutes} minutes
                </span>
              )}
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { state } = useAppContext();
  const { sendToNative, isConnected } = useWebViewBridge();
  const router = useRouter();
  
  // State for managing sub-operations view
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  
  // Fetch kiosk startup data
  const { data: kioskData, loading, error } = useKioskStartup({
    employeeId: state.user?.id,
    autoFetch: true,
  });

  useEffect(() => {
    // Notify native that dashboard is loaded
    if (isConnected) {
      sendToNative('DASHBOARD_LOADED', { 
        user: state.user?.id,
        timestamp: Date.now() 
      });
    }
  }, [isConnected, sendToNative, state.user]);

  const handleOperationClick = (operation: Operation) => {
    // Handle transfer operation differently using fkeyguid
    if (operation.id === '{5324678A-4261-40EE-BB3D-1026297ECB37}') {
      router.push('/transfer');
      return;
    }
    
    // If operation has sub-operations, show them instead of navigating
    if ('subOperations' in operation && operation.subOperations && operation.subOperations.length > 0) {
      setSelectedOperation(operation);
      return;
    }
    
    // Handle normal operation navigation
    if (operation.route) {
      router.push(operation.route);
    } else if (operation.nativeAction && isConnected) {
      sendToNative(operation.nativeAction, { 
        operationId: operation.id,
        timestamp: Date.now() 
      });
    }
  };

  const handleSubOperationClick = (subOperation: SubOperation) => {
    // Send native action for punch operations
    if (subOperation.nativeAction && isConnected) {
      sendToNative(subOperation.nativeAction, { 
        operationId: selectedOperation?.id,
        subOperationId: subOperation.id,
        timestamp: Date.now() 
      });
    } else {
      // Fallback to navigation for other operations
      if (selectedOperation) {
        // Use the stored selectionId if available, otherwise extract from subOperation.id
        const selectionId = (subOperation as any).selectionId?.toString() || subOperation.id.split('-').pop();
        
        const params = new URLSearchParams({
          operation: selectedOperation.id, // This is the fkeyguid
          subOperation: selectionId || subOperation.id // This should be the selection ID
        });
        
        // Route to appropriate screen based on operation number, not fkeyguid
        let route = '/punch-in'; // default
        if ((selectedOperation as any).originalOperation === 1) route = '/punch-out';
        else if ((selectedOperation as any).originalOperation === 2) route = '/transfer';
        
        router.push(`${route}?${params.toString()}`);
      }
    }
  };

  const handleBackToMain = () => {
    setSelectedOperation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !kioskData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>Error loading dashboard data: {error || 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform API operations to match expected interface
  const transformApiOperations = (apiOperations: {
    fkeyguid?: string;
    caption?: string;
    description?: string;
    icon?: string;
    operation: number;
    prerequisites?: { enabled?: boolean };
    route?: string;
    nativeAction?: string;
    prompts?: {
      askForTransType?: boolean;
      selections?: Array<{ id: number; caption: string; }>;
    };
  }[] = []): Operation[] => {
    const transformed = apiOperations.map(apiOp => {
      const baseOp = {
        id: apiOp.fkeyguid || `operation-${apiOp.operation}`, // Use fkeyguid as the unique identifier
        name: apiOp.caption || apiOp.description || '',
        description: apiOp.description || apiOp.caption || '',
        icon: apiOp.icon === 'fa fa-clock' ? '🕐' : 
              apiOp.icon === 'fa fa-exchange' ? '🔄' : 
              apiOp.icon === 'fa fa-dollar' ? '💰' : 
              apiOp.icon === 'fa fa-cog' ? '⚙️' : '🔹',
        enabled: apiOp.prerequisites?.enabled !== false,
        route: apiOp.route,
        nativeAction: apiOp.nativeAction || '',
        originalOperation: apiOp.operation // Keep original for sorting
      };

      // Check if this operation has prompt selections (punch-in/punch-out operations)
      const hasPromptSelections = apiOp.prompts?.selections && apiOp.prompts.selections.length > 0;
      
      if (hasPromptSelections) {
        // Create sub-operations from prompt selections
        const subOperations: SubOperation[] = apiOp.prompts!.selections!.map(selection => ({
          id: `${baseOp.id}-${selection.id}`,
          name: selection.caption,
          description: selection.caption,
          icon: baseOp.icon,
          enabled: true,
          nativeAction: `PUNCH_${apiOp.operation === 0 ? 'IN' : 'OUT'}_${selection.id}`,
          selectionId: selection.id // Store the original selection ID
        }));

        // Return as SubOperationOperation
        return {
          ...baseOp,
          operation: 1 as const,
          subOperations
        } as Operation & { originalOperation: number };
      }

      // Return as GeneralOperation (most common case)
      return {
        ...baseOp,
        operation: 0 as const
      } as Operation & { originalOperation: number };
    });

    // Sort operations in the desired order: punch-in (0), punch-out (1), transfer (2), then others
    return transformed.sort((a, b) => {
      const orderMap: { [key: number]: number } = {
        0: 0,  // Punch In
        1: 1,  // Punch Out  
        2: 2,  // Transfer
      };
      
      const aOrder = orderMap[(a as any).originalOperation] !== undefined ? orderMap[(a as any).originalOperation] : 999;
      const bOrder = orderMap[(b as any).originalOperation] !== undefined ? orderMap[(b as any).originalOperation] : 999;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // For operations not in the order map, sort by original operation number
      return (a as any).originalOperation - (b as any).originalOperation;
    }).map(op => {
      // Remove the temporary originalOperation property
      const { originalOperation, ...cleanOp } = op as any;
      return cleanOp as Operation;
    });
  };

  const { operations, actionItems, timeCard, employee } = kioskData ? {
    operations: transformApiOperations((kioskData as any).context?.operations || []),
    actionItems: [], // This needs to be added to the new API structure or handled differently
    timeCard: {
      currentEntry: undefined,
      weeklyEntries: [],
      weeklyTotal: 0,
      overtimeHours: 0,
      isOnBreak: false
    }, // This needs to be added to the new API structure or handled differently
    employee: {
      id: (kioskData as any).basics?.idnum || '',
      name: `${(kioskData as any).basics?.firstName || ''} ${(kioskData as any).basics?.lastName || ''}`.trim(),
      email: (kioskData as any).personalInfo?.contactInfo?.emails?.find((e: { emailLabel: string; emailAddress: string }) => e.emailLabel === 'Work Email')?.emailAddress || '',
      role: (kioskData as any).basics?.homeWg?.workPositionName || '',
      department: (kioskData as any).basics?.homeWg?.description || '',
    }
  } : { operations: [], actionItems: [], timeCard: { currentEntry: undefined, weeklyEntries: [], weeklyTotal: 0, overtimeHours: 0, isOnBreak: false }, employee: { id: '', name: '', email: '', role: '', department: '' } };
  const enabledOperations = operations.filter(op => op.enabled);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6">
      <div className="container mx-auto px-6 py-8">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Navigation/Operations */}
          <div className="space-y-4">
            {selectedOperation ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {selectedOperation.name}
                </h2>
                {'subOperations' in selectedOperation && selectedOperation.subOperations?.map((subOperation) => (
                  <SubOperationButton
                    key={subOperation.id}
                    subOperation={subOperation}
                    onClick={() => handleSubOperationClick(subOperation)}
                  />
                ))}
                <BackButton onClick={handleBackToMain} />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {enabledOperations.length > 0 ? 'Select Action' : 'Punch In.'}
                </h2>
                {enabledOperations.map((operation) => (
                  <OperationButton
                    key={operation.id}
                    operation={operation}
                    onClick={() => handleOperationClick(operation)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Right Column - Profile, Actions, Mobile App */}
          <div className="space-y-6">
            
            {/* Profile and Time Activity Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{employee.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Badge: {employee.id}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {timeCard.currentEntry && (timeCard.currentEntry as any).clockIn ? `Punched In for ${(timeCard.currentEntry as any).clockIn}` : 'Not clocked in'}
                  </div>
                </div>
              </div>
              
              {timeCard.weeklyEntries.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Time Activity</h4>
                  <TimeActivity entries={timeCard.weeklyEntries} />
                </div>
              )}
            </div>

            {/* Action Required Section */}
            {actionItems.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                <h3 className="font-bold text-red-800 dark:text-red-200 text-lg mb-4">
                  Action Required ({actionItems.length})
                </h3>
                <ActionItemList actionItems={actionItems} />
              </div>
            )}

            {/* Get the Mobile App Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {/* QR Code placeholder */}
                  <div className="w-20 h-20 bg-gray-900 rounded-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 11v2h2v-2H3zm0-4V5h2v2H3zm0 8v2h2v-2H3zm4 4h2v-2H7v2zm0-4h2v-2H7v2zm0-4h2v-2H7v2zm0-4h2V5H7v2zm4 4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V5h-2v2zm4 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V5h-2v2zm4 4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V5h-2v2z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Get the App!</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Get My Attendance Manager on your mobile device.
                  </p>
                  <div className="flex space-x-2">
                    <div className="bg-black rounded-lg px-3 py-2 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      <span className="text-white text-xs font-medium">App Store</span>
                    </div>
                    <div className="bg-black rounded-lg px-3 py-2 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.92 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                      <span className="text-white text-xs font-medium">Google Play</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
