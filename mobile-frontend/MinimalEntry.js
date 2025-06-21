// MinimalEntry.js (in project root)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';

function MinimalApp() {
  console.log('MINIMAL APP RENDERING - NO DEPENDENCIES');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>MINIMAL TEST</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

// Direct registration without any dependencies
registerRootComponent(MinimalApp);

// Add this to detect silent errors
const originalConsoleError = console.error;
console.error = function(...args) {
  // Log original error
  originalConsoleError(...args);
  
  // Try to display error on screen
  const errorMessage = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  alert(`ERROR DETECTED: ${errorMessage.substring(0, 200)}`);
};