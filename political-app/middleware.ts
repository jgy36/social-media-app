// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware will proxy requests for uploaded files to the backend
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // Check if the request is for an uploaded file
  if (url.pathname.startsWith('/uploads/')) {
    // Create the backend URL
    const backendUrl = new URL(url.pathname, 'http://localhost:8080');
    console.log(`Proxying request from ${url.pathname} to ${backendUrl.toString()}`);
    
    // Rewrite the request to the backend URL
    return NextResponse.rewrite(backendUrl);
  }
  
  return NextResponse.next();
}

// Configure which paths should use this middleware
export const config = {
  matcher: ['/uploads/:path*'],
};