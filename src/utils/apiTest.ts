// Test utility for the kiosk-employee-data API endpoint
// You can run this with: curl "http://localhost:3002/api/kiosk-employee-data?employeeId=12345"

/**
 * Test the kiosk-employee-data API endpoint
 * Usage examples:
 * 
 * 1. Basic test:
 *    curl "http://localhost:3002/api/kiosk-employee-data?employeeId=12345"
 * 
 * 2. Test with missing employee ID:
 *    curl "http://localhost:3002/api/kiosk-employee-data"
 * 
 * 3. Test with different employee ID:
 *    curl "http://localhost:3002/api/kiosk-employee-data?employeeId=98765"
 * 
 * Expected Response Structure:
 * {
 *   "employee": {
 *     "id": "12345",
 *     "name": "John Smith",
 *     "email": "john.smith@company.com",
 *     "department": "Production",
 *     "role": "Line Supervisor",
 *     "permissions": ["clock-in-out", "view-reports", "manage-team", "safety-reports"],
 *     "shift": {
 *       "start": "07:00",
 *       "end": "15:30",
 *       "breakDuration": 30
 *     }
 *   },
 *   "operations": [
 *     {
 *       "id": "clock-in-out",
 *       "name": "Clock In/Out",
 *       "description": "Record work hours",
 *       "icon": "⏰",
 *       "enabled": true,
 *       "nativeAction": "CLOCK_PUNCH"
 *     }
 *     // ... more operations
 *   ],
 *   "actionItems": [
 *     {
 *       "id": "safety-training-001",
 *       "type": "training",
 *       "title": "Monthly Safety Training",
 *       "description": "Complete the monthly safety training module",
 *       "priority": "high",
 *       "dueDate": "2025-07-25",
 *       "estimatedMinutes": 15,
 *       "route": "/training/safety-monthly"
 *     }
 *     // ... more action items
 *   ],
 *   "timeCard": {
 *     "currentEntry": {
 *       "id": "tc-2025-07-21",
 *       "date": "2025-07-21",
 *       "clockIn": "07:02",
 *       "totalHours": 0,
 *       "status": "in-progress"
 *     },
 *     "weeklyEntries": [
 *       // ... weekly time entries
 *     ],
 *     "weeklyTotal": 32.16,
 *     "overtimeHours": 0.16,
 *     "isOnBreak": false
 *   },
 *   "systemInfo": {
 *     "timestamp": "2025-07-21T...",
 *     "timezone": "America/New_York",
 *     "version": "1.0.0",
 *     "features": ["timecard", "safety-reports", "team-management", "production-metrics"]
 *   }
 * }
 */

export const API_TESTS = {
  // Test basic functionality
  testBasic: () => fetch('/api/kiosk-employee-data?employeeId=12345'),

  // Test 2: Missing employee ID (should return 400 error)
  testMissingId: () => fetch('/api/kiosk-employee-data'),

  // Test 3: Different employee ID
  testDifferentEmployee: () => fetch('/api/kiosk-employee-data?employeeId=98765'),
};

// Console test functions (for browser console)
if (typeof window !== 'undefined') {
  (window as typeof window & { testKioskApi: Record<string, () => Promise<void>> }).testKioskApi = {
    basic: () => API_TESTS.testBasic().then(r => r.json()).then(console.log),
    missingId: () => API_TESTS.testMissingId().then(r => r.json()).then(console.log),
    different: () => API_TESTS.testDifferentEmployee().then(r => r.json()).then(console.log),
  };
}
