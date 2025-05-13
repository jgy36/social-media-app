// src/utils/wikipediaImageFetcher.ts - React Native version
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
   * @returns {Promise<string>} - URL of the politician's image or null if not found
   */
  async fetchPoliticianImage(politicianName: string): Promise<string | null> {
    // Check cache first
    if (this.cache.has(politicianName)) {
      return this.cache.get(politicianName) || null;
    }

    try {
      // First search for the page
      const pageData = await this.searchWikipedia(politicianName);
      if (!pageData) {
        return null;
      }

      // Then fetch image from the page
      const imageUrl = await this.getImageFromPage(pageData.title);
      
      // Cache the result
      this.cache.set(politicianName, imageUrl || "");
      
      return imageUrl;
    } catch (error) {
      console.error(`Error fetching image for ${politicianName}:`, error);
      return null;
    }
  }

  /**
   * Search Wikipedia for a politician's page
   * @param {string} query - The politician's name
   * @returns {Promise<{pageid: number, title: string}|null>} - Basic page data or null if not found
   */
  private async searchWikipedia(query: string): Promise<{pageid: number, title: string} | null> {
    try {
      const searchUrl = 'https://en.wikipedia.org/w/api.php';
      const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: `${query} politician`,
        format: 'json',
        origin: '*'
      });

      const response = await fetch(`${searchUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.query && data.query.search && data.query.search.length > 0) {
        return {
          pageid: data.query.search[0].pageid,
          title: data.query.search[0].title
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error searching Wikipedia:', error);
      return null;
    }
  }

  /**
   * Get image from a specific Wikipedia page
   * @param {string} title - Title of the Wikipedia page
   * @returns {Promise<string|null>} - URL of the image or null
   */
  private async getImageFromPage(title: string): Promise<string | null> {
    try {
      const pageUrl = 'https://en.wikipedia.org/w/api.php';
      const params = new URLSearchParams({
        action: 'query',
        titles: title,
        prop: 'pageimages',
        format: 'json',
        pithumbsize: '300',
        origin: '*'
      });

      const response = await fetch(`${pageUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.query && data.query.pages) {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pages[pageId] && pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
          return pages[pageId].thumbnail.source;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting image from page:', error);
      return null;
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

export { WikipediaImageFetcher };