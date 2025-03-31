import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

// A custom storage implementation that works in both server and client environments
const createNoopStorage = () => {
  return {
    getItem: (_key: string) => Promise.resolve(null),
    setItem: (_key: string, value: any) => Promise.resolve(value),
    removeItem: (_key: string) => Promise.resolve()
  };
};

// Use actual localStorage if in the browser, or use the noop implementation for SSR
const storage = typeof window !== 'undefined' 
  ? createWebStorage('local') 
  : createNoopStorage();

export default storage;