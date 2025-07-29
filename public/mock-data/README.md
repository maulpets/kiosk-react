# Mock Data Structure

This directory contains mock data for company configurations used in development and testing.

## Structure

```
public/mock-data/
├── company-mappings.json     # Maps company names to their config files
└── companies/
    ├── acme-corp.json       # ACME Corp configuration
    ├── test.json            # Test company configuration  
    ├── 123.json             # 123 company configuration
    ├── retail-solutions.json # Retail Solutions configuration
    ├── glenwood-gardens.json # Glenwood Gardens configuration
    └── default.json         # Default company configuration
```

## Adding a New Company

1. Create a new JSON file in the `companies/` directory with the company's configuration
2. Update `company-mappings.json` to include the mapping from company name to filename
3. The company name should be lowercase and match how users will input it

## Company Configuration Format

Each company file should contain:

```json
{
  "name": "Company Name",
  "logo": "/placeholder-logo.svg",
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex", 
    "accentColor": "#hex",
    "darkMode": "auto|light|dark",
    "fontSize": "small|medium|large",
    "fontFamily": "Font Family, sans-serif"
  },
  "defaultLanguage": "en",
  "dailyMessage": "Daily message text",
  "weeklyMessage": "Weekly message text",
  "timezone": "America/New_York", 
  "features": ["time-tracking", "transfers", "reports"]
}
```

## Usage

The API automatically:
1. Normalizes the input company name (lowercase, trimmed)
2. Looks up the corresponding file in `company-mappings.json`
3. Loads the specific company configuration file
4. Falls back to `default.json` if no mapping exists
