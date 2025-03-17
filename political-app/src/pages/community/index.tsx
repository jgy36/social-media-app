// pages/community/index.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import Navbar from "@/components/navbar/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp,
  Star,
  User,
  Search,
  Plus
} from "lucide-react";

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  created: string;
  isJoined: boolean;
  color?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!currentUser.token;

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/communities`, {
          headers: currentUser.token ? { Authorization: `Bearer ${currentUser.token}` } : {}
        });
        
        setCommunities(response.data);
        setFilteredCommunities(response.data);
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError("Failed to load communities");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCommunities();
  }, [currentUser.token]);

  useEffect(() => {
    // Filter communities based on search query
    if (searchQuery.trim() === "") {
      setFilteredCommunities(communities);
    } else {
      const filtered = communities.filter(community => 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCommunities(filtered);
    }
  }, [searchQuery, communities]);

  const handleJoinCommunity = async (e: React.MouseEvent, communityId: string) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/community/${communityId}`)}`);
      return;
    }
    
    try {
      const community = communities.find(c => c.id === communityId);
      if (!community) return;
      
      if (community.isJoined) {
        // Leave community
        await axios.delete(`${API_BASE_URL}/communities/${communityId}/leave`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
      } else {
        // Join community
        await axios.post(`${API_BASE_URL}/communities/${communityId}/join`, {}, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
      }
      
      // Update local state
      setCommunities(prevCommunities => 
        prevCommunities.map(c => {
          if (c.id === communityId) {
            return {
              ...c,
              isJoined: !c.isJoined,
              members: c.isJoined ? c.members - 1 : c.members + 1
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error("Error toggling community membership:", error);
    }
  };

  const navigateToCommunity = (communityId: string) => {
    router.push(`/community/${communityId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading communities...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Communities</h1>
            <p className="text-muted-foreground">Join discussions with like-minded individuals</p>
          </div>
          
          {/* Search and Create buttons */}
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search communities" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>
            
            <Button onClick={() => router.push("/community/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>
        </div>
        
        {/* Community Categories - Optional: Implement filtering by category */}
        <div className="mb-8">
          {/* You could add category filters here */}
        </div>
        
        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommunities.length > 0 ? (
            filteredCommunities.map(community => (
              <Card 
                key={community.id} 
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4"
                style={{ borderLeftColor: community.color || 'var(--primary)' }}
                onClick={() => navigateToCommunity(community.id)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-1">{community.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{community.description}</p>
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{community.members.toLocaleString()} members</span>
                      </div>
                    </div>
                    
                    <Button
                      variant={community.isJoined ? "outline" : "default"}
                      size="sm"
                      className={community.isJoined ? "border-primary/50" : ""}
                      onClick={(e) => handleJoinCommunity(e, community.id)}
                    >
                      {community.isJoined ? "Joined" : "Join"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Communities Found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No communities match "${searchQuery}"`
                  : "There are no communities available right now"
                }
              </p>
              <Button 
                onClick={() => router.push("/community/create")}
                className="mt-4"
              >
                Create a Community
              </Button>
            </div>
          )}
        </div>
        
        {/* Your Communities Section (only if authenticated) */}
        {isAuthenticated && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Your Communities</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.filter(c => c.isJoined).length > 0 ? (
                communities
                  .filter(community => community.isJoined)
                  .map(community => (
                    <Card 
                      key={`joined-${community.id}`} 
                      className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4"
                      style={{ borderLeftColor: community.color || 'var(--primary)' }}
                      onClick={() => navigateToCommunity(community.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{community.name}</h3>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{community.members.toLocaleString()} members</span>
                            </div>
                          </div>
                          
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">You haven't joined any communities yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitiesPage;