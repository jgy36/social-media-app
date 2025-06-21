// src/utils/typeUtils.ts - React Native version
import { NavigationProp } from '@react-navigation/native';

/**
 * Type assertion utilities to help avoid TypeScript errors
 */

/**
 * Safely access nested properties without TypeScript errors
 * @param obj The object to access properties from
 * @param path The path to the property (e.g. 'user.profile.name')
 * @param defaultValue Optional default value if the property doesn't exist
 */
export function get<T = any>(obj: any, path: string, defaultValue?: T): T {
  const travel = (regexp: RegExp, obj: any, path: string, value: any): any => {
    const key = path.split(regexp)[0];
    const remaining = path.slice(key.length);
    
    if (!obj || !Object.prototype.hasOwnProperty.call(obj, key)) {
      return value;
    }
    
    if (!remaining || remaining.length === 0) {
      return obj[key];
    }
    
    return travel(regexp, obj[key], remaining.slice(1), value);
  };

  return travel(/[.[\]]+/, obj, path, defaultValue);
}

/**
 * Check if an error has a response property (like Axios errors)
 * @param error Any error object
 */
export function isErrorWithResponse(error: any): error is { 
  response?: { 
    status?: number; 
    statusText?: string;
    data?: any;
  };
  message?: string;
} {
  return error && typeof error === 'object' && ('response' in error || 'message' in error);
}

/**
 * Safe type assertion - avoids "as" casting that can cause TypeScript errors
 * @param value Value to check
 * @param check Optional check function
 */
export function typeSafe<T>(value: any, check?: (value: any) => boolean): T | null {
  if (check ? check(value) : value !== undefined && value !== null) {
    return value as T;
  }
  return null;
}

/**
 * Safe navigation for React Navigation - prevents TypeScript errors
 * @param navigation The React Navigation object
 * @param screenName The screen name to navigate to
 * @param params Optional parameters
 */
export function safeNavigate(navigation: NavigationProp<any>, screenName: string, params?: any): void {
  if (navigation && typeof navigation.navigate === 'function') {
    try {
      // Use type assertion that works better with React Navigation typing
      const nav = navigation as any;
      if (params) {
        nav.navigate(screenName, params);
      } else {
        nav.navigate(screenName);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  } else {
    console.error('Navigation object is not available');
  }
}

/**
 * Alternative safe navigation that uses the navigation object as-is
 * @param navigation The React Navigation object
 * @param screenName The screen name to navigate to
 * @param params Optional parameters
 */
export function safeNavigateWithParams(
  navigation: NavigationProp<any>, 
  screenName: string, 
  params?: Record<string, any>
): void {
  if (navigation && typeof navigation.navigate === 'function') {
    try {
      // This approach avoids the typing issues by using reset or dispatch
      if (params) {
        (navigation as any).navigate(screenName, params);
      } else {
        (navigation as any).navigate(screenName);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      
      // Fallback: try using navigation.push if available (Expo Router)
      try {
        const { router } = require('expo-router');
        if (params) {
          navigation.push({ pathname: screenName, params });
        } else {
          navigation.push(screenName);
        }
      } catch (routerError) {
        console.error('Router fallback failed:', routerError);
      }
    }
  } else {
    console.error('Navigation object is not available');
  }
}

/**
 * Creates a safe version of a function that won't throw TypeScript errors
 * @param fn The function to make safe
 * @param fallback Optional fallback return value if fn fails
 */
export function safeFn<T extends (...args: any[]) => any>(
  fn: T,
  fallback?: ReturnType<T>
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args);
    } catch (error) {
      console.error('Function error:', error);
      return fallback as ReturnType<T>;
    }
  };
}

/**
 * Type guard to check if an object is a valid screen params object
 */
export function isValidScreenParams(obj: any): obj is Record<string, any> {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}

/**
 * Safe wrapper for AsyncStorage operations
 */
export function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  return operation().catch((error) => {
    console.error('Async operation error:', error);
    return fallback;
  });
}

/**
 * Type-safe navigation helper for Expo Router
 * @param path The path to navigate to
 * @param params Optional parameters
 */
export function safeRouterPush(path: string, params?: Record<string, any>): void {
  try {
    const { router } = require('expo-router');
    if (params) {
      navigation.push({ pathname: path, params });
    } else {
      navigation.push(path);
    }
  } catch (error) {
    console.error('Router navigation error:', error);
  }
}
