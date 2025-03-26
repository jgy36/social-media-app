// src/components/search/SearchResultsHandler.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Users, Hash, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { SearchResult } from "@/types/search";

// Define types for search results

interface SearchResultsHandlerProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
}

const SearchResultsHandler: React.FC<SearchResultsHandlerProps> = ({
  results,
  loading,
  query,
}) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-muted/20 rounded-lg">
        <div className="inline-flex items-center justify-center rounded-full bg-muted/30 p-3 mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {query
            ? `We couldn't find any results for "${query}" in this category. Try a different category or check your spelling.`
            : "Enter a search term to find users, communities, hashtags, and posts."}
        </p>
        {query && (
          <Button
            onClick={() =>
              router.push(`/search?q=${encodeURIComponent(query)}`)
            }
            variant="outline"
            className="mt-4"
          >
            View all results
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <ResultCard key={`${result.type}-${result.id}`} result={result} />
      ))}
    </div>
  );
};

// Individual Result Card Component
const ResultCard: React.FC<{ result: SearchResult }> = ({ result }) => {
  const router = useRouter();

  const handleClick = () => {
    switch (result.type) {
      case "user":
        router.push(`/profile/${result.name}`);
        break;
      case "community":
        router.push(`/community/${result.id}`);
        break;
      case "hashtag":
        // Remove # if present in the name for the URL
        const hashtagId = result.name.startsWith("#")
          ? result.name.substring(1)
          : result.name;
        router.push(`/hashtag/${hashtagId}`);
        break;
      case "post":
        router.push(`/post/${result.id}`);
        break;
    }
  };

  // Get appropriate icon and color for result type
  const getTypeIcon = () => {
    switch (result.type) {
      case "user":
        return <User className="h-5 w-5 text-blue-500" />;
      case "community":
        return <Users className="h-5 w-5 text-green-500" />;
      case "hashtag":
        return <Hash className="h-5 w-5 text-purple-500" />;
      case "post":
        return <FileText className="h-5 w-5 text-orange-500" />;
    }
  };

  // Get appropriate badge color for result type
  const getTypeBadge = () => {
    switch (result.type) {
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "community":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "hashtag":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "post":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    }
  };

  // Get additional details based on result type
  const getAdditionalDetails = () => {
    switch (result.type) {
      case "user":
        return result.followers !== undefined ? (
          <span className="text-xs text-muted-foreground">
            {result.followers.toLocaleString()} followers
          </span>
        ) : null;
      case "community":
        return result.members !== undefined ? (
          <span className="text-xs text-muted-foreground">
            {result.members.toLocaleString()} members
          </span>
        ) : null;
      case "hashtag":
        return result.postCount !== undefined ? (
          <span className="text-xs text-muted-foreground">
            {result.postCount.toLocaleString()} posts
          </span>
        ) : null;
      case "post":
        return result.author ? (
          <span className="text-xs text-muted-foreground">
            by {result.author}
          </span>
        ) : null;
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all border border-border hover:border-primary/20"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-background border border-border rounded-md">
            {getTypeIcon()}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium line-clamp-1">{result.name}</h3>
              <div className={`text-xs px-2 py-0.5 rounded ${getTypeBadge()}`}>
                {result.type}
              </div>
            </div>

            {result.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {result.description}
              </p>
            )}

            {result.content && (
              <p className="text-sm mt-2 line-clamp-3">{result.content}</p>
            )}

            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              {getAdditionalDetails()}

              {result.timestamp && (
                <div className="flex items-center ml-3">
                  <span>{result.timestamp}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResultsHandler;
