// pages/search.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import SearchComponent from "@/components/search/SearchComponent";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Hash, FileText, SearchIcon } from "lucide-react";

// Define types for search results
interface SearchResult {
  id: string | number;
  type: "user" | "community" | "hashtag" | "post";
  name: string;
  description?: string;
  content?: string;
  author?: string;
}

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (q && typeof q === "string") {
      setSearchQuery(q);
      performSearch(q);
    } else {
      setLoading(false);
    }
  }, [q]);

  const performSearch = (query: string) => {
    setLoading(true);

    // Mock search function - in a real app, this would be an API call
    setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      const lowercaseQuery = query.toLowerCase();

      // Mock data for demonstration
      const users = [
        {
          id: 1,
          type: "user",
          name: "JaneDoe",
          description: "Political Analyst",
        },
        {
          id: 2,
          type: "user",
          name: "JohnSmith",
          description: "Community Organizer",
        },
        {
          id: 3,
          type: "user",
          name: "PoliticsExpert",
          description: "Congressional Staffer",
        },
      ];

      const communities = [
        {
          id: "dem",
          type: "community",
          name: "Democrat",
          description: "Democratic Party discussions",
        },
        {
          id: "rep",
          type: "community",
          name: "Republican",
          description: "Republican Party discussions",
        },
        {
          id: "lib",
          type: "community",
          name: "Libertarian",
          description: "Libertarian Party discussions",
        },
        {
          id: "ind",
          type: "community",
          name: "Independent",
          description: "Independent voter discussions",
        },
        {
          id: "con",
          type: "community",
          name: "Conservative",
          description: "Conservative viewpoints",
        },
        {
          id: "soc",
          type: "community",
          name: "Socialist",
          description: "Socialist perspectives",
        },
      ];

      const hashtags = [
        {
          id: "election2024",
          type: "hashtag",
          name: "#Election2024",
          description: "Election 2024 updates",
        },
        {
          id: "policy",
          type: "hashtag",
          name: "#Policy",
          description: "Policy discussions",
        },
        {
          id: "debate",
          type: "hashtag",
          name: "#Debate",
          description: "Political debate highlights",
        },
      ];

      const posts = [
        {
          id: 101,
          type: "post",
          name: "Election Results",
          content: "Discussing the latest election results #Election2024",
          author: "JaneDoe",
        },
        {
          id: 102,
          type: "post",
          name: "Policy Reforms",
          content: "What do you think about the new policy reforms? #Policy",
          author: "JohnSmith",
        },
        {
          id: 103,
          type: "post",
          name: "Debate Highlights",
          content: "Key moments from last night's debate #Debate",
          author: "PoliticsExpert",
        },
      ];

      // Filter based on query
      const filteredUsers = users.filter(
        (user) =>
          user.name.toLowerCase().includes(lowercaseQuery) ||
          user.description.toLowerCase().includes(lowercaseQuery)
      );

      const filteredCommunities = communities.filter(
        (community) =>
          community.name.toLowerCase().includes(lowercaseQuery) ||
          community.description.toLowerCase().includes(lowercaseQuery)
      );

      const filteredHashtags = hashtags.filter(
        (hashtag) =>
          hashtag.name.toLowerCase().includes(lowercaseQuery) ||
          hashtag.description.toLowerCase().includes(lowercaseQuery)
      );

      const filteredPosts = posts.filter(
        (post) =>
          post.name.toLowerCase().includes(lowercaseQuery) ||
          post.content.toLowerCase().includes(lowercaseQuery)
      );

      // Combine results
      const allResults = [
        ...filteredUsers,
        ...filteredCommunities,
        ...filteredHashtags,
        ...filteredPosts,
      ] as SearchResult[];

      setResults(allResults);
      setLoading(false);
    }, 800);
  };

  const getFilteredResults = () => {
    if (activeTab === "all") {
      return results;
    }
    return results.filter((result) => result.type === activeTab);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-3xl mx-auto p-6">
        <Card className="mb-6 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <SearchIcon className="h-5 w-5 mr-2 text-primary" />
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SearchComponent />

            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing results for:{" "}
                <span className="font-medium">{searchQuery}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {results.length > 0 ? (
              <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger
                      value="all"
                      className="flex items-center justify-center"
                    >
                      <SearchIcon className="h-4 w-4 mr-2" />
                      All ({results.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="user"
                      className="flex items-center justify-center"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Users ({results.filter((r) => r.type === "user").length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="community"
                      className="flex items-center justify-center"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Communities (
                      {results.filter((r) => r.type === "community").length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="hashtag"
                      className="flex items-center justify-center"
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      Hashtags (
                      {results.filter((r) => r.type === "hashtag").length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="post"
                      className="flex items-center justify-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Posts ({results.filter((r) => r.type === "post").length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    <div className="space-y-4">
                      {getFilteredResults().map((result) => (
                        <ResultCard
                          key={`${result.type}-${result.id}`}
                          result={result}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="user" className="mt-4">
                    <div className="space-y-4">
                      {getFilteredResults().map((result) => (
                        <ResultCard
                          key={`${result.type}-${result.id}`}
                          result={result}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="community" className="mt-4">
                    <div className="space-y-4">
                      {getFilteredResults().map((result) => (
                        <ResultCard
                          key={`${result.type}-${result.id}`}
                          result={result}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="hashtag" className="mt-4">
                    <div className="space-y-4">
                      {getFilteredResults().map((result) => (
                        <ResultCard
                          key={`${result.type}-${result.id}`}
                          result={result}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="post" className="mt-4">
                    <div className="space-y-4">
                      {getFilteredResults().map((result) => (
                        <ResultCard
                          key={`${result.type}-${result.id}`}
                          result={result}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center p-8 bg-muted/30 rounded-lg">
                <SearchIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? `We couldn't find any results for "${searchQuery}". Try a different search term.`
                    : "Enter a search term to find users, communities, hashtags, and posts."}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

// Result Card Component
const ResultCard = ({ result }: { result: SearchResult }) => {
  const router = useRouter();

  const handleClick = () => {
    switch (result.type) {
      case "user":
        router.push(`/profile/${result.id}`);
        break;
      case "community":
        router.push(`/community/${result.id}`);
        break;
      case "hashtag":
        router.push(`/hashtag/${result.id}`);
        break;
      case "post":
        router.push(`/post/${result.id}`);
        break;
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            {result.type === "user" && (
              <User className="h-5 w-5 text-blue-500" />
            )}
            {result.type === "community" && (
              <Users className="h-5 w-5 text-green-500" />
            )}
            {result.type === "hashtag" && (
              <Hash className="h-5 w-5 text-purple-500" />
            )}
            {result.type === "post" && (
              <FileText className="h-5 w-5 text-orange-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">
              {result.name}
              {result.type === "post" && result.author && (
                <span className="font-normal text-sm text-muted-foreground ml-2">
                  by {result.author}
                </span>
              )}
            </h3>
            {result.description && (
              <p className="text-sm text-muted-foreground">
                {result.description}
              </p>
            )}
            {result.content && <p className="text-sm mt-1">{result.content}</p>}
            <div className="mt-2 text-xs font-medium text-muted-foreground uppercase">
              {result.type}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchPage;
