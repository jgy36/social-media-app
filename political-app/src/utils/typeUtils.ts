/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/typeUtils.ts
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
 * Safe navigation for routers - prevents TypeScript errors with router usage
 * @param router The Next.js router
 * @param url The URL to navigate to
 */
export function safeNavigate(router: any, url: string): void {
  if (router && typeof router.push === 'function') {
    router.push(url);
  } else {
    // Fallback if router is not available
    window.location.href = url;
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