/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/global.d.ts
/**
 * Global type definitions for React Native
 * Place this file in your src/types folder
 */

// Extend the global namespace
declare global {
  // Utility function for type assertions
  function isErrorWithResponse(error: any): error is { 
    response?: { 
      status?: number; 
      statusText?: string;
      data?: any;
    };
    message?: string;
  };

  // Augment the Error interface to allow for custom properties
  interface Error {
    // Add optional response property for HTTP errors
    response?: {
      status?: number;
      statusText?: string;
      data?: any;
    };
    // Add any other common error properties your app uses
    code?: string;
    isNetworkError?: boolean;
    config?: any;
  }
}

// Additional helpful utility types
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type Dict<T = any> = Record<string, T>;

// Navigation types for React Native
export interface NavigationProps {
  navigation: {
    navigate: (routeName: string, params?: any) => void;
    goBack: () => void;
    push: (routeName: string, params?: any) => void;
    replace: (routeName: string, params?: any) => void;
    reset: (config: any) => void;
    setParams: (params: any) => void;
    isFocused: () => boolean;
    canGoBack: () => boolean;
  };
  route: {
    key: string;
    name: string;
    params?: any;
  };
}

// Device info types
export interface DeviceInfo {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  isTablet: boolean;
  statusBarHeight: number;
}

// Storage types for React Native
export interface Storage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  getAllKeys: () => Promise<string[]>;
}

export {};