import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { Politician } from "@/types/politician";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WikipediaImageFetcher } from "@/utils/wikipediaImageFetcher"; // Adjust path as needed

interface PoliticianCardProps {
  politician: Politician;
}

const PoliticianCard: React.FC<PoliticianCardProps> = ({ politician }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(politician.photoUrl);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  
  // Create image fetcher with useMemo to avoid recreating on each render
  const imageFetcher = useMemo(() => new WikipediaImageFetcher(), []);

  useEffect(() => {
    // Only fetch if no photoUrl exists and we haven't encountered an error
    if (!politician.photoUrl && !imageUrl && !imageError && !isLoading) {
      const fetchImage = async () => {
        setIsLoading(true);
        try {
          const url = await imageFetcher.fetchPoliticianImage(politician.name);
          if (url) {
            setImageUrl(url);
          }
        } catch (error) {
          console.error(`Error fetching image for ${politician.name}:`, error);
          setImageError(true);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchImage();
    }
  }, [politician.name, politician.photoUrl, imageUrl, imageError, isLoading, imageFetcher]);

  // Get party background style - subtle in both light and dark modes
  const getPartyBackground = (party: string) => {
    switch (party.toLowerCase()) {
      case 'republican party':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      case 'democrat':
      case 'democratic party':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      case 'independent':
        return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
      default:
        // Neutral gray for other parties, not blue
        return 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800';
    }
  };

  // Custom badge colors for parties
  const getPartyBadgeClass = (party: string) => {
    switch (party.toLowerCase()) {
      case 'republican party':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'democrat':
      case 'democratic party':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'independent':
        return 'bg-green-500 hover:bg-green-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  // Helper to get party color for loading spinner
  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'republican party':
        return 'border-red-500';
      case 'democrat':
      case 'democratic party':
        return 'border-blue-500';
      case 'independent':
        return 'border-green-500';
      default:
        return 'border-gray-500';
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(null);
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
            <div className={`rounded-full h-16 w-16 flex items-center justify-center border-2 border-t-transparent animate-spin ${getPartyColor(politician.party)}`}>
            </div>
          ) : imageUrl && !imageError ? (
            <div className="rounded-full h-16 w-16 overflow-hidden border border-muted">
              <Image
                src={imageUrl}
                alt={politician.name}
                width={64}
                height={64}
                className="object-cover"
                onError={handleImageError}
              />
            </div>
          ) : (
            <div className="rounded-full h-16 w-16 bg-muted flex items-center justify-center text-muted-foreground border border-muted">
              {politician.name.charAt(0)}
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