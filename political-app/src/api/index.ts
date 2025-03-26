// src/api/index.ts
// Export the API client
export * from './apiClient';

// Export all API modules
import * as auth from './auth';
import * as posts from './posts';
import * as communities from './communities';
import * as users from './users';
import * as politicians from './politicians';
import * as search from './search';

// Export individual modules
export { auth, posts, communities, users, politicians, search };

// Export types
export * from './types';

// Create a unified API object
const api = {
  auth,
  posts,
  communities,
  users,
  politicians,
  search
};

export default api;