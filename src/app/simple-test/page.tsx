/**
 * Simple API test page to debug issues
 */
'use client';

import { useState } from 'react';

export default function SimpleTestPage() {
  const [message, setMessage] = useState('Page loaded successfully');

  const handleClick = () => {
    setMessage('Button clicked!');
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Simple Test Page</h1>
        
        <div className="bg-card p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-muted-foreground mb-4">{message}</p>
          <button
            onClick={handleClick}
            className="bg-company-primary hover:bg-company-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}
