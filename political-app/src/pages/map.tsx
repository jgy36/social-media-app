import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/navbar/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PoliticianList } from "@/components/politicians/PoliticianList";
import { Politician } from "@/types/politician";
import { getAllRelevantPoliticians } from "@/api/politicians";
import { AlertCircle } from "lucide-react";

// ✅ Dynamically Import ElectionMap to Disable SSR
const ElectionMap = dynamic(() => import("@/components/map/ElectionMap"), {
  ssr: false,
});

const MapPage = () => {
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch politicians data
  const fetchPoliticians = useCallback(async (county: string, state: string) => {
  if (!county || !state) return;

  setIsLoading(true);
  setError(null);

  try {
    console.log(`Fetching politicians for ${county}, ${state}`);
    const relevantPoliticians = await getAllRelevantPoliticians(county, state);
    setPoliticians(relevantPoliticians);
  } catch (err) {
    console.error("Error fetching politicians:", err);
    setError("Failed to load politicians data. Please try again later.");
    setPoliticians([]);
  } finally {
    setIsLoading(false);
  }
}, []);

  // County selection handler
  const handleCountySelected = useCallback((county: string, state: string) => {
    setSelectedCounty(county);
    setSelectedState(state);
  }, []);

  // Fetch politicians when county/state selection changes
  useEffect(() => {
    if (selectedCounty && selectedState) {
      fetchPoliticians(selectedCounty, selectedState);
    }
  }, [selectedCounty, selectedState, fetchPoliticians]);

  // Retry handler
  const handleRetry = useCallback(() => {
    if (selectedCounty && selectedState) {
      fetchPoliticians(selectedCounty, selectedState);
    }
  }, [selectedCounty, selectedState, fetchPoliticians]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ✅ Sticky Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Political Representatives by State and County
        </h1>

        {/* Network error alert */}
        {error && (
          <div className="mb-6 bg-destructive/10 text-destructive p-4 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Two-column layout on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column - Takes 2/3 on large screens */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border border-border">
              <CardContent className="p-4">
                <div className="w-full h-[600px] rounded-lg overflow-hidden">
                  <ElectionMap onCountySelected={handleCountySelected} />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Click on any county to view local and state representatives
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Politicians Column - Takes 1/3 on large screens */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm border border-border h-full">
              <CardContent className="p-4">
                <PoliticianList
                  politicians={politicians}
                  selectedCounty={selectedCounty}
                  selectedState={selectedState}
                  isLoading={isLoading}
                  error={error || undefined}
                  onRetry={handleRetry}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;