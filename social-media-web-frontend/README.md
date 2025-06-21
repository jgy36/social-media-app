This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# API Structure

This document outlines the organization and usage of the API layer in our application.

## Overview

Our API layer is organized into domain-specific modules that handle different parts of the application:

- `auth.ts` - Authentication-related API calls
- `posts.ts` - Post-related API calls
- `communities.ts` - Community-related API calls
- `users.ts` - User-related API calls
- `politicians.ts` - Politician-related API calls
- `search.ts` - Search and hashtag-related API calls

All API modules are exported through `src/api/index.ts` which provides a unified interface for importing and using API functions.

## Usage Examples

### Basic Usage

```typescript
import api from "@/api";

// Use an API function
const fetchPosts = async () => {
  try {
    const posts = await api.posts.getPosts("/posts/for-you");
    console.log(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};
```

### With Custom Hooks

We provide custom hooks for common API operations:

```typescript
import { useCreatePost, useGetCommunities } from "@/hooks/useApi";

const MyComponent = () => {
  const { loading, error, execute: createPost } = useCreatePost();
  const { data: communities, loading: loadingCommunities } =
    useGetCommunities();

  const handleSubmit = async (content) => {
    await createPost({ content });
  };

  // Rest of component
};
```

## API Client

The API client is configured in `src/api/client.ts` and provides:

- Automatic token management
- Token refresh on 401 errors
- Error handling
- Request/response interceptors

## Types

All API types are defined in `src/api/types.ts` and are shared across the application.

## Best Practices

1. **Use domain-specific modules**: Import only what you need from the specific module.
2. **Use the custom hooks**: They provide loading and error states for free.
3. **Handle errors appropriately**: All API functions include proper error handling.
4. **Use TypeScript**: All API functions are fully typed.

## Migration

When migrating from the old API structure:

1. Replace imports from `@/utils/api` with imports from `@/api`
2. Consider using the custom hooks from `@/hooks/useApi`
3. Update function names if they've changed (refer to the API modules)
