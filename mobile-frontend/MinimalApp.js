// MinimalApp.js
import React from 'react';
import { AppRegistry, View, Text, Button } from 'react-native';

function MinimalApp() {
  console.log('MinimalApp is rendering!');
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Minimal Test App</Text>
      <Text style={{ marginBottom: 20 }}>If you see this, basic React Native is working</Text>
      <Button 
        title="Test Button" 
        onPress={() => console.log('Button pressed!')} 
      />
    </View>
  );
}

// Register as the main component
AppRegistry.registerComponent('main', () => MinimalApp);

export default MinimalApp;