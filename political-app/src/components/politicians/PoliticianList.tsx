import React from 'react';
import PoliticianCard from './PoliticianCard';
import { Politician } from '@/types/politician';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PoliticianListProps {
  politicians: Politician[];
  selectedCounty: string;
  selectedState: string;
  isLoading: boolean;
  error?: string; // Add optional error prop
  onRetry?: () => void; // Add optional retry handler
}

export const PoliticianList: React.FC<PoliticianListProps> = ({
  politicians,
  selectedCounty,
  selectedState,
  isLoading,
  error,
  onRetry
}) => {
  // Group politicians by level (county and state)
  const countyPoliticians = politicians.filter(p => p.county === `${selectedCounty} County` || p.county === selectedCounty);
  const statePoliticians = politicians.filter(p => !p.county);

  // If there's an error, show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-destructive mb-4"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-destructive font-medium mb-2">Error loading politicians</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading politicians...</p>
      </div>
    );
  }

  if (!selectedCounty) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-muted-foreground mb-4"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
        <p className="text-muted-foreground">Select a county on the map to view politicians</p>
      </div>
    );
  }

  if (politicians.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-muted-foreground mb-4"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
        <p className="text-muted-foreground">No politicians found for {selectedCounty}, {selectedState}</p>
      </div>
    );
  }

  return (
    <div className="p-1">
      <h2 className="text-xl font-bold mb-4">
        Politicians for <span className="text-primary">{selectedCounty}, {selectedState}</span>
      </h2>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="county">County</TabsTrigger>
          <TabsTrigger value="state">State</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 gap-4">
              {countyPoliticians.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-muted-foreground">COUNTY OFFICIALS</h3>
                  {countyPoliticians.map((politician) => (
                    <PoliticianCard key={politician.id} politician={politician} />
                  ))}
                  
                  {statePoliticians.length > 0 && <Separator className="my-2" />}
                </>
              )}
              
              {statePoliticians.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-muted-foreground">STATE OFFICIALS</h3>
                  {statePoliticians.map((politician) => (
                    <PoliticianCard key={politician.id} politician={politician} />
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="county" className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            {countyPoliticians.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {countyPoliticians.map((politician) => (
                  <PoliticianCard key={politician.id} politician={politician} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-muted-foreground">No county officials found</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="state" className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            {statePoliticians.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {statePoliticians.map((politician) => (
                  <PoliticianCard key={politician.id} politician={politician} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-muted-foreground">No state officials found</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};