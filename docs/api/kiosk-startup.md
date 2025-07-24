# Kiosk Startup API Documentation

## Overview
The `kiosk-startup` API endpoint provides comprehensive employee and system data needed to initialize a kiosk session. This endpoint returns all the information required for a user's dashboard, including employee details, available operations, pending action items, and time card data.

## Endpoint
```
GET /api/kiosk-startup
```

## Parameters

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | The unique identifier for the employee |
| `employee_id` | string | No | Alternative parameter name for employee ID |

## Request Examples

### Basic Request
```bash
curl "http://localhost:3001/api/kiosk-startup?employeeId=12345"
```

### Using employee_id parameter
```bash
curl "http://localhost:3001/api/kiosk-startup?employee_id=12345"
```

## Response Structure

### Success Response (200)
```json
{
  "employee": {
    "id": "12345",
    "name": "John Smith",
    "email": "john.smith@company.com",
    "department": "Production",
    "role": "Line Supervisor",
    "permissions": ["clock-in-out", "view-reports", "manage-team", "safety-reports"],
    "shift": {
      "start": "07:00",
      "end": "15:30",
      "breakDuration": 30
    }
  },
  "operations": [
    {
      "id": "clock-in-out",
      "name": "Clock In/Out",
      "description": "Record work hours",
      "icon": "⏰",
      "enabled": true,
      "nativeAction": "CLOCK_PUNCH"
    },
    {
      "id": "view-schedule",
      "name": "My Schedule",
      "description": "View work schedule",
      "icon": "📅",
      "enabled": true,
      "route": "/schedule"
    }
  ],
  "actionItems": [
    {
      "id": "safety-training-001",
      "type": "training",
      "title": "Monthly Safety Training",
      "description": "Complete the monthly safety training module",
      "priority": "high",
      "dueDate": "2025-07-25",
      "estimatedMinutes": 15,
      "route": "/training/safety-monthly"
    }
  ],
  "timeCard": {
    "currentEntry": {
      "id": "tc-2025-07-21",
      "date": "2025-07-21",
      "clockIn": "07:02",
      "totalHours": 0,
      "status": "in-progress"
    },
    "weeklyEntries": [
      {
        "id": "tc-2025-07-15",
        "date": "2025-07-15",
        "clockIn": "07:00",
        "clockOut": "15:35",
        "breakStart": "12:00",
        "breakEnd": "12:30",
        "totalHours": 8.08,
        "status": "completed"
      }
    ],
    "weeklyTotal": 32.16,
    "overtimeHours": 0.16,
    "isOnBreak": false,
    "nextScheduledShift": {
      "date": "2025-07-22",
      "start": "07:00",
      "end": "15:30"
    }
  },
  "systemInfo": {
    "timestamp": "2025-07-21T17:56:47.919Z",
    "timezone": "America/New_York",
    "version": "1.0.0",
    "features": ["timecard", "safety-reports", "team-management", "production-metrics"]
  }
}
```

### Error Response (400)
```json
{
  "error": "Employee ID is required"
}
```

### Error Response (500)
```json
{
  "error": "Internal server error"
}
```

## Data Types

### Employee
```typescript
interface Employee {
  id: string;                    // Unique employee identifier
  name: string;                  // Full name
  email: string;                 // Email address
  department: string;            // Department name
  role: string;                  // Job role/title
  permissions: string[];         // Array of permission identifiers
  shift: {
    start: string;               // Shift start time (HH:MM format)
    end: string;                 // Shift end time (HH:MM format)
    breakDuration: number;       // Break duration in minutes
  };
}
```

### Operation
```typescript
interface Operation {
  id: string;                    // Unique operation identifier
  name: string;                  // Display name
  description: string;           // Description text
  icon: string;                  // Icon emoji or identifier
  enabled: boolean;              // Whether operation is available
  requiresPermission?: string;   // Required permission (optional)
  route?: string;                // App route (optional)
  nativeAction?: string;         // Native app action (optional)
}
```

### Action Item
```typescript
interface ActionItem {
  id: string;                              // Unique identifier
  type: 'training' | 'safety' | 'review' | 'update' | 'task';
  title: string;                           // Title text
  description: string;                     // Description text
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;                        // Due date (YYYY-MM-DD format)
  estimatedMinutes?: number;               // Estimated completion time
  route?: string;                          // App route for completion
}
```

### Time Card
```typescript
interface TimeCard {
  currentEntry?: TimeCardEntry;    // Today's time entry (if exists)
  weeklyEntries: TimeCardEntry[];  // This week's completed entries
  weeklyTotal: number;             // Total hours this week
  overtimeHours: number;           // Overtime hours this week
  isOnBreak: boolean;              // Currently on break status
  nextScheduledShift?: {           // Next scheduled shift
    date: string;                  // Date (YYYY-MM-DD)
    start: string;                 // Start time (HH:MM)
    end: string;                   // End time (HH:MM)
  };
}
```

## Integration Examples

### React Hook Usage
```typescript
import { useKioskStartup } from '@/hooks/useKioskStartup';

function Dashboard() {
  const { data, loading, error, refetch } = useKioskStartup({
    employeeId: '12345',
    autoFetch: true,
    refetchInterval: 300000 // 5 minutes
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>Welcome, {data.employee.name}!</h1>
      {/* Render operations, action items, etc. */}
    </div>
  );
}
```

### Login Integration
```typescript
import { useFetchKioskStartup } from '@/hooks/useKioskStartup';

function LoginPage() {
  const { fetchForEmployee } = useFetchKioskStartup();

  const handleLogin = async (employeeId: string, password: string) => {
    try {
      const kioskData = await fetchForEmployee(employeeId);
      // Handle successful login with kiosk data
      loginUser(kioskData.employee);
    } catch (error) {
      // Handle login error
    }
  };
}
```

## Caching and Performance

- **Cache Headers**: Response includes `Cache-Control: no-cache` to ensure fresh data
- **Response Size**: Approximately 3KB for typical employee data
- **Response Time**: ~100ms (includes simulated delay)

## Security Considerations

- Employee ID is required parameter
- In production, implement proper authentication
- Sensitive data should be filtered based on user permissions
- Consider rate limiting for the endpoint

## Next Steps

1. **Database Integration**: Replace mock data with actual database queries
2. **Authentication**: Add proper authentication before returning sensitive data
3. **Permission Filtering**: Filter operations and data based on employee permissions
4. **Error Handling**: Add more specific error codes and messages
5. **Validation**: Add input validation and sanitization
6. **Logging**: Add audit logging for API access
