import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SupabaseTestComponent = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [authStatus, setAuthStatus] = useState('Testing...');

  const testConnection = async () => {
    try {
      setConnectionStatus('Testing connection...');
      
      // Test basic connection by trying to access auth
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setConnectionStatus(`❌ Connection failed: ${error.message}`);
      } else {
        setConnectionStatus('✅ Connection successful!');
        setAuthStatus(data.session ? '✅ User logged in' : '📝 No active session');
      }
    } catch (error) {
      setConnectionStatus(`❌ Connection error: ${error.message}`);
    }
  };

  const testSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
      });
      
      if (error) {
        console.log('Auth test result:', error.message);
      } else {
        console.log('Auth signup test successful:', data);
      }
    } catch (error) {
      console.log('Auth test error:', error);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>Testing connection to your Supabase instance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Connection Status:</strong>
          <p className="text-sm mt-1">{connectionStatus}</p>
        </div>
        <div>
          <strong>Auth Status:</strong>
          <p className="text-sm mt-1">{authStatus}</p>
        </div>
        <div className="space-y-2">
          <Button onClick={testConnection} className="w-full">
            Test Connection Again
          </Button>
          <Button onClick={testSignUp} variant="outline" className="w-full">
            Test Auth (Console)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseTestComponent;
