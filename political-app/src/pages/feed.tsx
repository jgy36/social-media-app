import { useState } from "react";
import PostList from "@/components/feed/PostList";
import Navbar from "@/components/navbar/Navbar";
import PostForm from "@/components/feed/PostForm";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PenSquare } from "lucide-react";

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to handle post creation and refresh feed
  const handlePostCreated = () => {
    setIsPostFormOpen(false);
    // Increment refresh trigger to reload posts
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Centered Feed Container */}
      <div className="max-w-2xl mx-auto p-4 relative">
        {/* Add Post Button - Fixed at the bottom right */}
        <Button 
          onClick={() => setIsPostFormOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-10 flex items-center justify-center"
        >
          <PenSquare className="w-6 h-6" />
        </Button>

        {/* Post Form Dialog */}
        <Dialog open={isPostFormOpen} onOpenChange={setIsPostFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a new post</DialogTitle>
            </DialogHeader>
            <PostForm onPostCreated={handlePostCreated} />
          </DialogContent>
        </Dialog>

        {/* Shadcn UI Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "for-you" | "following")}>
          <TabsList className="w-full flex justify-center gap-6 bg-card p-2 rounded-xl shadow-md">
            <TabsTrigger value="for-you" className="text-lg">For You</TabsTrigger>
            <TabsTrigger value="following" className="text-lg">Following</TabsTrigger>
          </TabsList>

          {/* Posts Section in a Card */}
          <Card className="mt-4 shadow-lg border border-border">
            <TabsContent value="for-you">
              <PostList activeTab="for-you" key={`for-you-${refreshTrigger}`} />
            </TabsContent>
            <TabsContent value="following">
              <PostList activeTab="following" key={`following-${refreshTrigger}`} />
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default FeedPage;