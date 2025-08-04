'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebViewBridge } from '@/hooks/useWebViewBridge';
import { useAppContext } from '@/store/AppContext';
import { useKioskEmployeeData } from '@/hooks/useKioskEmployeeData';
import { useI18n } from '@/hooks/useI18n';
import { getLocaleString } from '@/lib/i18n';
import { 
  KioskStartupResponse, 
  TimeEntry,
  DashboardOperation,
  DashboardSubOperationContainer,
  ExtendedSubOperation,
  ExtendedOperation,
  ApiOperation,
  SubOperation
} from '@/types';

// Component prop interfaces (UI-specific, can remain local)
interface OperationButtonProps {
  operation: DashboardOperation;
  onClick: () => void;
}

function OperationButton({ operation, onClick }: OperationButtonProps) {
  const { enabled, icon, name, description } = operation;
  
  // Define different styles for operations
  const getButtonStyle = (operationType: 'punch' | 'transfer' | 'timecard' | 'other') => {
    // Style 2: Gradient Accent (for punch and transfer operations)
    const gradientStyle = {
      button: enabled 
        ? 'bg-gradient-to-r from-company-accent/10 to-company-secondary/10 hover:from-company-accent/20 hover:to-company-secondary/20 text-foreground border border-company-accent/30 shadow-md hover:shadow-lg'
        : 'bg-muted text-muted-foreground cursor-not-allowed border border-muted',
      icon: enabled ? 'p-3 rounded-lg bg-gradient-to-br from-company-accent to-company-secondary text-white' : 'p-3 rounded-lg bg-muted',
      title: enabled ? 'font-bold text-base md:text-lg truncate text-company-accent' : 'font-bold text-base md:text-lg truncate',
      arrow: enabled ? 'text-company-accent' : 'opacity-60'
    };

    // Style 3: Clean Minimal (for other operations)
    const minimalStyle = {
      button: enabled 
        ? 'bg-muted/30 hover:bg-company-accent/10 text-foreground border border-border hover:border-company-accent/30 hover:shadow-md'
        : 'bg-muted text-muted-foreground cursor-not-allowed border border-muted',
      icon: enabled ? 'p-3 rounded-lg bg-company-accent/10 text-company-accent' : 'p-3 rounded-lg bg-muted',
      title: enabled ? 'font-bold text-base md:text-lg truncate text-company-accent' : 'font-bold text-base md:text-lg truncate',
      arrow: enabled ? 'text-company-accent opacity-60' : 'opacity-60'
    };

    // Special Time Card Style: Soft secondary with document theme
    const timeCardStyle = {
      button: enabled 
        ? 'bg-gradient-to-r from-company-secondary/5 to-company-primary/5 hover:from-company-secondary/10 hover:to-company-primary/10 text-foreground border border-company-secondary/20 shadow-sm hover:shadow-md'
        : 'bg-muted text-muted-foreground cursor-not-allowed border border-muted',
      icon: enabled ? 'p-3 rounded-lg bg-company-secondary/15 text-company-secondary' : 'p-3 rounded-lg bg-muted',
      title: enabled ? 'font-bold text-base md:text-lg truncate text-company-secondary' : 'font-bold text-base md:text-lg truncate',
      arrow: enabled ? 'text-company-secondary opacity-70' : 'opacity-60'
    };

    if (operationType === 'timecard') return timeCardStyle;
    if (operationType === 'punch' || operationType === 'transfer') return gradientStyle;
    return minimalStyle;
  };
  
  // Determine operation type for styling
  const getOperationType = (operation: DashboardOperation): 'punch' | 'transfer' | 'timecard' | 'other' => {
    const name = operation.name.toLowerCase();
    if (name.includes('punch') || name.includes('clock')) return 'punch';
    if (name.includes('transfer')) return 'transfer';
    if (name.includes('time card') || name.includes('timecard')) return 'timecard';
    return 'other';
  };

  const operationType = getOperationType(operation);
  const style = getButtonStyle(operationType);
  
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`w-full p-4 md:p-6 rounded-xl text-left transition-all duration-200 ${style.button}`}
    >
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Icon with varying backgrounds */}
        <div className={`flex-shrink-0 ${style.icon}`}>
          <span className="text-xl md:text-2xl">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className={style.title}>{name}</div>
          <div className="text-sm opacity-75 line-clamp-2">{description}</div>
        </div>
        {operation.nativeAction && (
          <div className={`flex-shrink-0 ${style.arrow}`}>
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      className={`w-full p-4 md:p-6 rounded-xl text-left transition-all ${
        enabled
          ? 'bg-company-secondary hover:opacity-90 text-white shadow-lg hover:shadow-xl'
          : 'bg-muted text-muted-foreground cursor-not-allowed'
      }`}
    >
      <div className="flex items-center space-x-3 md:space-x-4">
        <span className="text-2xl md:text-3xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base md:text-lg truncate">{name}</div>
          <div className="text-sm opacity-90 line-clamp-2">{description}</div>
        </div>
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-lg text-left transition-all bg-muted hover:bg-muted/80 text-muted-foreground shadow-md hover:shadow-lg"
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
  entries: TimeEntry[];
  locale: string;
}

function TimeActivity({ entries, locale }: TimeActivityProps) {
  // Show all entries instead of just the last 2
  const allEntries = entries;
  
  return (
    <div className="space-y-2">
      {allEntries.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              entry.status === 'completed' ? 'bg-accent' : 
              entry.status === 'in-progress' ? 'bg-primary' : 'bg-muted'
            }`} />
            <div className="text-xs text-muted-foreground mr-2">
              {new Date(entry.date).toLocaleDateString(locale, { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {entry.clockIn}{entry.clockOut ? ` - ${entry.clockOut}` : ' - In Progress'}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { state } = useAppContext();
  const { sendToNative, isConnected } = useWebViewBridge();
  const { t, locale } = useI18n();
  const router = useRouter();
  
  // Get the locale string for date formatting
  const localeString = getLocaleString(locale);
  
  // Helper function to process time card data with locale
  const processTimeCardData = (kioskData: KioskStartupResponse, locale: string) => {
    const workedShifts = kioskData.context?.workedShifts || [];
    
    if (workedShifts.length === 0) {
      return {
        currentEntry: null as TimeEntry | null,
        weeklyEntries: [],
        weeklyTotal: 0,
        overtimeHours: 0,
        isOnBreak: false
      };
    }
    
    // Collect all actual transactions from all shifts into a single array
    const allTransactions: Array<{ timestamp: string; shiftDate: string; shiftIndex: number }> = [];
    
    workedShifts.forEach((shift, shiftIndex) => {
      const transactions = shift.transactions?.actual || [];
      transactions.forEach(transaction => {
        allTransactions.push({
          timestamp: transaction.timestamp,
          shiftDate: shift.date,
          shiftIndex
        });
      });
    });
    
    // Sort all transactions by timestamp
    allTransactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Group transactions into pairs (in/out)
    const transactionPairs: Array<{
      clockIn: string;
      clockOut?: string;
      shiftDate: string;
      shiftIndex: number;
    }> = [];
    
    for (let i = 0; i < allTransactions.length; i += 2) {
      const clockInTransaction = allTransactions[i];
      const clockOutTransaction = allTransactions[i + 1];
      
      transactionPairs.push({
        clockIn: new Date(clockInTransaction.timestamp).toLocaleTimeString(locale, { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        clockOut: clockOutTransaction ? new Date(clockOutTransaction.timestamp).toLocaleTimeString(locale, { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }) : undefined,
        shiftDate: clockInTransaction.shiftDate,
        shiftIndex: clockInTransaction.shiftIndex
      });
    }
    
    // Transform pairs into TimeEntry format
    const weeklyEntries: TimeEntry[] = transactionPairs.map((pair, pairIndex) => {
      // Calculate hours if we have both in and out
      let totalHours = 0;
      if (pair.clockOut) {
        // Find the original transactions to calculate hours from timestamps
        const clockInTime = allTransactions.find(t => 
          new Date(t.timestamp).toLocaleTimeString(locale, { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }) === pair.clockIn && t.shiftDate === pair.shiftDate
        );
        const clockOutTime = allTransactions.find(t => 
          new Date(t.timestamp).toLocaleTimeString(locale, { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }) === pair.clockOut && t.shiftDate === pair.shiftDate
        );
        
        if (clockInTime && clockOutTime) {
          const inTime = new Date(clockInTime.timestamp).getTime();
          const outTime = new Date(clockOutTime.timestamp).getTime();
          totalHours = (outTime - inTime) / (1000 * 60 * 60); // Convert milliseconds to hours
        }
      }
      
      // Determine status
      let status: 'completed' | 'in-progress' | 'pending-approval' = 'completed';
      if (!pair.clockOut) {
        status = 'in-progress';
      }
      
      return {
        id: `transaction-pair-${pair.shiftDate}-${pair.shiftIndex}-${pairIndex}`,
        date: pair.shiftDate,
        clockIn: pair.clockIn,
        clockOut: pair.clockOut,
        totalHours,
        status,
        workedShifts: 1,
        payLines: 0,
        adjustments: 0,
        transactions: [] // Simplified - no individual transaction details
      };
    });
    
    // Calculate totals from original shift data
    const weeklyTotal = workedShifts.reduce((sum, shift) => sum + (shift.hundHours || 0), 0);
    const overtimeHours = workedShifts.reduce((sum, shift) => {
      const regularHours = shift.hundHours || 0;
      return sum + (regularHours > 8 ? regularHours - 8 : 0);
    }, 0);
    
    // Create current entry if punched in (last transaction was a punch in and status is in-progress)
    const currentEntry = weeklyEntries.find(entry => entry.status === 'in-progress') || null;
    
    return {
      currentEntry,
      weeklyEntries,
      weeklyTotal,
      overtimeHours,
      isOnBreak: false
    };
  };
  
  // State for managing sub-operations view
  const [selectedOperation, setSelectedOperation] = useState<DashboardSubOperationContainer | null>(null);
  
  // Fetch kiosk startup data
  const { data: kioskData, loading, error } = useKioskEmployeeData({
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

  const handleOperationClick = (operation: DashboardOperation) => {
    // Handle specific operations by ID
    if (operation.id === '{5324678A-4261-40EE-BB3D-1026297ECB37}') {
      router.push('/transfer');
      return;
    }
    
    if (operation.id === 'timecard-operation') {
      router.push('/timecard');
      return;
    }
    
    // Check if operation is a sub-operation container
    const operationWithSubs = operation as DashboardSubOperationContainer;
    if (operationWithSubs.operation === 1 && operationWithSubs.subOperations && operationWithSubs.subOperations.length > 0) {
      setSelectedOperation(operationWithSubs);
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
        const extendedSubOp = subOperation as ExtendedSubOperation;
        const selectionId = extendedSubOp.selectionId?.toString() || subOperation.id.split('-').pop();
        
        const params = new URLSearchParams({
          operation: selectedOperation.id, // This is the fkeyguid
          subOperation: selectionId || subOperation.id // This should be the selection ID
        });
        
        // Route to appropriate screen based on operation number, not fkeyguid
        const extendedOperation = selectedOperation as ExtendedOperation;
        let route = '/punch-in'; // default
        if (extendedOperation.originalOperation === 1) route = '/punch-out';
        else if (extendedOperation.originalOperation === 2) route = '/transfer';
        
        router.push(`${route}?${params.toString()}`);
      }
    }
  };

  const handleBackToMain = () => {
    setSelectedOperation(null);
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
            <p>Error loading dashboard data: {error || 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform API operations to match expected interface
  const transformApiOperations = (apiOperations: ApiOperation[] = []): ExtendedOperation[] => {
    const transformed = apiOperations.map(apiOp => {
      const baseOp: ExtendedOperation = {
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
        const subOperations: ExtendedSubOperation[] = apiOp.prompts!.selections!.map(selection => ({
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
        };
      }

      // Return as GeneralOperation (most common case)
      return {
        ...baseOp,
        operation: 0 as const
      };
    });

    // Sort operations in the desired order: punch-in (0), punch-out (1), transfer (2), then others
    const sorted = transformed.sort((a, b) => {
      // Define explicit ordering priorities
      const getOrderPriority = (operation: number | undefined): number => {
        switch (operation) {
          case 0: return 0;  // Punch In - highest priority
          case 1: return 1;  // Punch Out - second priority
          case 2: return 2;  // Transfer - third priority
          default: return 999 + (operation || 0);  // All others ordered by operation number after main operations
        }
      };
      
      const aPriority = getOrderPriority(a.originalOperation);
      const bPriority = getOrderPriority(b.originalOperation);
      
      return aPriority - bPriority;
    }).map(op => {
      // Keep the originalOperation for routing decisions
      return op;
    });
    
    return sorted;
  };

  const { operations, timeCard, employee } = kioskData ? {
    operations: (() => {
      const typedKioskData = kioskData as KioskStartupResponse;
      const baseOperations = transformApiOperations(typedKioskData.context?.operations || []);
      
      // Add time card operation if profileInfo.sheetId === 0
      const profileInfo = typedKioskData.profileInfo as { sheetId?: number } | undefined;
      if (profileInfo?.sheetId === 0) {
        const timeCardOperation: ExtendedOperation = {
          id: 'timecard-operation',
          name: t('dashboard.timeCard'),
          description: t('dashboard.timeCardDesc'),
          icon: '📋',
          enabled: true,
          route: '/timecard',
          nativeAction: 'VIEW_TIMECARD',
          originalOperation: 2.5 // Place between transfer (2) and other operations
        };
        
        baseOperations.push(timeCardOperation);
        
        // Re-sort to maintain proper order after adding timecard
        baseOperations.sort((a, b) => {
          // Define explicit ordering priorities
          const getOrderPriority = (operation: number | undefined): number => {
            switch (operation) {
              case 0: return 0;      // Punch In - highest priority
              case 1: return 1;      // Punch Out - second priority
              case 2: return 2;      // Transfer - third priority
              case 2.5: return 3;    // Time Card - fourth priority
              default: return 999 + (operation || 0);  // All others ordered by operation number
            }
          };
          
          const aPriority = getOrderPriority((a as ExtendedOperation).originalOperation);
          const bPriority = getOrderPriority((b as ExtendedOperation).originalOperation);
          
          return aPriority - bPriority;
        });
      }
      
      return baseOperations;
    })(),
    timeCard: processTimeCardData(kioskData as KioskStartupResponse, localeString),
    employee: {
      id: (kioskData as KioskStartupResponse).basics?.idnum || '',
      name: `${(kioskData as KioskStartupResponse).basics?.firstName || ''} ${(kioskData as KioskStartupResponse).basics?.lastName || ''}`.trim(),
      email: (kioskData as KioskStartupResponse).personalInfo?.contactInfo?.emails?.find((e: { emailLabel: string; emailAddress: string }) => e.emailLabel === 'Work Email')?.emailAddress || '',
      role: (kioskData as KioskStartupResponse).basics?.homeWg?.workPositionName || '',
      department: (kioskData as KioskStartupResponse).basics?.homeWg?.description || '',
    }
  } : { 
    operations: [], 
    timeCard: { 
      currentEntry: null, 
      weeklyEntries: [], 
      weeklyTotal: 0, 
      overtimeHours: 0, 
      isOnBreak: false 
    }, 
    employee: { 
      id: '', 
      name: '', 
      email: '', 
      role: '', 
      department: '' 
    } 
  };
  const enabledOperations = operations.filter(op => op.enabled);

  return (
    <div className="h-full w-full bg-background overflow-auto">
      <div className="w-full max-w-full px-4 md:px-6 py-4 md:py-8 min-h-full">
        {/* Two Column Layout - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 h-full">
          
          {/* Left Column - Navigation/Operations */}
          <div className="space-y-4 flex flex-col">
            {selectedOperation ? (
              <>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">
                  {selectedOperation.name}
                </h2>
                <div className="flex-1 space-y-4 overflow-auto">
                  {'subOperations' in selectedOperation && selectedOperation.subOperations?.map((subOperation) => (
                    <SubOperationButton
                      key={subOperation.id}
                      subOperation={subOperation}
                      onClick={() => handleSubOperationClick(subOperation)}
                    />
                  ))}
                </div>
                <BackButton onClick={handleBackToMain} />
              </>
            ) : (
              <>
                <div className="space-y-4">
                  {(() => {
                    const fullWidthOperations: DashboardOperation[] = [];
                    const halfWidthOperations: DashboardOperation[] = [];
                    
                    // Separate operations by type while preserving order
                    enabledOperations.forEach(operation => {
                      const operationType = operation.name.toLowerCase().includes('punch') || operation.name.toLowerCase().includes('clock') ? 'punch' :
                                          operation.name.toLowerCase().includes('transfer') ? 'transfer' : 
                                          operation.name.toLowerCase().includes('time card') || operation.name.toLowerCase().includes('timecard') ? 'timecard' : 'other';
                      
                      if (operationType === 'punch' || operationType === 'transfer' || operationType === 'timecard') {
                        fullWidthOperations.push(operation);
                      } else {
                        halfWidthOperations.push(operation);
                      }
                    });
                    
                    // Ensure full width operations are properly sorted
                    fullWidthOperations.sort((a, b) => {
                      const getOrderPriority = (operation: DashboardOperation): number => {
                        const extOp = operation as ExtendedOperation;
                        switch (extOp.originalOperation) {
                          case 0: return 0;      // Punch In
                          case 1: return 1;      // Punch Out
                          case 2: return 2;      // Transfer
                          case 2.5: return 3;    // Time Card
                          default: return 999 + (extOp.originalOperation || 0);
                        }
                      };
                      
                      return getOrderPriority(a) - getOrderPriority(b);
                    });
                    
                    return (
                      <>
                        {/* Full width operations */}
                        {fullWidthOperations.map((operation) => (
                          <OperationButton
                            key={operation.id}
                            operation={operation}
                            onClick={() => handleOperationClick(operation)}
                          />
                        ))}
                        
                        {/* Half width operations in rows */}
                        {halfWidthOperations.reduce((acc: DashboardOperation[][], operation, index) => {
                          if (index % 2 === 0) {
                            acc.push([operation]);
                          } else {
                            acc[acc.length - 1].push(operation);
                          }
                          return acc;
                        }, []).map((row, rowIndex) => (
                          <div key={`row-${rowIndex}`} className="flex gap-4">
                            {row.map((operation) => (
                              <div key={operation.id} className="flex-1">
                                <OperationButton
                                  operation={operation}
                                  onClick={() => handleOperationClick(operation)}
                                />
                              </div>
                            ))}
                            {/* Fill empty space if odd number of operations */}
                            {row.length === 1 && <div className="flex-1"></div>}
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>

          {/* Right Column - Profile, Actions, Mobile App */}
          <div className="space-y-4 md:space-y-6  flex-col">
            
            {/* Profile and Time Activity Section */}
            <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm flex-1">
              <div className="flex items-start justify-between space-x-4">
                {/* Profile Information */}
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-bold text-card-foreground text-sm md:text-base truncate">{employee.name}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.badge')} {employee.id}</p>
                </div>
                
                {/* Recent Activity */}
                {timeCard.weeklyEntries.length > 0 && (
                  <div className="flex-shrink-0">
                    <h4 className="font-medium text-card-foreground mb-2 text-xs md:text-sm">{t('dashboard.recentTimeActivity')}</h4>
                    <TimeActivity entries={timeCard.weeklyEntries} locale={localeString} />
                  </div>
                )}
              </div>
            </div>

            {/* Action Required Section */}
            {(() => {
              const typedKioskData = kioskData as KioskStartupResponse;
              const openItems = typedKioskData?.openItems || [];
              return openItems.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <h3 className="font-bold text-destructive text-base md:text-lg mb-3 md:mb-4">
                    {t('operations.actionRequired')} ({openItems.length})
                  </h3>
                  <div className="space-y-3">
                    {openItems.slice(0, 3).map((item) => (
                      <button
                        key={item.itemdata}
                        onClick={() => router.push('/action-required')}
                        className="w-full p-3 border border-destructive/30 rounded-lg hover:bg-destructive/5 transition-colors text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-destructive text-sm md:text-base">
                              {item.responseRequest.descr}
                            </h4>
                            {item.responseRequestEvent?.eventDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {t('actionRequired.event')} {new Date(item.responseRequestEvent.eventDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <svg className="w-4 h-4 text-destructive flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                    {openItems.length > 3 && (
                      <button
                        onClick={() => router.push('/action-required')}
                        className="w-full p-2 text-center text-destructive text-sm hover:underline"
                      >
                        {t('actionRequired.viewAll', [openItems.length.toString()])}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Get the Mobile App Section */}
            <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="flex-shrink-0">
                  {/* QR Code placeholder */}
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-foreground rounded-lg flex items-center justify-center">
                    <svg className="w-12 h-12 md:w-16 md:h-16 text-background" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 11v2h2v-2H3zm0-4V5h2v2H3zm0 8v2h2v-2H3zm4 4h2v-2H7v2zm0-4h2v-2H7v2zm0-4h2v-2H7v2zm0-4h2V5H7v2zm4 4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V5h-2v2zm4 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V5h-2v2zm4 4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V5h-2v2z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-card-foreground text-base md:text-lg mb-1 md:mb-2">{t('dashboard.getTheApp')}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
                    {t('dashboard.getMyAttendanceManager')}
                  </p>
                  <div className="flex space-x-2">
                    <div className="bg-foreground rounded-lg px-2 py-1 md:px-3 md:py-2 flex items-center space-x-1 md:space-x-2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-background" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      <span className="text-background text-xs font-medium">{t('dashboard.appStore')}</span>
                    </div>
                    <div className="bg-foreground rounded-lg px-2 py-1 md:px-3 md:py-2 flex items-center space-x-1 md:space-x-2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-background" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.92 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                      <span className="text-background text-xs font-medium">{t('dashboard.googlePlay')}</span>
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
