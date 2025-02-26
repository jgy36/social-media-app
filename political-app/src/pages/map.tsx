import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import PoliticianList from "@/components/politicians/PoliticianList";
import { Politician } from "@/types/politician";
import { getAllRelevantPoliticians } from "@/utils/api";

// ✅ Dynamically Import ElectionMap to Disable SSR
const ElectionMap = dynamic(() => import("@/components/map/ElectionMap"), {
  ssr: false,
});

const MapPage = () => {
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCountySelected = async (county: string, state: string, fips: string) => {
    setSelectedCounty(county);
    setSelectedState(state);
    // We're storing fips but not using it yet - might be useful for future features
  };

  // Fetch politicians when county/state selection changes
  useEffect(() => {
    const fetchPoliticians = async () => {
      if (!selectedCounty || !selectedState) return;
      
      setIsLoading(true);
      try {
        const relevantPoliticians = await getAllRelevantPoliticians(selectedCounty, selectedState);
        setPoliticians(relevantPoliticians);
      } catch (error) {
        console.error("Error fetching politicians:", error);
        setPoliticians([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoliticians();
  }, [selectedCounty, selectedState]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ✅ Sticky Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Political Representatives by County</h1>

        {/* Two-column layout on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column - Takes 2/3 on large screens */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border border-border">
              <CardContent className="p-4">
                <div className="w-full h-[600px] rounded-lg overflow-hidden">
                  <ElectionMap onCountySelected={handleCountySelected} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Politicians Column - Takes 1/3 on large screens */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border border-border h-full">
              <CardContent className="p-4">
                <PoliticianList 
                  politicians={politicians}
                  selectedCounty={selectedCounty}
                  selectedState={selectedState}
                  isLoading={isLoading}
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