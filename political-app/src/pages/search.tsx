// pages/search.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import SearchComponent from "@/components/search/SearchComponent";
import SearchResultsHandler, { SearchResult } from "@/components/search/SearchResultsHandler";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUnifiedSearchResults } from "@/utils/api";
import { User, Users, Hash, FileText, SearchIcon } from "lucide-react";

const SearchPage = () => {
  const router = useRouter();
  const { q, type } = router.query;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Set active tab based on type parameter
    if (type && typeof type === "string") {
      setActiveTab(type);
    } else {
      setActiveTab("all");
    }
  }, [type]);

  useEffect(() => {
    if (q && typeof q === "string") {
      setSearchQuery(q);
      performSearch(q, type as string | undefined);
    } else {
      setLoading(false);
      setResults([]);
    }
  }, [q, type]);

  const performSearch = async (query: string, typeFilter?: string) => {
    setLoading(true);

    try {
      // Convert type parameter to proper type for API call
      let apiType: 'user' | 'community' | 'hashtag' | undefined;
      
      if (typeFilter === "user" || typeFilter === "community" || typeFilter === "hashtag") {
        apiType = typeFilter;
      }

      // Get results from API
      const searchResults = await getUnifiedSearchResults(query, apiType);
      
      // Transform results to match the SearchResult interface
      const transformedResults: SearchResult[] = searchResults.map(result => {
        // Base properties common to all result types
        const baseResult: SearchResult = {
          id: result.id || result.username || result.tag,
          type: result.type,
          name: result.name || result.username || result.tag,
        };

        // Add type-specific properties
        switch (result.type) {
          case 'user':
            return {
              ...baseResult,
              description: result.bio || `@${result.username || baseResult.name}`,
              followers: result.followersCount || 0,
            };
            
          case 'community':
            return {
              ...baseResult,
              description: result.description,
              members: result.members || 0,
            };
            
          case 'hashtag':
            const tagName = result.tag || result.name;
            return {
              ...baseResult,
              name: tagName?.startsWith('#') ? tagName : `#${tagName}`,
              description: `${result.count || result.postCount || 0} posts with this hashtag`,
              postCount: result.count || result.postCount || 0,
            };
            
          case 'post':
            return {
              ...baseResult,
              content: result.content,
              author: result.author || result.username,
              timestamp: new Date(result.createdAt).toLocaleDateString(),
            };
            
          default:
            return baseResult;
        }
      });

      setResults(transformedResults);
    } catch (error) {
      console.error("Error performing search:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResults = () => {
    if (activeTab === "all") {
      return results;
    }
    return results.filter((result) => result.type === activeTab);
  };

  const getResultsCount = (type: string) => {
    return results.filter((r) => r.type === type).length;
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
                <Tabs 
                  value={activeTab} 
                  onValueChange={(tab) => {
                    setActiveTab(tab);
                    // Update URL to include type filter
                    router.push({
                      pathname: '/search',
                      query: { 
                        q: searchQuery,
                        ...(tab !== 'all' ? { type: tab } : {})
                      }
                    }, undefined, { shallow: true });
                  }}
                >
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
                      Users ({getResultsCount("user")})
                    </TabsTrigger>
                    <TabsTrigger
                      value="community"
                      className="flex items-center justify-center"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Communities ({getResultsCount("community")})
                    </TabsTrigger>
                    <TabsTrigger
                      value="hashtag"
                      className="flex items-center justify-center"
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      Hashtags ({getResultsCount("hashtag")})
                    </TabsTrigger>
                    <TabsTrigger
                      value="post"
                      className="flex items-center justify-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Posts ({getResultsCount("post")})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-4">
                    <SearchResultsHandler
                      results={getFilteredResults()}
                      loading={false}
                      query={searchQuery}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <SearchResultsHandler
                results={[]}
                loading={false}
                query={searchQuery}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SearchPage;