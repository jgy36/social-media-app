import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Users, Hash } from 'lucide-react';
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

// Define types for search results
interface SearchResult {
  id: string | number;
  type: 'user' | 'community' | 'hashtag';
  name: string;
  description?: string;
}

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Mock search data - in a real app, you'd fetch this from your API
  const mockSearch = (searchQuery: string) => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      const lowercaseQuery = searchQuery.toLowerCase();
      
      // Mock data
      const users = [
        { id: 1, type: 'user', name: 'JaneDoe', description: 'Political Analyst' },
        { id: 2, type: 'user', name: 'JohnSmith', description: 'Community Organizer' },
        { id: 3, type: 'user', name: 'PoliticsExpert', description: 'Congressional Staffer' }
      ];
      
      const communities = [
        { id: 'dem', type: 'community', name: 'Democrat', description: 'Democratic Party discussions' },
        { id: 'rep', type: 'community', name: 'Republican', description: 'Republican Party discussions' },
        { id: 'lib', type: 'community', name: 'Libertarian', description: 'Libertarian Party discussions' },
        { id: 'ind', type: 'community', name: 'Independent', description: 'Independent voter discussions' },
        { id: 'con', type: 'community', name: 'Conservative', description: 'Conservative viewpoints' },
        { id: 'soc', type: 'community', name: 'Socialist', description: 'Socialist perspectives' }
      ];
      
      const hashtags = [
        { id: 'election2024', type: 'hashtag', name: '#Election2024', description: 'Election 2024 updates' },
        { id: 'policy', type: 'hashtag', name: '#Policy', description: 'Policy discussions' },
        { id: 'debate', type: 'hashtag', name: '#Debate', description: 'Political debate highlights' }
      ];
      
      // Filter based on query
      const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(lowercaseQuery) || 
        user.description.toLowerCase().includes(lowercaseQuery)
      );
      
      const filteredCommunities = communities.filter(community => 
        community.name.toLowerCase().includes(lowercaseQuery) || 
        community.description.toLowerCase().includes(lowercaseQuery)
      );
      
      const filteredHashtags = hashtags.filter(hashtag => 
        hashtag.name.toLowerCase().includes(lowercaseQuery) || 
        hashtag.description.toLowerCase().includes(lowercaseQuery)
      );
      
      // Combine results
      const allResults = [
        ...filteredUsers,
        ...filteredCommunities,
        ...filteredHashtags
      ] as SearchResult[];
      
      setResults(allResults);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    // Debounce search to avoid too many requests
    const timer = setTimeout(() => {
      mockSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (result: SearchResult) => {
    setOpen(false);
    
    // Handle navigation based on result type
    switch (result.type) {
      case 'user':
        router.push(`/profile/${result.id}`);
        break;
      case 'community':
        router.push(`/community/${result.id}`);
        break;
      case 'hashtag':
        router.push(`/hashtag/${result.id}`);
        break;
      default:
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      // If Enter is pressed with text in the input, open the dropdown
      setOpen(true);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search users, communities, hashtags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.trim() !== '' && setOpen(true)}
              className="pl-8 w-full"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full" align="start">
          <Command>
            <CommandInput 
              placeholder="Search users, communities, hashtags..."
              value={query}
              onValueChange={setQuery}
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
                    .map((result) => (
                      <CommandItem
                        key={`user-${result.id}`}
                        onSelect={() => handleSelectResult(result)}
                        className="flex items-center"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <div>
                          <p>{result.name}</p>
                          <p className="text-xs text-muted-foreground">{result.description}</p>
                        </div>
                      </CommandItem>
                    ))
                  }
                </CommandGroup>
              )}
              
              {/* Communities Group */}
              {results.some(r => r.type === 'community') && (
                <CommandGroup heading="Communities">
                  {results
                    .filter(r => r.type === 'community')
                    .map((result) => (
                      <CommandItem
                        key={`community-${result.id}`}
                        onSelect={() => handleSelectResult(result)}
                        className="flex items-center"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <div>
                          <p>{result.name}</p>
                          <p className="text-xs text-muted-foreground">{result.description}</p>
                        </div>
                      </CommandItem>
                    ))
                  }
                </CommandGroup>
              )}
              
              {/* Hashtags Group */}
              {results.some(r => r.type === 'hashtag') && (
                <CommandGroup heading="Hashtags">
                  {results
                    .filter(r => r.type === 'hashtag')
                    .map((result) => (
                      <CommandItem
                        key={`hashtag-${result.id}`}
                        onSelect={() => handleSelectResult(result)}
                        className="flex items-center"
                      >
                        <Hash className="mr-2 h-4 w-4" />
                        <div>
                          <p>{result.name}</p>
                          <p className="text-xs text-muted-foreground">{result.description}</p>
                        </div>
                      </CommandItem>
                    ))
                  }
                </CommandGroup>
              )}
              
              {/* Show "Search all" option if we have a query */}
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