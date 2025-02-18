import Navbar from "@/components/navbar/Navbar";
import CommunityList from "@/components/community/CommunityList";
import LearnSection from "@/components/community/LearnSection";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Community = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ✅ Sticky Navbar */}
      <Navbar />

      {/* ✅ Centered Community Section */}
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Community</h1>

        {/* ✅ Shadcn UI Tabs */}
        <Tabs defaultValue="community">
          <TabsList className="flex justify-center w-full bg-card p-2 rounded-xl shadow-md">
            <TabsTrigger value="community">Community List</TabsTrigger>
            <TabsTrigger value="learn">Learn Section</TabsTrigger>
          </TabsList>

          {/* ✅ Community List Section */}
          <TabsContent value="community">
            <Card className="mt-4 shadow-md border border-border">
              <CardContent>
                <CommunityList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ Learn Section */}
          <TabsContent value="learn">
            <Card className="mt-4 shadow-md border border-border">
              <CardContent>
                <LearnSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
