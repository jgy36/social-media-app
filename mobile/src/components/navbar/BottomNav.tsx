// src/components/navbar/BottomNav.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Home, Users, Map, User, MapPin } from 'react-native-vector-icons/Feather';

const BottomNav = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Function to determine if a section is active
  const isActive = (routeName: string) => route.name === routeName;

  const navItems = [
    { icon: Home, label: 'Feed', route: 'Feed' },
    { icon: Users, label: 'Community', route: 'Communities' },
    { icon: Map, label: 'Map', route: 'Map' },
    { icon: MapPin, label: 'Politicians', route: 'Politicians' },
    { icon: User, label: 'Profile', route: 'Profile' },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-row justify-around py-2">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const active = isActive(item.route);
        
        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            className="flex-1 items-center py-2"
          >
            <IconComponent 
              name={item.icon === Home ? 'home' : 
                    item.icon === Users ? 'users' : 
                    item.icon === Map ? 'map' : 
                    item.icon === MapPin ? 'map-pin' : 'user'} 
              size={24} 
              color={active ? '#3B82F6' : 'gray'} 
            />
            <Text 
              className={`text-xs mt-1 ${
                active ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;