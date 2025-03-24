// src/utils/apiConfig.ts
import axios from 'axios';
import { getToken } from './tokenUtils';

// Base URLs
export const API_BASE_URL = "http://localhost:8080/api";
export const BASE_URL = "http://localhost:8080";

// Create a configurable axios instance with better defaults
export const createApiInstance = (options = {}) => {
  const defaultOptions = {
    baseURL: BASE_URL,
    timeout: 5000, // Reduced timeout from 10000 to 5000ms
    retries: 1,    // Number of retry attempts
    retryDelay: 1000 // Delay between retries in ms
  };

  const config = { ...defaultOptions, ...options };
  
  // Create the instance
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout
  });

  // Add request interceptor to automatically add token
  instance.interceptors.request.use(
    (reqConfig) => {
      const token = getToken();
      if (token) {
        reqConfig.headers = reqConfig.headers || {};
        reqConfig.headers["Authorization"] = `Bearer ${token}`;
      }
      return reqConfig;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor with retry logic for network errors
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Only retry GET requests that failed due to network issues
      if (
        error.code === 'ECONNABORTED' || 
        error.message.includes('timeout') ||
        (error.response && error.response.status >= 500) || 
        !error.response
      ) {
        // If we haven't retried yet
        if (!originalRequest._retry && originalRequest.method === 'get') {
          originalRequest._retry = true;
          
          try {
            console.log(`Retrying failed request to ${originalRequest.url}`);
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, config.retryDelay));
            
            return instance(originalRequest);
          } catch (retryError) {
            return Promise.reject(retryError);
          }
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Export a default configured instance
export const api = createApiInstance();

// Also export a more resilient instance for less critical operations
export const resilientApi = createApiInstance({
  timeout: 8000,
  retries: 2,
  retryDelay: 1500
});