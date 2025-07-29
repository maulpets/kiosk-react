# Company Setup API Examples

## New GET Endpoint

### Basic Usage
```bash
# Get ACME Corp configuration
curl "http://localhost:3000/api/company-setup?companyName=acme%20corp"

# Get Test company configuration  
curl "http://localhost:3000/api/company-setup?companyName=test"

# Get default configuration for unknown company
curl "http://localhost:3000/api/company-setup?companyName=unknown%20company"
```

### Response Format
```json
{
  "success": true,
  "company": {
    "name": "ACME Corp",
    "logo": "/placeholder-logo.svg",
    "theme": {
      "primaryColor": "#1f2937",
      "secondaryColor": "#374151", 
      "accentColor": "#3b82f6",
      "darkMode": "auto",
      "fontSize": "medium",
      "fontFamily": "Inter, sans-serif"
    },
    "defaultLanguage": "en",
    "dailyMessage": "Welcome to ACME Corp! Have a productive day.",
    "weeklyMessage": "This week focus on safety and efficiency.",
    "timezone": "America/New_York",
    "features": ["time-tracking", "transfers", "reports", "messaging"]
  },
  "message": "Successfully configured for ACME Corp"
}
```

## Backward Compatibility

The API still supports POST requests for backward compatibility:

```bash
curl -X POST "http://localhost:3000/api/company-setup" \
  -H "Content-Type: application/json" \
  -d '{"companyName": "acme corp"}'
```

## Frontend Usage

```typescript
// New GET approach (preferred)
const response = await fetch(`/api/company-setup?companyName=${encodeURIComponent(companyName)}`);

// Old POST approach (still works)
const response = await fetch('/api/company-setup', {
  method: 'POST', 
  body: JSON.stringify({ companyName })
});
```
