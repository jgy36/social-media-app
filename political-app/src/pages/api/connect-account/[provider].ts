// pages/api/connect-account/[provider].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  const { provider } = req.query;
  
  // Extract the token from cookies or Authorization header
  const authHeader = req.headers.authorization;
  const token = req.cookies.jwt || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);
  
  if (!token) {
    res.redirect('/login?error=session_expired&returnTo=' + encodeURIComponent(`/settings?tab=account`));
    return;
  }
  
  // Make sure provider is a string
  const providerStr = Array.isArray(provider) ? provider[0] : provider;
  
  // Get the backend URL - note the corrected path without /api prefix
  const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
  
  try {
    // Create the authorization URL without the /api prefix
    const authUrl = `${backendUrl}/oauth2/authorization/${providerStr}`;
    
    // Forward the token to your backend
    // Option 1: Use a query parameter (not ideal for production)
    res.redirect(`${authUrl}?access_token=${token}`);
    
    // Option 2 (better): Make a direct request first to create a session
    /*
    await fetch(`${backendUrl}/oauth2/prepare-connect/${providerStr}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    res.redirect(authUrl);
    */
  } catch (error) {
    console.error('OAuth connection error:', error);
    res.redirect(`/settings?tab=account&error=${encodeURIComponent('Failed to connect account')}`);
  }
}