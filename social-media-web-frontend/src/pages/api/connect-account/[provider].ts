// pages/api/connect-account/[provider].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  const { provider } = req.query;
  
  // Extract the token from cookies
  const token = req.cookies.jwt;
  
  if (!token) {
    res.redirect('/login?error=session_expired&returnTo=' + encodeURIComponent(`/settings?tab=account`));
    return;
  }
  
  // Make sure provider is a string
  const providerStr = Array.isArray(provider) ? provider[0] : provider;
  
  // Get the backend URL
  const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
  
  try {
    // Set a cookie indicating this is a connect request - this is crucial
    res.setHeader('Set-Cookie', [
      // 5-minute connect intent cookie
      `connect_intent=true; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`,
      // Token cookie for the backend to identify the user
      `connect_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`
    ]);
    
    // Redirect directly to the OAuth URL
    const authUrl = `${backendUrl}/oauth2/authorization/${providerStr}`;
    res.redirect(authUrl);
  } catch (error) {
    console.error('OAuth connection error:', error);
    res.redirect(`/settings?tab=account&error=${encodeURIComponent('Failed to connect account')}`);
  }
}