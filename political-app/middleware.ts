// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  if (url.pathname.startsWith('/uploads/')) {
    const backendUrl = new URL(url.pathname, 'http://localhost:8080');
    
    // Get JWT token from cookies if available
    const token = request.cookies.get('jwt')?.value;
    
    // Create headers with authorization if token exists
    const headers = new Headers(request.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Rewrite with headers
    return NextResponse.rewrite(backendUrl, {
      request: {
        headers
      }
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/uploads/:path*'],
};