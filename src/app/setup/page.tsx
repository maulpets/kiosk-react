'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import { useWebViewBridge } from '@/hooks/useWebViewBridge';
import { ROUTES } from '@/constants';

export default function Setup() {
  const router = useRouter();
  const { setSetupComplete } = useAppContext();
  const { sendToNative, isConnected } = useWebViewBridge();
  
  const [organizationName, setOrganizationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Send setup data to native app if connected
      if (isConnected) {
        sendToNative('SETUP_COMPLETE', { 
          organizationName: organizationName.trim(),
          timestamp: Date.now()
        });
      }

      // Mark setup as complete
      setSetupComplete(true);
      
      // Redirect to login
      router.push(ROUTES.LOGIN);
    } catch (error) {
      console.error('Setup failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">🏢</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Kiosk App
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Let&apos;s get started by setting up your organization
            </p>
          </div>

          {/* Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="organizationName" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Organization Name
              </label>
              <input
                type="text"
                id="organizationName"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Enter your organization name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !organizationName.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Setting up...
                </div>
              ) : (
                'Complete Setup'
              )}
            </button>
          </form>

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
