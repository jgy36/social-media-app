/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/global.d.ts
/**
 * Global type definitions to fix common TypeScript errors
 * Place this file in your src/types folder
 */

import { NextRouter } from 'next/router';

// Extend the Window interface
declare global {
  // Add types for the fs module used in artifacts
  interface Window {
    fs: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<Uint8Array | string>;
    };

    // Add any other global properties your app might use
    dispatchEvent(event: Event): boolean;
  }

  // Helper type for safely accessing nested properties
  type ObjectWithAnyProps = Record<string, any>;

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
    // Add optional response property for Axios-like errors
    response?: {
      status?: number;
      statusText?: string;
      data?: any;
    };
    // Add any other common error properties your app uses
    code?: string;
    isAxiosError?: boolean;
    config?: any;
  }
}

// Extend React Router types
declare module 'next/router' {
  interface NextRouter {
    // Add any missing methods you use
    beforePopState(cb: (state: any) => boolean): void;
  }
}

// Safe navigation utility types
export type SafeNavigate = (router: NextRouter, url: string) => void;

// Additional helpful utility types
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type Dict<T = any> = Record<string, T>;

export {};