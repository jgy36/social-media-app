import Navbar from "@/components/navbar/Navbar";
import PoliticianList from "@/components/politicians/PoliticianList";
import { Card, CardContent } from "@/components/ui/card";

const Politicians = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ✅ Sticky Navbar */}
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Politicians</h1>

        {/* ✅ Wrap Politician List inside a Card */}
        <Card className="shadow-lg border border-border">
          <CardContent className="p-4">
            <PoliticianList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Politicians;
