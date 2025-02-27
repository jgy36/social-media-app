// Import the Politician interface
import { Politician } from '../types/politician';
import Image from 'next/image';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Wikipedia API Utility for fetching politician images
class WikipediaImageFetcher {
  private baseUrl: string;
  private cache: Map<string, string>;

  constructor() {
    this.baseUrl = 'https://en.wikipedia.org/api/rest_v1';
    this.cache = new Map<string, string>(); // Simple caching to avoid redundant requests
  }

  /**
   * Fetches a politician's image from Wikipedia based on their name
   * @param {string} politicianName - The name of the politician
   * @returns {Promise<string>} - URL of the politician's image or a placeholder
   */
  async fetchPoliticianImage(politicianName: string): Promise<string> {
    // Check cache first
    if (this.cache.has(politicianName)) {
      return this.cache.get(politicianName) || this.getPlaceholderImage();
    }

    try {
      // First search for the page
      const pageData = await this.searchWikipedia(politicianName);
      if (!pageData) {
        return this.getPlaceholderImage();
      }

      // Then fetch image from the page
      const imageUrl = await this.getImageFromPage(pageData.title);
      
      // Cache the result
      this.cache.set(politicianName, imageUrl || this.getPlaceholderImage());
      
      return this.cache.get(politicianName) || this.getPlaceholderImage();
    } catch (error) {
      console.error(`Error fetching image for ${politicianName}:`, error);
      return this.getPlaceholderImage();
    }
  }

  /**
   * Search Wikipedia for a politician's page
   * @param {string} query - The politician's name
   * @returns {Promise<{pageid: number, title: string}|null>} - Basic page data or null if not found
   */
  private async searchWikipedia(query: string): Promise<{pageid: number, title: string} | null> {
    const searchUrl = 'https://en.wikipedia.org/w/api.php';
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: `${query} politician`,
      format: 'json',
      origin: '*'
    });

    const response = await fetch(`${searchUrl}?${params}`);
    const data = await response.json();
    
    if (data.query.search.length > 0) {
      return {
        pageid: data.query.search[0].pageid,
        title: data.query.search[0].title
      };
    }
    
    return null;
  }

  /**
   * Get image from a specific Wikipedia page
   * @param {string} title - Title of the Wikipedia page
   * @returns {Promise<string|null>} - URL of the image or null
   */
  private async getImageFromPage(title: string): Promise<string | null> {
    const pageUrl = 'https://en.wikipedia.org/w/api.php';
    const params = new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'pageimages',
      format: 'json',
      pithumbsize: '300', // Convert to string to fix type error
      origin: '*'
    });

    const response = await fetch(`${pageUrl}?${params}`);
    const data = await response.json();
    
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
      return pages[pageId].thumbnail.source;
    }
    
    return null;
  }

  /**
   * Get a placeholder image when no Wikipedia image is available
   * @returns {string} - URL of a placeholder image
   */
  private getPlaceholderImage(): string {
    return 'https://via.placeholder.com/150?text=No+Image';
  }
}

// Politician Card Component
interface PoliticianCardProps {
  politician: Politician;
}

const PoliticianCard: React.FC<PoliticianCardProps> = ({ politician }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Create imageFetcher with useMemo to avoid recreating it on each render
  const imageFetcher = useMemo(() => new WikipediaImageFetcher(), []);
  
  // Use useCallback to memoize the fetchImage function
  const fetchImage = useCallback(async () => {
    // If politician already has a photoUrl, use that instead of fetching
    if (politician.photoUrl) {
      setImageUrl(politician.photoUrl);
      return;
    }
    
    const url = await imageFetcher.fetchPoliticianImage(politician.name);
    setImageUrl(url);
  }, [politician.name, politician.photoUrl, imageFetcher]);
  
  useEffect(() => {
    fetchImage();
  }, [fetchImage]);
  
  return (
    <div className="politician-card">
      <div className="politician-image">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={`${politician.name}`} 
            width={150} 
            height={150}
            priority={false}
          />
        ) : (
          <div className="loading-image">Loading...</div>
        )}
      </div>
      <div className="politician-info">
        <h3>{politician.name}</h3>
        <p>{politician.position} - {politician.party}</p>
        <p>{politician.state}{politician.county ? `, ${politician.county}` : ''}</p>
        <p>Years served: {politician.yearsServed}</p>
        <p>Term length: {politician.termLength} years</p>
      </div>
    </div>
  );
};

// Politician List Component
interface PoliticianListProps {
  politicians: Politician[];
}

const PoliticianList: React.FC<PoliticianListProps> = ({ politicians }) => {
  return (
    <div className="politician-list">
      {politicians.map(politician => (
        <PoliticianCard 
          key={politician.id} 
          politician={politician} 
        />
      ))}
    </div>
  );
};

export { WikipediaImageFetcher, PoliticianCard, PoliticianList };