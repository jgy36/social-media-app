// src/pages/feed.tsx
import { useState } from "react";
import PostList from "@/components/feed/PostList";
import PostForm from "@/components/feed/PostForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PenSquare } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";

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
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-2xl mx-auto relative">
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

          {/* Shadcn UI Tabs - Redesigned with cleaner appearance */}
          <div className="bg-background dark:bg-background rounded-xl py-2 px-4 mb-6 shadow-md">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "for-you" | "following")}
              className="w-full"
            >
              <TabsList className="w-full flex justify-center gap-6 bg-card/50 backdrop-blur p-1 rounded-xl mb-4">
                <TabsTrigger value="for-you" className="text-lg py-2 px-6 flex-1">For You</TabsTrigger>
                <TabsTrigger value="following" className="text-lg py-2 px-6 flex-1">Following</TabsTrigger>
              </TabsList>

              {/* Make sure TabsContent is inside the Tabs component */}
              <TabsContent value="for-you" className="mt-2 space-y-5">
                <PostList activeTab="for-you" key={`for-you-${refreshTrigger}`} />
              </TabsContent>
              
              <TabsContent value="following" className="mt-2 space-y-5">
                <PostList activeTab="following" key={`following-${refreshTrigger}`} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default FeedPage;