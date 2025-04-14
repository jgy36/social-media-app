/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/search/SearchComponent.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, User, Users, Hash, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { useRouter } from 'next/router';
import { useSearchAll } from "@/hooks/useApi"; // Import the API hook
import { Button } from '@/components/ui/button';
import { debounce } from 'lodash';
import { storePreviousSection } from '@/utils/navigationStateManager';

// Define interfaces for search results
interface SearchResult {
  id: string | number;
  type: 'user' | 'community' | 'hashtag';
  name: string;
  description?: string;
  members?: number;
  followers?: number;
  postCount?: number;
  avatar?: string;
}

interface SearchComponentProps {
  initialQuery?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [firstSearchFailed, setFirstSearchFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Use the search hook from your API
  const { loading, error, execute: searchAll } = useSearchAll();
  
  // Define the search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearchLoading(false);
      return;
    }
    
    setIsSearchLoading(true);
    
    try {
      // Add a random timestamp to prevent caching issues
      const timestamp = Date.now();
      
      // Use the searchAll function from your hook to get unified results
      const searchResults = await searchAll(`${searchQuery}?t=${timestamp}`);
      
      console.log('Search results:', searchResults);
      
      // If the search was previously failed but now succeeded, update the state
      if (firstSearchFailed) {
        setFirstSearchFailed(false);
      }
      
      // Mark that we've attempted a search
      setSearchAttempted(true);
      
      // If the results are already in the expected format, use them directly
      if (Array.isArray(searchResults) && searchResults.length > 0 && 'type' in searchResults[0]) {
        setResults(searchResults as SearchResult[]);
      } else if (Array.isArray(searchResults)) {
        // If we have an array but need to transform the results
        const transformedResults: SearchResult[] = searchResults.map(item => ({
          id: item.id || '',
          type: item.type as 'user' | 'community' | 'hashtag',
          name: item.name || item.username || item.tag || '',
          description: item.description || item.bio || (item.postCount ? `${item.postCount} posts` : ''),
          members: item.members,
          followers: item.followersCount,
          postCount: item.postCount || item.count
        }));
        
        setResults(transformedResults);
      } else {
        // If we don't have valid results
        setResults([]);
      }
    } catch (error) {
      console.error('Error performing search:', error);
      
      // If this is the first search attempt, mark it as failed for retry logic
      if (!searchAttempted) {
        setFirstSearchFailed(true);
        
        // Try again after a short delay - this helps with first-search failures
        setTimeout(() => {
          if (searchQuery.trim()) {
            performSearch(searchQuery);
          }
        }, 500);
      }
      
      setResults([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Create a debounced version of the search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(performSearch, 300), []);

  // Trigger search when query changes
  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }
    
    // Cleanup function to cancel debounced search
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  // Handle clicks that shouldn't close the popover
  const handlePopoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSelectResult = (result: SearchResult) => {
    setOpen(false);
    
    // Get the current path for context
    const currentPath = router.asPath;
    const currentSection = currentPath.split('/')[1] || '';
    
    // Store the current section before navigating
    if (currentSection) {
      storePreviousSection(currentSection);
    }
    
    // Handle navigation based on result type
    switch (result.type) {
      case 'user':
        router.push(`/profile/${result.name}`);
        break;
      case 'community':
        router.push(`/community/${result.id}`);
        break;
      case 'hashtag':
        // Remove the # from hashtag name for URL
        const hashtagId = typeof result.name === 'string' && result.name.startsWith('#') 
          ? result.name.substring(1) 
          : result.name;
        router.push(`/hashtag/${hashtagId}`);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      // If Enter is pressed with text in the input, open the dropdown
      // or go to search page if dropdown is already open
      if (open && results.length > 0) {
        // If dropdown is open and we have results, select the first one
        handleSelectResult(results[0]);
      } else if (open) {
        // If dropdown is open but no results, go to search page
        navigateToSearchPage();
      } else {
        setOpen(true);
      }
    }
  };
  
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Focus manager - ensure input retains focus
  const handleInputFocus = () => {
    if (query.trim() !== '') {
      setOpen(true);
    }
  };

  // Explicitly only use click on input without any side-effects
  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Function to navigate to search page - centralized to avoid duplication
  const navigateToSearchPage = () => {
    console.log("Navigating to search page with query:", query);
    
    // Close the popover first
    setOpen(false);
    
    // Use router.push with the search query
    router.push({
      pathname: '/search',
      query: { q: query }
    });
  };

  return (
    <div className="relative w-full max-w-md" onClick={handlePopoverClick}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex items-center">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search users, communities, hashtags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onClick={handleInputClick}
              className="pl-8 pr-8 w-full"
              autoComplete="off"
            />
            {query.trim() !== '' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="p-0 w-96" align="start" onClick={handlePopoverClick}>
          <Command>
            <CommandList>
              <CommandEmpty>
                {isSearchLoading || loading 
                  ? 'Searching...' 
                  : firstSearchFailed 
                    ? 'Retrying search...' 
                    : 'No results found.'}
              </CommandEmpty>
              
              {/* Users Group */}
              {results.some(r => r.type === 'user') && (
                <CommandGroup heading="Users">
                  {results
                    .filter(r => r.type === 'user')
                    .slice(0, 4) // Limit to 4 users
                    .map((result) => (
                      <CommandItem
                        key={`user-${result.id}`}
                        onSelect={() => handleSelectResult(result)}
                        className="flex items-center py-2"
                      >
                        <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center mr-2 flex-shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium truncate">{result.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                        </div>
                      </CommandItem>
                    ))
                  }
                  
                  {/* More link if more than 4 results */}
                  {results.filter(r => r.type === 'user').length > 4 && (
                    <CommandItem
                      onSelect={() => {
                        router.push(`/search?q=${encodeURIComponent(query)}&type=user`);
                        setOpen(false);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground italic"
                    >
                      See all users...
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
              
              {/* Communities Group */}
              {results.some(r => r.type === 'community') && (
                <CommandGroup heading="Communities">
                  {results
                    .filter(r => r.type === 'community')
                    .slice(0, 4) // Limit to 4 communities
                    .map((result) => (
                      <CommandItem
                        key={`community-${result.id}`}
                        onSelect={() => handleSelectResult(result)}
                        className="flex items-center py-2"
                      >
                        <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center mr-2 flex-shrink-0">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium truncate">{result.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                        </div>
                      </CommandItem>
                    ))
                  }
                  
                  {/* More link if more than 4 results */}
                  {results.filter(r => r.type === 'community').length > 4 && (
                    <CommandItem
                      onSelect={() => {
                        router.push(`/search?q=${encodeURIComponent(query)}&type=community`);
                        setOpen(false);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground italic"
                    >
                      See all communities...
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
              
              {/* Hashtags Group */}
              {results.some(r => r.type === 'hashtag') && (
                <CommandGroup heading="Hashtags">
                  {results
                    .filter(r => r.type === 'hashtag')
                    .slice(0, 4) // Limit to 4 hashtags
                    .map((result) => (
                      <CommandItem
                        key={`hashtag-${result.id}`}
                        onSelect={() => handleSelectResult(result)}
                        className="flex items-center py-2"
                      >
                        <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center mr-2 flex-shrink-0">
                          <Hash className="h-4 w-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium truncate">{result.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.postCount ? `${result.postCount} posts` : ''}
                          </p>
                        </div>
                      </CommandItem>
                    ))
                  }
                  
                  {/* More link if more than 4 results */}
                  {results.filter(r => r.type === 'hashtag').length > 4 && (
                    <CommandItem
                      onSelect={() => {
                        router.push(`/search?q=${encodeURIComponent(query)}&type=hashtag`);
                        setOpen(false);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground italic"
                    >
                      See all hashtags...
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
              
              {/* View All Search Results option */}
              {query.trim() !== '' && (
                <CommandGroup heading="Actions">
                  <CommandItem
                    onSelect={navigateToSearchPage}
                    className="flex items-center"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search all results for &quot;{query}&quot;</span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchComponent;