// SimpleApp.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SimpleApp() {
  console.log('SimpleApp rendering');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Basic App Test</Text>
      <Text>If you see this, basic rendering is working</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  }
});