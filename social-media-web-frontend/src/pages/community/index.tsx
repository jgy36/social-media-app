/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/community/index.tsx - without AxiosError dependency
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/layout/MainLayout";
import { Users, Plus, TrendingUp } from "lucide-react";
import { joinCommunity, leaveCommunity } from "@/redux/slices/communitySlice";
import SearchComponent from "@/components/search/SearchComponent";
import { safeNavigate } from "@/utils/routerHistoryManager";
import { useToast } from "@/hooks/use-toast";

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  created: string;
  isJoined: boolean;
  color?: string;
  trending?: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.user);
  const joinedCommunityIds = useSelector(
    (state: RootState) => state.communities.joinedCommunities
  );
  const isAuthenticated = !!currentUser.token;
  const userRole = useSelector((state: RootState) => state.user.role);
  const { toast } = useToast();
  const user = useSelector((state: RootState) => state.user);
  const isAdmin = userRole === "ADMIN";

  // Add this function
  const handleCreateButtonClick = () => {
    if (isAdmin) {
      // If admin, navigate to create page
      router.push("/community/create");
    } else {
      // If not admin, show toast notification
      toast({
        title: "Permission Denied",
        description: "Only administrator accounts can create new communities.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Always make the GET communities request as a public endpoint (no auth required)
        // This matches our updated backend configuration
        console.log("Fetching communities as public endpoint");
        const response = await axios.get<Community[]>(
          `${API_BASE_URL}/communities`
        );

        console.log("Communities data received:", response.data);

        // Mark top 2 communities as trending
        const communitiesWithTrending = response.data.map(
          (community, index) => ({
            ...community,
            trending: index < 2, // Top 2 communities marked as trending
            // Set isJoined based on Redux state
            isJoined: joinedCommunityIds.includes(community.id),
          })
        );

        setCommunities(communitiesWithTrending);
        setFilteredCommunities(communitiesWithTrending);
      } catch (err) {
        console.error("Error fetching communities:", err);

        // Use plain object access without AxiosError type
        const error = err as Error;

        // Check if it's an axios error by looking for response property
        if (err && typeof err === "object" && "response" in err) {
          const responseError = err as {
            response?: {
              status?: number;
              statusText?: string;
              data?: any;
            };
          };

          if (responseError.response) {
            // Log detailed error information
            console.error("Status:", responseError.response.status);
            console.error("Data:", responseError.response.data);

            if (responseError.response.status === 401) {
              setError(
                "Authentication error: The communities endpoint requires authentication. Please check your backend configuration."
              );
            } else {
              setError(
                `Failed to load communities. Error: ${responseError.response.status} ${responseError.response.statusText}`
              );
            }
          } else if ("message" in error) {
            // Network error or timeout
            if (
              error.message.includes("timeout") ||
              error.message.includes("Network Error")
            ) {
              setError(
                "Network error: Unable to reach the server. Please check your connection and try again."
              );
            } else {
              setError(`Failed to load communities: ${error.message}`);
            }
          } else {
            setError("Failed to load communities. Please try again later.");
          }
        } else {
          // For non-Axios errors
          setError("Failed to load communities. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, [joinedCommunityIds]);

  const handleJoinCommunity = async (
    e: React.MouseEvent,
    communityId: string
  ) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling

    if (!isAuthenticated) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/community/${communityId}`)}`
      );
      return;
    }

    try {
      const community = communities.find((c) => c.id === communityId);
      if (!community) return;

      // Update local state optimistically
      setCommunities((prevCommunities) =>
        prevCommunities.map((c) => {
          if (c.id === communityId) {
            return {
              ...c,
              isJoined: !c.isJoined,
              members: c.isJoined ? c.members - 1 : c.members + 1,
            };
          }
          return c;
        })
      );

      // Also update filtered communities
      setFilteredCommunities((prevCommunities) =>
        prevCommunities.map((c) => {
          if (c.id === communityId) {
            return {
              ...c,
              isJoined: !c.isJoined,
              members: c.isJoined ? c.members - 1 : c.members + 1,
            };
          }
          return c;
        })
      );

      if (community.isJoined) {
        // Leave community
        await axios.delete(`${API_BASE_URL}/communities/${communityId}/leave`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });

        // Update Redux store
        dispatch(leaveCommunity(communityId));
      } else {
        // Join community
        await axios.post(
          `${API_BASE_URL}/communities/${communityId}/join`,
          {},
          {
            headers: { Authorization: `Bearer ${currentUser.token}` },
          }
        );

        // Update Redux store
        dispatch(joinCommunity(communityId));
      }
    } catch (error) {
      console.error("Error toggling community membership:", error);

      // Revert local state if API call fails
      setCommunities((prevCommunities) =>
        prevCommunities.map((c) => {
          if (c.id === communityId) {
            return {
              ...c,
              isJoined: !c.isJoined, // Revert back
              members: !c.isJoined ? c.members - 1 : c.members + 1, // Also revert
            };
          }
          return c;
        })
      );

      // Also revert filtered communities
      setFilteredCommunities((prevCommunities) =>
        prevCommunities.map((c) => {
          if (c.id === communityId) {
            return {
              ...c,
              isJoined: !c.isJoined, // Revert back
              members: !c.isJoined ? c.members - 1 : c.members + 1, // Also revert
            };
          }
          return c;
        })
      );
    }
  };

  const navigateToCommunity = (communityId: string) => {
    console.log(`Navigating to community: ${communityId}`);

    // Use the safe navigation function from routerHistoryManager
    safeNavigate(router, `/community/${communityId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading communities...</p>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto p-6">
          <Card className="shadow-md">
            <CardContent className="p-4">
              <p className="text-destructive font-medium text-lg mb-2">Error</p>
              <p className="mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-2">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Communities</h1>
            <p className="text-muted-foreground">
              Join discussions with like-minded individuals
            </p>
          </div>

          {/* Search and Create buttons - only render SearchComponent once */}
          <div className="flex gap-4 w-full md:w-auto">
            {/* Commented out search component
  <div className="flex-1 md:flex-initial">
    <SearchComponent />
  </div>
  */}

            {/* Commented out create button
  <Button onClick={() => router.push("/community/create")}>
    <Plus className="h-4 w-4 mr-2" />
    Create
  </Button>
  */}
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommunities.length > 0 ? (
            filteredCommunities.map((community) => (
              <div
                key={community.id}
                className="block cursor-pointer"
                onClick={() => navigateToCommunity(community.id)}
                data-testid={`community-card-${community.id}`}
              >
                <Card
                  className="shadow-sm hover:shadow-md transition-shadow border-l-4 h-[190px]"
                  style={{
                    borderLeftColor: community.color || "var(--primary)",
                  }}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    {/* Top row with name and join button */}
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-medium truncate pr-2">
                        {community.name}
                      </h3>

                      <Button
                        variant={community.isJoined ? "outline" : "default"}
                        size="sm"
                        className={
                          community.isJoined ? "border-primary/50" : ""
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinCommunity(e, community.id);
                        }}
                      >
                        {community.isJoined ? "Joined" : "Join"}
                      </Button>
                    </div>

                    {/* Trending badge */}
                    <div className="h-6 mb-2">
                      {community.trending && (
                        <Badge
                          variant="outline"
                          className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" /> Trending
                        </Badge>
                      )}
                    </div>

                    {/* Description with fixed height */}
                    <div className="h-16 mb-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {community.description}
                      </p>
                    </div>

                    {/* Members count at bottom */}
                    <div className="mt-auto flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{community.members.toLocaleString()} members</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Communities Found</h3>
              <p className="text-muted-foreground">
                There are no communities matching your search
              </p>
              <Button onClick={handleCreateButtonClick} className="mt-4">
                Create a Community
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CommunitiesPage;
