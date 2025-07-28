'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/store/AppContext';
import { useWebViewBridge } from '@/hooks/useWebViewBridge';
import { useFetchKioskStartup } from '@/hooks/useKioskStartup';
import { useCompanyTheme } from '@/hooks/useCompanyTheme';
import { useI18n } from '@/hooks/useI18n';
import { ROUTES } from '@/constants';

interface NumberPadProps {
  onNumberClick: (number: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

function NumberPad({ onNumberClick, onBackspace, onClear }: NumberPadProps) {
  const { t } = useI18n();
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  
  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {numbers.slice(0, 9).map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          className="aspect-square bg-muted hover:bg-company-accent hover:text-white rounded-lg text-xl font-semibold text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-company-accent"
        >
          {num}
        </button>
      ))}
      
      <button
        onClick={onClear}
        className="aspect-square bg-destructive/10 hover:bg-destructive/20 rounded-lg text-sm font-medium text-destructive transition-colors focus:outline-none focus:ring-2 focus:ring-destructive"
      >
        {t('common.clear')}
      </button>
      
      <button
        onClick={() => onNumberClick('0')}
        className="aspect-square bg-muted hover:bg-company-accent hover:text-white rounded-lg text-xl font-semibold text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-company-accent"
      >
        0
      </button>
      
      <button
        onClick={onBackspace}
        className="aspect-square bg-company-secondary/20 hover:bg-company-secondary/30 rounded-lg text-sm font-medium text-company-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-company-secondary"
      >
        ⌫
      </button>
    </div>
  );
}

export default function Login() {
  const router = useRouter();
  const { setUser } = useAppContext();
  const { sendToNative, isConnected } = useWebViewBridge();
  const { fetchForEmployee } = useFetchKioskStartup();
  const { companyData } = useCompanyTheme();
  const { t } = useI18n();
  
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [currentStep, setCurrentStep] = useState<'employeeId' | 'password'>('employeeId');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNumberClick = useCallback((number: string) => {
    setError('');
    
    if (currentStep === 'employeeId') {
      if (employeeId.length < 10) { // Limit employee ID length
        setEmployeeId(prev => prev + number);
      }
    } else {
      if (password.length < 8) { // Limit password length
        setPassword(prev => prev + number);
      }
    }
  }, [currentStep, employeeId.length, password.length]);

  const handleBackspace = useCallback(() => {
    setError('');
    
    if (currentStep === 'employeeId') {
      setEmployeeId(prev => prev.slice(0, -1));
    } else {
      setPassword(prev => prev.slice(0, -1));
    }
  }, [currentStep]);

  const handleClear = useCallback(() => {
    setError('');
    
    if (currentStep === 'employeeId') {
      setEmployeeId('');
    } else {
      setPassword('');
    }
  }, [currentStep]);

  const handleLogin = useCallback(async () => {
    if (password.length < 4) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Send login attempt to native if connected
      if (isConnected) {
        sendToNative('USER_LOGIN', { 
          employeeId, 
          password: password, // In real app, this should be hashed
          timestamp: Date.now()
        });
      }

      // Fetch kiosk startup data for the employee
      const kioskData = await fetchForEmployee(employeeId);
      
      // Cast to any to work with actual API structure (until types are aligned)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiData = kioskData as any;
      
      // Set user data from the API response - working with actual API structure
      setUser({
        id: apiData.basics?.idnum || employeeId,
        name: `${apiData.basics?.firstName || 'Unknown'} ${apiData.basics?.lastName || 'User'}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        email: apiData.personalInfo?.contactInfo?.emails?.find((e: any) => e.emailLabel === 'Work Email')?.emailAddress || 'user@company.com',
        role: apiData.basics?.homeWg?.workPositionName || 'Employee',
        department: apiData.basics?.homeWg?.description || 'General',
        permissions: ['clock-in-out', 'view-reports'], // Default permissions
        shift: {
          start: '07:00',
          end: '15:30',
          breakDuration: 30
        }
      });

      // Send successful login data to native
      if (isConnected) {
        sendToNative('LOGIN_SUCCESS', {
          basics: apiData.basics,
          personalInfo: apiData.personalInfo,
          operations: apiData.context?.operations || [],
          timestamp: Date.now()
        });
      }

      router.push(ROUTES.DASHBOARD);

    } catch (error) {
      setError('Login failed. Please check your credentials and try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, password, isConnected, sendToNative, fetchForEmployee, setUser, router]);

  const handleContinue = useCallback(() => {
    if (currentStep === 'employeeId') {
      if (employeeId.length < 3) {
        setError('Please enter a valid employee ID');
        return;
      }
      setCurrentStep('password');
    } else {
      handleLogin();
    }
  }, [currentStep, employeeId.length, handleLogin]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for keys we want to handle
      if (/^[0-9]$/.test(event.key) || event.key === 'Backspace' || event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
      }

      // Handle number keys (0-9)
      if (/^[0-9]$/.test(event.key)) {
        handleNumberClick(event.key);
      }
      // Handle backspace
      else if (event.key === 'Backspace') {
        handleBackspace();
      }
      // Handle Enter key
      else if (event.key === 'Enter') {
        handleContinue();
      }
      // Handle Escape key (clear current field)
      else if (event.key === 'Escape') {
        handleClear();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNumberClick, handleBackspace, handleContinue, handleClear]); // Dependencies to ensure handlers have current state

  const handleBack = () => {
    if (currentStep === 'password') {
      setCurrentStep('employeeId');
      setPassword('');
      setError('');
    }
  };

  const currentValue = currentStep === 'employeeId' ? employeeId : password;
  const displayValue = currentStep === 'password' ? '*'.repeat(password.length) : employeeId;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
              
              {/* Left Column - Number Pad */}
              <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                <div className="max-w-sm mx-auto w-full">
                  
                  {/* Input Display */}
                  <div className="mb-8">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">
                        {currentStep === 'employeeId' ? t('login.employeeId') : t('login.password')}
                      </div>
                      <div className="text-2xl font-mono text-foreground h-8 flex items-center justify-center">
                        {displayValue || '—'}
                      </div>
                    </div>
                    
                    {error && (
                      <div className="mt-3 text-sm text-destructive text-center">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Number Pad */}
                  <NumberPad 
                    onNumberClick={handleNumberClick}
                    onBackspace={handleBackspace}
                    onClear={handleClear}
                  />
                </div>
              </div>

              {/* Right Column - Action Buttons */}
              <div className="bg-muted/50 p-6 md:p-8 lg:p-12 flex flex-col justify-center border-l border-border">
                <div className="max-w-sm mx-auto w-full space-y-4">
                  
                  {/* Company Logo */}
                  {companyData?.logo && (
                    <div className="text-center mb-6">
                      <Image 
                        src={companyData.logo} 
                        alt={`${companyData.name} Logo`}
                        width={80}
                        height={80}
                        className="mx-auto rounded-lg shadow-sm"
                        onError={() => {
                          console.log('Company logo failed to load');
                        }}
                      />
                      <div className="text-sm text-muted-foreground mt-2 font-medium">
                        {companyData.name}
                      </div>
                      {companyData.dailyMessage && (
                        <div className="text-xs text-company-accent mt-1 italic">
                          {companyData.dailyMessage}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-company-primary mb-2">
                      {currentStep === 'employeeId' ? t('login.enterEmployeeId') : t('login.enterPassword')}
                    </h2>
                    <p className="text-muted-foreground">
                      {currentStep === 'employeeId' 
                        ? t('login.useKeypadEmployeeId')
                        : t('login.useKeypadPassword')
                      }
                    </p>
                    {/* Debug info for testing */}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {t('login.testCredentials')}
                    </div>
                  </div>
                  
                  {/* Current Step Indicator */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <div className={`w-3 h-3 rounded-full ${currentStep === 'employeeId' ? 'bg-company-accent' : 'bg-company-accent'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${currentStep === 'password' ? 'bg-company-accent' : 'bg-muted'}`}></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('login.stepOfTwo', [currentStep === 'employeeId' ? '1' : '2'])}
                    </p>
                  </div>

                  {/* Back Button */}
                  {currentStep === 'password' && (
                    <button
                      onClick={handleBack}
                      className="w-full bg-muted text-muted-foreground py-4 px-6 rounded-xl font-medium hover:bg-muted/80 transition-colors text-lg"
                    >
                      {t('login.backToEmployeeId')}
                    </button>
                  )}
                  
                  {/* Continue/Login Button */}
                  <button
                    onClick={handleContinue}
                    disabled={isLoading || !currentValue}
                    className="w-full bg-company-accent text-white py-4 px-6 rounded-xl font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-company-accent focus:ring-offset-2 disabled:bg-muted disabled:cursor-not-allowed transition-colors text-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        {t('login.loginInProgress')}
                      </div>
                    ) : currentStep === 'employeeId' ? (
                      `${t('common.continue')} →`
                    ) : (
                      t('login.loginButton')
                    )}
                  </button>

                  {/* Connection Status */}
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        isConnected ? 'bg-company-accent' : 'bg-muted'
                      }`} />
                      <span className="text-muted-foreground">
                        {isConnected ? t('login.connectedToNative') : t('login.runningStandalone')}
                      </span>
                    </div>
                  </div>

                  {/* Keyboard Shortcuts Help */}
                  <div className="pt-4">
                    <p className="text-xs text-muted-foreground text-center">
                      Keyboard shortcuts: Numbers (0-9), Backspace, Enter, Esc (clear)
                    </p>
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
