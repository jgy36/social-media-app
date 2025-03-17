import Navbar from "@/components/navbar/Navbar";
import CommunityList from "@/components/community/CommunityList";
import LearnSection from "@/components/community/LearnSection";
import SearchComponent from "@/components/search/SearchComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, UsersIcon, BookOpenIcon, TrendingUpIcon } from "lucide-react";

const Community = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ✅ Sticky Navbar */}
      <Navbar />

      {/* ✅ Centered Community Section with Search */}
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex flex-col space-y-6">
          {/* Search Section */}
          <Card className="shadow-md border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl">
                <Flame className="h-5 w-5 mr-2 text-primary" />
                Discover Communities, Users, and Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchComponent />
            </CardContent>
          </Card>

          {/* ✅ Shadcn UI Tabs */}
          <Tabs defaultValue="community">
            <TabsList className="flex justify-center w-full bg-card p-2 rounded-xl shadow-md">
              <TabsTrigger value="community" className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-2" />
                Communities
              </TabsTrigger>
              <TabsTrigger value="learn" className="flex items-center">
                <BookOpenIcon className="h-4 w-4 mr-2" />
                Learn
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center">
                <TrendingUpIcon className="h-4 w-4 mr-2" />
                Trending
              </TabsTrigger>
            </TabsList>

            {/* ✅ Community List Section */}
            <TabsContent value="community">
              <Card className="mt-4 shadow-md border border-border">
                <CardHeader>
                  <CardTitle>Popular Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <CommunityList />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ✅ Learn Section */}
            <TabsContent value="learn">
              <Card className="mt-4 shadow-md border border-border">
                <CardHeader>
                  <CardTitle>Educational Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <LearnSection />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ✅ New Trending Section */}
            <TabsContent value="trending">
              <Card className="mt-4 shadow-md border border-border">
                <CardHeader>
                  <CardTitle>Trending Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-3">
                      {/* Trending Hashtags */}
                      {[
                        "#Election2024",
                        "#Policy",
                        "#Debate",
                        "#Democracy",
                        "#VoterRights",
                      ].map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 mr-2 text-primary" />
                            <span className="font-medium">{tag}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.floor(Math.random() * 1000) + 100} posts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Import missing component
import { Hash } from "lucide-react";

export default Community;
