'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import { useWebViewBridge } from '@/hooks/useWebViewBridge';
import { useFetchKioskStartup } from '@/hooks/useKioskStartup';
import { ROUTES } from '@/constants';

interface NumberPadProps {
  onNumberClick: (number: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

function NumberPad({ onNumberClick, onBackspace, onClear }: NumberPadProps) {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  
  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {numbers.slice(0, 9).map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          className="aspect-square bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xl font-semibold text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {num}
        </button>
      ))}
      
      <button
        onClick={onClear}
        className="aspect-square bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg text-sm font-medium text-red-700 dark:text-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Clear
      </button>
      
      <button
        onClick={() => onNumberClick('0')}
        className="aspect-square bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xl font-semibold text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        0
      </button>
      
      <button
        onClick={onBackspace}
        className="aspect-square bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800 rounded-lg text-sm font-medium text-orange-700 dark:text-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
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
      
      // Set user data from the API response - using the new structure
      setUser({
        id: kioskData.basics.idnum,
        name: `${kioskData.basics.firstName} ${kioskData.basics.lastName}`,
        email: kioskData.personalInfo.contactInfo.emails.find((e: { emailLabel: string; emailAddress: string }) => e.emailLabel === 'Work Email')?.emailAddress || '',
        role: kioskData.basics.homeWg.workPositionName,
        department: kioskData.basics.homeWg.description,
        permissions: ['clock-in-out', 'view-reports'], // Default permissions - adjust as needed
        shift: {
          start: '07:00',
          end: '15:30',
          breakDuration: 30
        }
      });

      // Send successful login data to native
      if (isConnected) {
        sendToNative('LOGIN_SUCCESS', {
          basics: kioskData.basics,
          personalInfo: kioskData.personalInfo,
          operations: kioskData.context.operations,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">👤</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Employee Login
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {currentStep === 'employeeId' 
                ? 'Enter your employee ID' 
                : 'Enter your password'
              }
            </p>
          </div>

          {/* Input Display */}
          <div className="mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {currentStep === 'employeeId' ? 'Employee ID' : 'Password'}
              </div>
              <div className="text-2xl font-mono text-gray-900 dark:text-white h-8 flex items-center justify-center">
                {displayValue || '—'}
              </div>
            </div>
            
            {error && (
              <div className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </div>
            )}
          </div>

          {/* Number Pad */}
          <div className="mb-6">
            <NumberPad 
              onNumberClick={handleNumberClick}
              onBackspace={handleBackspace}
              onClear={handleClear}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {currentStep === 'password' && (
              <button
                onClick={handleBack}
                className="w-full bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                ← Back to Employee ID
              </button>
            )}
            
            <button
              onClick={handleContinue}
              disabled={isLoading || !currentValue}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Logging in...
                </div>
              ) : currentStep === 'employeeId' ? (
                'Continue'
              ) : (
                'Login'
              )}
            </button>
          </div>

          {/* Connection Status */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-gray-600 dark:text-gray-300">
                {isConnected ? 'Connected to native app' : 'Running in standalone mode'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
