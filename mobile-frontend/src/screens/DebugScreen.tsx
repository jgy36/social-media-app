// src/screens/DebugScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type DebugScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const DebugScreen = ({ navigation }: DebugScreenProps) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Debug Screen</Text>
      <Button 
        title="Go to Login" 
        onPress={() => navigation.navigate('Login')} 
      />
    </View>
  );
};

export default DebugScreen;