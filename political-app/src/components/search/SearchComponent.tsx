// src/components/search/SearchComponent.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, User, Users, Hash, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { useRouter } from 'next/router';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { debounce } from 'lodash';

// Define interfaces for API responses
interface UserResponse {
  id?: string | number;
  username: string;
  bio?: string;
  followersCount?: number;
  avatar?: string;
}

interface CommunityResponse {
  id?: string | number;
  slug?: string;
  name: string;
  description?: string;
  members?: number;
}

interface HashtagResponse {
  tag?: string;
  name?: string;
  count?: number;
  postCount?: number;
}

// Define types for search results
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

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Define the search function inside the component but outside of any hooks
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      
      // Fetch users
      const userResults = await api.get(`${API_BASE_URL}/users/search?query=${encodeURIComponent(searchQuery)}`)
        .then(res => res.data as UserResponse[])
        .catch(() => [] as UserResponse[]);
      
      // Fetch communities
      const communityResults = await api.get(`${API_BASE_URL}/communities/search?query=${encodeURIComponent(searchQuery)}`)
        .then(res => res.data as CommunityResponse[])
        .catch(() => [] as CommunityResponse[]);
        
      // Fetch hashtags
      const hashtagResults = await api.get(`${API_BASE_URL}/hashtags/search?query=${encodeURIComponent(searchQuery)}`)
        .then(res => res.data as HashtagResponse[])
        .catch(() => [] as HashtagResponse[]);
        
      // Transform and combine results
      const transformedUsers = (userResults || []).map((user: UserResponse) => ({
        id: user.id || user.username,
        type: 'user' as const,
        name: user.username,
        description: user.bio || 'User profile',
        followers: user.followersCount,
        avatar: user.avatar
      }));
      
      const transformedCommunities = (communityResults || []).map((community: CommunityResponse) => ({
        id: community.id || community.slug || community.name,
        type: 'community' as const,
        name: community.name,
        description: community.description,
        members: community.members
      }));
      
      const transformedHashtags = (hashtagResults || []).map((hashtag: HashtagResponse) => ({
        id: hashtag.tag || hashtag.name?.replace(/^#/, '') || '',
        type: 'hashtag' as const,
        name: hashtag.tag?.startsWith('#') ? hashtag.tag : `#${hashtag.tag || hashtag.name || ''}`,
        description: `${hashtag.count || hashtag.postCount || 0} posts`,
        postCount: hashtag.count || hashtag.postCount
      }));
      
      // Combine all results
      const allResults = [
        ...transformedUsers,
        ...transformedCommunities,
        ...transformedHashtags
      ];
      
      // Fallback to mock data if no API results in development
      if (allResults.length === 0 && process.env.NODE_ENV === 'development') {
        console.log('No results from API, using mock data');
        
        // Simple search in mock data to mimic API behavior
        const lowercaseQuery = searchQuery.toLowerCase();
        
        // Mock data
        const mockUsers: SearchResult[] = [
          { id: 1, type: 'user', name: 'JaneDoe', description: 'Political Analyst', followers: 245 },
          { id: 2, type: 'user', name: 'JohnSmith', description: 'Community Organizer', followers: 182 },
          { id: 3, type: 'user', name: 'PoliticsExpert', description: 'Congressional Staffer', followers: 532 }
        ];
        
        const mockCommunities: SearchResult[] = [
          { id: 'democrat', type: 'community', name: 'Democrat', description: 'Democratic Party discussions', members: 15243 },
          { id: 'republican', type: 'community', name: 'Republican', description: 'Republican Party discussions', members: 14876 },
          { id: 'libertarian', type: 'community', name: 'Libertarian', description: 'Libertarian Party discussions', members: 8932 },
          { id: 'independent', type: 'community', name: 'Independent', description: 'Independent voter discussions', members: 10547 },
          { id: 'conservative', type: 'community', name: 'Conservative', description: 'Conservative viewpoints', members: 12765 },
          { id: 'socialist', type: 'community', name: 'Socialist', description: 'Socialist perspectives', members: 9876 }
        ];
        
        const mockHashtags: SearchResult[] = [
          { id: 'election2024', type: 'hashtag', name: '#Election2024', description: '842 posts', postCount: 842 },
          { id: 'policy', type: 'hashtag', name: '#Policy', description: '567 posts', postCount: 567 },
          { id: 'debate', type: 'hashtag', name: '#Debate', description: '324 posts', postCount: 324 }
        ];
        
        // Filter based on query
        const filteredUsers = mockUsers.filter(
          user => user.name.toLowerCase().includes(lowercaseQuery) || 
                  (user.description && user.description.toLowerCase().includes(lowercaseQuery))
        );
        
        const filteredCommunities = mockCommunities.filter(
          community => community.name.toLowerCase().includes(lowercaseQuery) || 
                        (community.description && community.description.toLowerCase().includes(lowercaseQuery))
        );
        
        const filteredHashtags = mockHashtags.filter(
          hashtag => hashtag.name.toLowerCase().includes(lowercaseQuery) || 
                      (hashtag.description && hashtag.description.toLowerCase().includes(lowercaseQuery))
        );
        
        // Set the mock results
        setResults([...filteredUsers, ...filteredCommunities, ...filteredHashtags]);
      } else {
        setResults(allResults);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
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

  const handleSelectResult = (result: SearchResult) => {
    setOpen(false);
    
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
        const hashtagId = result.name.startsWith('#') ? result.name.substring(1) : result.name;
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
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setOpen(false);
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

  return (
    <div className="relative w-full max-w-md">
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
              onFocus={() => query.trim() !== '' && setOpen(true)}
              className="pl-8 pr-8 w-full"
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
        
        <PopoverContent className="p-0 w-96" align="start">
          <Command>
            <CommandInput 
              placeholder="Search users, communities, hashtags..."
              value={query}
              onValueChange={setQuery}
              disabled={loading}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? 'Searching...' : 'No results found.'}
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
                          <p className="text-xs text-muted-foreground truncate">{result.description}</p>
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
                    onSelect={() => {
                      router.push(`/search?q=${encodeURIComponent(query)}`);
                      setOpen(false);
                    }}
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