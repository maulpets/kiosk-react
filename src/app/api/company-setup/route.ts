import { NextRequest, NextResponse } from 'next/server';
import { CompanySetupResponse } from '@/types';

// Force static generation for static export
export const dynamic = 'force-static';

// Mock company configurations based on company names
const mockCompanyConfigs: Record<string, CompanySetupResponse['company']> = {
  'acme corp': {
    name: 'ACME Corp',
    logo: '/placeholder-logo.svg',
    theme: {
      primaryColor: '#1f2937', // Gray-800
      secondaryColor: '#374151', // Gray-700
      accentColor: '#3b82f6', // Blue-500
      darkMode: 'auto',
      fontSize: 'medium',
      fontFamily: 'Inter, sans-serif'
    },
    defaultLanguage: 'en',
    dailyMessage: 'Welcome to ACME Corp! Have a productive day.',
    weeklyMessage: 'This week focus on safety and efficiency.',
    timezone: 'America/New_York',
    features: ['time-tracking', 'transfers', 'reports', 'messaging']
  },
  'test': {
    name: 'test',
    logo: '/placeholder-logo.svg',
    theme: {
      primaryColor: '#7c3aed', // Violet-600
      secondaryColor: '#8b5cf6', // Violet-500
      accentColor: '#06b6d4', // Cyan-500
      darkMode: 'dark',
      fontSize: 'medium',
      fontFamily: 'Roboto, sans-serif'
    },
    defaultLanguage: 'en',
    dailyMessage: 'Innovation starts today! Let\'s build the future.',
    weeklyMessage: 'Sprint week - let\'s deliver exceptional results.',
    timezone: 'America/Los_Angeles',
    features: ['time-tracking', 'transfers', 'reports', 'messaging', 'analytics']
  },
  '123': {
    name: '123',
    logo: '/placeholder-logo.svg',
    theme: {
      primaryColor: '#dc2626', // Red-600
      secondaryColor: '#991b1b', // Red-800
      accentColor: '#f59e0b', // Amber-500
      darkMode: 'light',
      fontSize: 'large',
      fontFamily: 'Arial, sans-serif'
    },
    defaultLanguage: 'en',
    dailyMessage: 'Safety first, quality always.',
    weeklyMessage: 'Production targets: On track for 95% efficiency.',
    timezone: 'America/Chicago',
    features: ['time-tracking', 'transfers', 'safety-reports', 'maintenance']
  },
  'retail solutions': {
    name: 'Retail Solutions',
    logo: '/placeholder-logo.svg',
    theme: {
      primaryColor: '#059669', // Emerald-600
      secondaryColor: '#047857', // Emerald-700
      accentColor: '#f97316', // Orange-500
      darkMode: 'auto',
      fontSize: 'medium',
      fontFamily: 'Open Sans, sans-serif'
    },
    defaultLanguage: 'en',
    dailyMessage: 'Customer service excellence is our goal!',
    weeklyMessage: 'Holiday season prep - all hands on deck!',
    timezone: 'America/New_York',
    features: ['time-tracking', 'transfers', 'customer-service', 'inventory']
  }
};

// Default configuration for unknown companies
const defaultConfig: CompanySetupResponse['company'] = {
  name: 'Your Company',
  logo: '/placeholder-logo.svg',
  theme: {
    primaryColor: '#1f2937', // Gray-800
    secondaryColor: '#374151', // Gray-700
    accentColor: '#3b82f6', // Blue-500
    darkMode: 'auto',
    fontSize: 'medium',
    fontFamily: 'Inter, sans-serif'
  },
  defaultLanguage: 'en',
  dailyMessage: 'Welcome! Have a great day at work.',
  timezone: 'America/New_York',
  features: ['time-tracking', 'transfers', 'reports']
};

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();
    
    if (!companyName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company name is required'
        },
        { status: 400 }
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Normalize company name for lookup
    const normalizedName = companyName.toLowerCase().trim();
    
    // Get company config or use default
    const companyConfig = mockCompanyConfigs[normalizedName] || {
      ...defaultConfig,
      name: companyName.trim()
    };

    const response: CompanySetupResponse = {
      success: true,
      company: companyConfig,
      message: `Successfully configured for ${companyConfig.name}`
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Company setup API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
