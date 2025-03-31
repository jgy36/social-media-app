// src/pages/api/image-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  const token = req.cookies.jwt || req.headers.authorization?.replace('Bearer ', '');

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL parameter' });
  }

  try {
    console.log(`Image proxy: Fetching ${url}`);
    
    // Add an authorization header if we have a token
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add cache-busting headers
    headers['Cache-Control'] = 'no-cache';
    headers['Pragma'] = 'no-cache';
    
    // Fetch the image from the backend with proper headers
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: headers
    });

    // Determine content type
    let contentType = response.headers['content-type'] || 'image/jpeg';
    
    // Override based on extension if needed
    if (url.endsWith('.png')) contentType = 'image/png';
    if (url.endsWith('.jpg') || url.endsWith('.jpeg')) contentType = 'image/jpeg';
    if (url.endsWith('.gif')) contentType = 'image/gif';
    if (url.endsWith('.svg')) contentType = 'image/svg+xml';
    
    // Set appropriate headers for the response
    res.setHeader('Content-Type', contentType);
    
    // Set cache control headers to prevent browser caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Return the image data
    return res.status(200).send(response.data);
  } catch (error) {
    console.error('Error proxying image:', error);
    
    // Generic error handling without using axios.isAxiosError
    const errorObj = error as any; // Type assertion to access properties generically
    
    // Try to extract status and message from the error object
    const status = errorObj.response?.status || 500;
    const message = errorObj.response?.statusText || errorObj.message || 'Unknown error';
    
    console.error(`Proxy error ${status}: ${message}`);
    console.error('Request URL was:', url);
    
    // If we have response headers, log them for debugging
    if (errorObj.response?.headers) {
      console.error('Response headers:', errorObj.response.headers);
    }
    
    // Return an appropriate error response
    return res.status(status).json({ 
      error: `Failed to fetch image: ${message}`,
      status,
      url
    });
  }
}