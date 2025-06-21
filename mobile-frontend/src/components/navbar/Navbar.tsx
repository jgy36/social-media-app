// src/components/navbar/Navbar.tsx (This would be used in the navigation header)
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';;
import { Button } from '@/components/ui/button';
import SearchComponent from '@/components/search/SearchComponent';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const Navbar = () => {
  const navigation = useNavigation();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <TouchableOpacity onPress={() => navigation.push('/')}>
        <Text className="text-xl font-bold">PoliticalApp</Text>
      </TouchableOpacity>
      
      <View className="flex-1 max-w-md mx-4">
        <SearchComponent />
      </View>
      
      <View className="flex-row items-center space-x-2">
        {isAuthenticated ? (
          <>
            <Button variant="ghost" onPress={() => navigation.navigate('feed')}>
              <Text>Feed</Text>
            </Button>
            <Button variant="ghost" onPress={() => navigation.navigate('profile')}>
              <Text>Profile</Text>
            </Button>
          </>
        ) : (
          <Button onPress={() => navigation.navigate('login')}>
            <Text>Login</Text>
          </Button>
        )}
      </View>
    </View>
  );
};

export default Navbar;
