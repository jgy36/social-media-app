// pages/search.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import SearchComponent from "@/components/search/SearchComponent";
import { SearchResult } from "@/types/search"; // Import both interfaces
import SearchResultsHandler from "@/components/search/SearchResultsHandler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUnifiedSearchResults } from "@/api/search";
import { User, Users, Hash, FileText, SearchIcon } from "lucide-react";

// Stable Tab Header Component that won't re-render when content changes
function SearchTabs({
  activeTab,
  counts,
  onTabChange,
}: {
  activeTab: string;
  counts: {
    all: number;
    user: number;
    community: number;
    hashtag: number;
    post: number;
  };
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1 bg-muted rounded-lg p-1">
      <button
        onClick={() => onTabChange("all")}
        className={`flex items-center justify-center rounded-md py-1.5 text-sm font-medium ${
          activeTab === "all"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/50"
        }`}
      >
        <SearchIcon className="h-4 w-4 mr-2" />
        All ({counts.all})
      </button>
      <button
        onClick={() => onTabChange("user")}
        className={`flex items-center justify-center rounded-md py-1.5 text-sm font-medium ${
          activeTab === "user"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/50"
        }`}
      >
        <User className="h-4 w-4 mr-2" />
        Users ({counts.user})
      </button>
      <button
        onClick={() => onTabChange("community")}
        className={`flex items-center justify-center rounded-md py-1.5 text-sm font-medium ${
          activeTab === "community"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/50"
        }`}
      >
        <Users className="h-4 w-4 mr-2" />
        Communities ({counts.community})
      </button>
      <button
        onClick={() => onTabChange("hashtag")}
        className={`flex items-center justify-center rounded-md py-1.5 text-sm font-medium ${
          activeTab === "hashtag"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/50"
        }`}
      >
        <Hash className="h-4 w-4 mr-2" />
        Hashtags ({counts.hashtag})
      </button>
      <button
        onClick={() => onTabChange("post")}
        className={`flex items-center justify-center rounded-md py-1.5 text-sm font-medium ${
          activeTab === "post"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/50"
        }`}
      >
        <FileText className="h-4 w-4 mr-2" />
        Posts ({counts.post})
      </button>
    </div>
  );
}

// Separate component for the tab content
function TabContent({
  activeTab,
  results,
  loading,
  query,
}: {
  activeTab: string;
  results: SearchResult[];
  loading: boolean;
  query: string;
}) {
  // Filter results based on active tab
  const filteredResults =
    activeTab === "all"
      ? results
      : results.filter((result) => result.type === activeTab);

  return (
    <div className="mt-4">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <SearchResultsHandler
          results={filteredResults}
          loading={false}
          query={query}
        />
      )}
    </div>
  );
}

// Main search page component
const SearchPage = () => {
  const router = useRouter();
  const { q, type } = router.query;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Calculate and store counts separately to ensure stability
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    user: 0,
    community: 0,
    hashtag: 0,
    post: 0,
  });

  // Set active tab based on URL parameter
  useEffect(() => {
    if (type && typeof type === "string") {
      setActiveTab(type);
    } else {
      setActiveTab("all");
    }
  }, [type]);

  // Perform search when query changes
  useEffect(() => {
    // Only execute if we have a query and router is ready
    if (router.isReady && q) {
      if (typeof q === "string") {
        console.log(`📢 Search query from URL: "${q}"`);
        setSearchQuery(q);
        performSearch(q);
      }
    } else if (router.isReady) {
      // Router is ready but no query
      setLoading(false);
      setResults([]);
      setTabCounts({ all: 0, user: 0, community: 0, hashtag: 0, post: 0 });
    }
  }, [q, router.isReady]);

  // Search function
  const performSearch = async (query: string) => {
    setLoading(true);
    setSearchError(null);

    try {
      console.log(`🔍 Performing search for query: "${query}"`);
      
      // Add cache busting to prevent stale results
      const timestamp = Date.now();
      const queryWithTimestamp = `${query}?t=${timestamp}`;
      
      // Get results from API - use no type filter to get all results
      const searchResults = await getUnifiedSearchResults(queryWithTimestamp);
      console.log(`✅ Received ${searchResults.length} search results`);

      // Transform results to match the SearchResult interface
      const transformedResults: SearchResult[] = searchResults.map((result) => {
        // Base properties common to all result types
        const baseResult: SearchResult = {
          id: result.id || result.username || result.tag || 0,
          type: result.type,
          name: result.name || result.username || result.tag || '',
        };

        // Add type-specific properties
        switch (result.type) {
          case "user":
            return {
              ...baseResult,
              description:
                result.bio || `@${result.username || baseResult.name}`,
              followers: result.followersCount || 0,
            };

          case "community":
            return {
              ...baseResult,
              description: result.description || '',
              members: result.members || 0,
            };

          case "hashtag":
            const tagName = result.tag || result.name || '';
            return {
              ...baseResult,
              name: tagName.startsWith("#") ? tagName : `#${tagName}`,
              description: `${
                result.count || result.postCount || 0
              } posts with this hashtag`,
              postCount: result.count || result.postCount || 0,
            };

          case "post":
            return {
              ...baseResult,
              content: result.content || '',
              author: result.author || result.username || 'Unknown',
              timestamp: result.createdAt ? new Date(result.createdAt).toLocaleDateString() : '',
            };

          default:
            return baseResult;
        }
      });

      // Update results
      setResults(transformedResults);

      // Calculate counts once and store them
      const counts = {
        all: transformedResults.length,
        user: transformedResults.filter((r) => r.type === "user").length,
        community: transformedResults.filter((r) => r.type === "community")
          .length,
        hashtag: transformedResults.filter((r) => r.type === "hashtag").length,
        post: transformedResults.filter((r) => r.type === "post").length,
      };

      setTabCounts(counts);
      console.log("Tab counts:", counts);
    } catch (error) {
      console.error("❌ Error performing search:", error);
      setSearchError("An error occurred while searching. Please try again.");
      setResults([]);
      setTabCounts({ all: 0, user: 0, community: 0, hashtag: 0, post: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL to include type filter
    router.push(
      {
        pathname: "/search",
        query: {
          q: searchQuery,
          ...(tab !== "all" ? { type: tab } : {}),
        },
      },
      undefined,
      { shallow: true }
    );
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
            <SearchComponent initialQuery={searchQuery} />

            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing results for:{" "}
                <span className="font-medium">{searchQuery}</span>
              </p>
            )}
            
            {searchError && (
              <p className="text-sm text-red-500 mt-2">
                {searchError}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Tabs header (separated component) */}
          <SearchTabs
            activeTab={activeTab}
            counts={tabCounts}
            onTabChange={handleTabChange}
          />

          {/* Tab content (separated component) */}
          <TabContent
            activeTab={activeTab}
            results={results}
            loading={loading}
            query={searchQuery}
          />
        </div>
      </main>
    </div>
  );
};

export default SearchPage;