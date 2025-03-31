// src/pages/api/image-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the image URL from the query parameter
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL parameter' });
  }

  try {
    console.log(`Image proxy: Fetching ${url}`);
    
    // Fetch the image from the backend
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    // Determine content type based on file extension or response headers
    let contentType = response.headers['content-type'] || 'image/jpeg'; // Default to JPEG if no content type
    
    // Override based on extension if needed
    if (url.endsWith('.png')) contentType = 'image/png';
    if (url.endsWith('.jpg') || url.endsWith('.jpeg')) contentType = 'image/jpeg';
    if (url.endsWith('.gif')) contentType = 'image/gif';
    if (url.endsWith('.svg')) contentType = 'image/svg+xml';
    
    console.log(`Image proxy: Serving image with content type ${contentType}`);

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for a day
    
    // Return the image data
    res.status(200).send(response.data);
  } catch (error) {
    console.error('Error proxying image:', error);
    
    // Return a fallback image or error
    res.status(404).json({ error: 'Failed to fetch image' });
  }
}