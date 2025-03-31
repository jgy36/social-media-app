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
    
    // Fetch the image from the backend with authorization
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    // Determine content type
    let contentType = response.headers['content-type'] || 'image/jpeg';
    
    // Override based on extension if needed
    if (url.endsWith('.png')) contentType = 'image/png';
    if (url.endsWith('.jpg') || url.endsWith('.jpeg')) contentType = 'image/jpeg';
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    // Return the image data
    res.status(200).send(response.data);
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(404).json({ error: 'Failed to fetch image' });
  }
}