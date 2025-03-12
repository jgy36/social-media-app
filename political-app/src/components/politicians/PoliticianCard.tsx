import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Politician } from "@/types/politician";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WikipediaImageFetcher } from "@/utils/wikipediaImageFetcher";

// Define your backend URL as a constant
const BACKEND_URL = "http://localhost:8080";

interface PoliticianCardProps {
  politician: Politician;
}

const PoliticianCard: React.FC<PoliticianCardProps> = ({ politician }) => {
  // Add detailed debugging for the politician object
  console.log(`Rendering PoliticianCard for: ${politician.name}`);
  console.log(`PhotoUrl value: "${politician.photoUrl}"`);
  console.log(`PhotoUrl type: ${typeof politician.photoUrl}`);
  console.log(`Full politician object:`, JSON.stringify(politician, null, 2));
  
  // Store the final image URL to display
  const [displayImageUrl, setDisplayImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useDefaultAvatar, setUseDefaultAvatar] = useState<boolean>(false);
  
  // Create image fetcher instance
  const imageFetcher = new WikipediaImageFetcher();

  useEffect(() => {
    // Reset state when politician changes
    setIsLoading(true);
    setUseDefaultAvatar(false);
    setDisplayImageUrl(null);
    
    // Function to load image
    const loadImage = async () => {
      try {
        // Extra debugging for photoUrl
        console.log(`Loading image for ${politician.name}`);
        console.log(`photoUrl: "${politician.photoUrl}"`);
        console.log(`photoUrl is truthy: ${Boolean(politician.photoUrl)}`);
        console.log(`photoUrl !== "N/A": ${politician.photoUrl !== "N/A"}`);
        console.log(`Combined check: ${Boolean(politician.photoUrl) && politician.photoUrl !== "N/A"}`);
        
        // First check if we have a backend image and if it's valid
        if (politician.photoUrl && politician.photoUrl !== "N/A" && politician.photoUrl !== "null") {
          // Generate full URL for backend images
          const backendImageUrl = politician.photoUrl.startsWith('/')
            ? `${BACKEND_URL}${politician.photoUrl}`
            : politician.photoUrl;
          
          console.log(`Using backend image for ${politician.name}: ${backendImageUrl}`);
          
          // Set the backend image URL directly without checking
          setDisplayImageUrl(backendImageUrl);
          setIsLoading(false);
          return;
        }
        
        // Only attempt to fetch from Wikipedia if no backend image is available
        console.log(`No valid backend image for ${politician.name}, trying Wikipedia`);
        const wikiImageUrl = await imageFetcher.fetchPoliticianImage(politician.name);
        
        if (wikiImageUrl) {
          console.log(`Found Wikipedia image for ${politician.name}`);
          setDisplayImageUrl(wikiImageUrl);
        } else {
          console.log(`No image found for ${politician.name}`);
          setUseDefaultAvatar(true);
        }
      } catch (error) {
        console.error(`Error loading image for ${politician.name}:`, error);
        setUseDefaultAvatar(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadImage();
  }, [politician]); // Only depend on the politician object itself

  // Handle image load error
  const handleImageError = () => {
    console.warn(`Image error for ${politician.name}, URL: ${displayImageUrl}`);
    setUseDefaultAvatar(true);
    setDisplayImageUrl(null);
  };

  // Get party background style
  const getPartyBackground = (party: string) => {
    const partyLower = (party || "").toLowerCase();
    if (partyLower.includes('republican')) {
      return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    } else if (partyLower.includes('democrat')) {
      return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
    } else if (partyLower.includes('independent')) {
      return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
    } else {
      return 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800';
    }
  };

  // Custom badge colors for parties
  const getPartyBadgeClass = (party: string) => {
    const partyLower = (party || "").toLowerCase();
    if (partyLower.includes('republican')) {
      return 'bg-red-500 hover:bg-red-600 text-white';
    } else if (partyLower.includes('democrat')) {
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    } else if (partyLower.includes('independent')) {
      return 'bg-green-500 hover:bg-green-600 text-white';
    } else {
      return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  // Get party color for avatar
  const getPartyColor = (party: string) => {
    const partyLower = (party || "").toLowerCase();
    if (partyLower.includes('republican')) {
      return 'border-red-500 bg-red-100 text-red-700';
    } else if (partyLower.includes('democrat')) {
      return 'border-blue-500 bg-blue-100 text-blue-700';
    } else if (partyLower.includes('independent')) {
      return 'border-green-500 bg-green-100 text-green-700';
    } else {
      return 'border-gray-500 bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md border ${getPartyBackground(politician.party)}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{politician.name}</CardTitle>
        <div className="text-sm text-muted-foreground">{politician.position}</div>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {isLoading ? (
            <div className={`rounded-full h-16 w-16 flex items-center justify-center border-2 border-t-transparent animate-spin ${getPartyColor(politician.party).split(' ')[0]}`}>
            </div>
          ) : displayImageUrl && !useDefaultAvatar ? (
            <div className="rounded-full h-16 w-16 overflow-hidden border border-muted relative">
              <img
                src={displayImageUrl}
                alt={politician.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          ) : (
            <div className={`rounded-full h-16 w-16 flex items-center justify-center font-bold border ${getPartyColor(politician.party)}`}>
              {politician.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <Badge className={cn("mb-1", getPartyBadgeClass(politician.party))}>
            {politician.party}
          </Badge>
          <div className="text-sm text-muted-foreground">
            {politician.county ? `${politician.county}, ${politician.state}` : politician.state}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {politician.yearsServed} {politician.yearsServed === 1 ? 'year' : 'years'} served
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoliticianCard;