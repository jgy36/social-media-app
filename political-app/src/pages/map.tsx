import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar"; // ✅ Navbar
import { Card, CardContent } from "@/components/ui/card"; // ✅ shadcn Card

// ✅ Dynamically Import ElectionMap to Disable SSR
const ElectionMap = dynamic(() => import("@/components/map/ElectionMap"), {
  ssr: false,
});

const MapPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ✅ Sticky Navbar */}
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Election Map</h1>

        {/* ✅ Wrap Map Inside a Card */}
        <Card className="shadow-lg border border-border">
          <CardContent className="p-4">
            <div className="w-full h-[600px] rounded-lg overflow-hidden">
              <ElectionMap />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapPage;
