// Company setup types
export interface CompanyTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
}

export interface CompanySetupResponse {
  success: boolean;
  company: {
    name: string;
    logo: string; // URL to PNG/JPG
    theme: CompanyTheme;
    defaultLanguage: string;
    dailyMessage?: string;
    weeklyMessage?: string;
    timezone: string;
    features: string[];
  };
  message?: string;
}

export interface CompanyData {
  name: string;
  logo: string;
  theme: CompanyTheme;
  defaultLanguage: string;
  dailyMessage?: string;
  weeklyMessage?: string;
  timezone: string;
  features: string[];
}
