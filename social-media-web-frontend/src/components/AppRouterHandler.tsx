/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/AppRouterHandler.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRouterHistoryManager } from '@/utils/routerHistoryManager';

/**
 * Component to handle global router behavior, used in _app.tsx
 * This works in conjunction with the navigation system to ensure
 * proper back/forward behavior within tabs
 */
const AppRouterHandler = () => {
  const router = useRouter();
  
  // Initialize the router history manager
  useRouterHistoryManager();
  
  // Add any additional app-level navigation logic here
  
  // This component doesn't render anything
  return null;
};

export default AppRouterHandler;