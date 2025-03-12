// src/utils/tokenUtils.ts

// Store token in localStorage
export const setToken = (token: string) => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Get token from localStorage
export const getToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// Remove token from localStorage
export const removeToken = () => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Check if token exists
export const hasToken = (): boolean => {
  return !!getToken();
};