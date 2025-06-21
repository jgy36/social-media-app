/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/community/CommunityTabs.tsx
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageCircle, Flame, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import Post from "@/components/feed/Post";
import { PostType } from "@/types/post";

interface CommunityTabsProps {
  posts: PostType[];
}

const CommunityTabs = ({ posts }: CommunityTabsProps) => {
  const [activeTab, setActiveTab] = useState("posts");
  const router = useRouter();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="posts">
          <MessageCircle className="h-4 w-4 mr-2" />
          Posts
        </TabsTrigger>
        <TabsTrigger value="hot">
          <Flame className="h-4 w-4 mr-2" />
          Hot
        </TabsTrigger>
        <TabsTrigger value="trending">
          <TrendingUp className="h-4 w-4 mr-2" />
          Trending
        </TabsTrigger>
      </TabsList>

      {/* Posts Tab Content */}
      <TabsContent value="posts">
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />}
            title="No posts yet"
            description="Be the first to post in this community!"
          />
        )}
      </TabsContent>

      {/* Hot Tab Content */}
      <TabsContent value="hot">
        {posts.length > 0 ? (
          <div className="space-y-4">
            {[...posts]
              .sort((a, b) => (b.likes || 0) - (a.likes || 0))
              .map((post) => (
                <Post key={post.id} post={post} />
              ))}
          </div>
        ) : (
          <EmptyState
            icon={<MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />}
            title="No posts yet"
            description="Be the first to post in this community!"
          />
        )}
      </TabsContent>

      {/* Trending Tab Content */}
      <TabsContent value="trending">
        {posts.length > 0 ? (
          <div className="space-y-4">
            {[...posts]
              .sort((a, b) => {
                // Handle undefined commentsCount with fallback to 0
                const aComments = a.commentsCount ?? 0;
                const bComments = b.commentsCount ?? 0;
                return bComments - aComments;
              })
              .map((post) => (
                <Post key={post.id} post={post} />
              ))}
          </div>
        ) : (
          <EmptyState
            icon={<MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />}
            title="No trending posts yet"
            description="Posts with the most comments will appear here."
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

// Helper component for empty states
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const EmptyState = ({ icon, title, description, buttonText, onButtonClick }: EmptyStateProps) => (
  <div className="text-center py-8 bg-muted/20 rounded-lg">
    {icon}
    <h3 className="text-lg font-medium mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">
      {description}
    </p>
    {buttonText && onButtonClick && (
      <Button className="mt-4" onClick={onButtonClick}>
        {buttonText}
      </Button>
    )}
  </div>
);

export default CommunityTabs;