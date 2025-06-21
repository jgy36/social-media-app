// src/components/debug/ConnectionDebugger.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { testApiConnection, API_BASE_URL, validateApiSetup } from '@/api/apiClient';
import { getToken } from '@/utils/tokenUtils';

export const ConnectionDebugger = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    const addResult = (message: string) => {
      setResults(prev => [...prev, message]);
    };

    try {
      // Test 1: Check API URL
      addResult(`🌐 API URL: ${API_BASE_URL}`);
      
      // Test 2: Check token
      const token = await getToken();
      addResult(`🔑 Token exists: ${!!token}`);
      if (token) {
        addResult(`   Token preview: ${token.substring(0, 20)}...`);
      }
      
      // Test 3: Test connection
      addResult('🧪 Testing API connection...');
      const connected = await testApiConnection();
      addResult(`   Connection: ${connected ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      // Test 4: Validate full setup
      addResult('🔍 Validating full setup...');
      const setupValid = await validateApiSetup();
      addResult(`   Setup valid: ${setupValid ? '✅ YES' : '❌ NO'}`);
      
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View className="bg-gray-100 p-4 m-4 rounded-lg">
      <Text className="text-lg font-bold mb-4">Connection Debugger</Text>
      
      <TouchableOpacity 
        onPress={runTests}
        disabled={testing}
        className={`bg-blue-500 p-3 rounded-md ${testing ? 'opacity-50' : ''}`}
      >
        {testing ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-medium">Run Connection Tests</Text>
        )}
      </TouchableOpacity>
      
      <ScrollView className="mt-4 max-h-60">
        {results.map((result, index) => (
          <Text key={index} className="text-sm mb-1 font-mono">{result}</Text>
        ))}
      </ScrollView>
    </View>
  );
};