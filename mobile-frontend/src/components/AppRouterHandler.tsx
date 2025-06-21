// src/components/AppRouterHandler.tsx
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useRouterHistoryManager } from '@/utils/routerHistoryManager';

/**
 * Component to handle global navigation behavior
 * This works in conjunction with the navigation system to ensure
 * proper back/forward behavior within tabs
 */
const AppRouterHandler = () => {
  const navigation = useNavigation();
  
  // Initialize the router history manager
  useRouterHistoryManager();
  
  // Add any additional app-level navigation logic here
  
  // This component doesn't render anything
  return null;
};

export default AppRouterHandler;