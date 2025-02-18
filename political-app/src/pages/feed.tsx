import { useState } from "react";
import PostList from "@/components/feed/PostList";
import Navbar from "@/components/navbar/Navbar"; // ✅ Navbar
import { Card } from "@/components/ui/card"; // ✅ shadcn Card
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // ✅ shadcn Tabs

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ✅ Sticky Navbar */}
      <Navbar />

      {/* ✅ Centered Feed Container */}
      <div className="max-w-2xl mx-auto p-4">
        {/* ✅ Shadcn UI Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "for-you" | "following")}>
          <TabsList className="w-full flex justify-center gap-6 bg-card p-2 rounded-xl shadow-md">
            <TabsTrigger value="for-you" className="text-lg">For You</TabsTrigger>
            <TabsTrigger value="following" className="text-lg">Following</TabsTrigger>
          </TabsList>

          {/* ✅ Posts Section in a Card */}
          <Card className="mt-4 shadow-lg border border-border">
            <TabsContent value="for-you">
              <PostList activeTab="for-you" />
            </TabsContent>
            <TabsContent value="following">
              <PostList activeTab="following" />
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default FeedPage;
