// src/components/community/CommunityList.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllCommunities, joinCommunity, leaveCommunity } from "@/utils/api";
import { updateUserCommunities } from "@/redux/slices/communitySlice";

// Define community type
interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  trending?: boolean;
  category?: string;
  color?: string;
  isJoined?: boolean;
}

const CommunityList = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinedStatus, setJoinedStatus] = useState<Record<string, boolean>>({});

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const userCommunities = useSelector(
    (state: RootState) => state.communities.joinedCommunities
  );
  const isAuthenticated = !!user.token;

  // Fetch communities from API
  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllCommunities();

        // Mark community as trending if it's one of the top 2
        const withTrending = data.map((community, index) => ({
          ...community,
          trending: index < 2, // Top 2 communities marked as trending
        }));

        setCommunities(withTrending);
        setFilteredCommunities(withTrending);

        // Initialize joined status from Redux store
        const statusMap: Record<string, boolean> = {};
        withTrending.forEach((community) => {
          // Check if community is in the userCommunities array
          statusMap[community.id] = userCommunities.includes(community.id);
        });
        setJoinedStatus(statusMap);
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError("Failed to load communities");

        // In development, use mock data if API fails
        if (process.env.NODE_ENV === "development") {
          const MOCK_COMMUNITIES: Community[] = [
            {
              id: "democrat",
              name: "Democrat",
              description: "Democratic Party discussions",
              members: 15243,
              trending: true,
              category: "Political Party",
              color: "blue",
            },
            {
              id: "republican",
              name: "Republican",
              description: "Republican Party discussions",
              members: 14876,
              category: "Political Party",
              color: "red",
            },
            {
              id: "libertarian",
              name: "Libertarian",
              description: "Libertarian Party discussions",
              members: 8932,
              category: "Political Party",
              color: "yellow",
            },
            {
              id: "independent",
              name: "Independent",
              description: "Independent voter discussions",
              members: 10547,
              trending: true,
              category: "Political Party",
              color: "purple",
            },
            {
              id: "conservative",
              name: "Conservative",
              description: "Conservative viewpoints",
              members: 12765,
              category: "Political Philosophy",
              color: "darkred",
            },
            {
              id: "socialist",
              name: "Socialist",
              description: "Socialist perspectives",
              members: 9876,
              category: "Political Philosophy",
              color: "darkred",
            },
          ];

          setCommunities(MOCK_COMMUNITIES);
          setFilteredCommunities(MOCK_COMMUNITIES);

          // Initialize joined status with mock data and Redux state
          const statusMap: Record<string, boolean> = {};
          MOCK_COMMUNITIES.forEach((community) => {
            statusMap[community.id] = userCommunities.includes(community.id);
          });
          setJoinedStatus(statusMap);

          setError(null); // Clear error if using mock data
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [userCommunities]);

  // Filter communities when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCommunities(communities);
    } else {
      const filtered = communities.filter(
        (community) =>
          community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          community.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredCommunities(filtered);
    }
  }, [searchQuery, communities]);

  // Handle joining/leaving a community
  const handleJoinCommunity = async (
    e: React.MouseEvent,
    communityId: string
  ) => {
    e.preventDefault(); // Prevent navigation to community page
    e.stopPropagation(); // Prevent event bubbling

    if (!isAuthenticated) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/community/${communityId}`)}`
      );
      return;
    }

    // Get current joined status
    const isCurrentlyJoined = joinedStatus[communityId];

    // Optimistically update UI
    setJoinedStatus((prev) => ({
      ...prev,
      [communityId]: !isCurrentlyJoined,
    }));

    // Update communities member count optimistically
    setCommunities((prev) =>
      prev.map((community) => {
        if (community.id === communityId) {
          return {
            ...community,
            members: isCurrentlyJoined
              ? Math.max(0, community.members - 1)
              : community.members + 1,
          };
        }
        return community;
      })
    );

    try {
      let success: boolean;

      if (isCurrentlyJoined) {
        // Leave community
        success = await leaveCommunity(communityId);
        if (success) {
          // Update Redux store
          dispatch(
            updateUserCommunities(
              userCommunities.filter((id) => id !== communityId)
            )
          );
        }
      } else {
        // Join community
        success = await joinCommunity(communityId);
        if (success) {
          // Update Redux store
          dispatch(updateUserCommunities([...userCommunities, communityId]));
        }
      }

      if (!success) {
        // Revert if API call failed
        setJoinedStatus((prev) => ({
          ...prev,
          [communityId]: isCurrentlyJoined,
        }));

        // Revert member count
        setCommunities((prev) =>
          prev.map((community) => {
            if (community.id === communityId) {
              return {
                ...community,
                members: isCurrentlyJoined
                  ? community.members + 1
                  : Math.max(0, community.members - 1),
              };
            }
            return community;
          })
        );
      }
    } catch (error) {
      console.error("Error toggling community membership:", error);

      // Revert UI state on error
      setJoinedStatus((prev) => ({
        ...prev,
        [communityId]: isCurrentlyJoined,
      }));

      // Revert member count
      setCommunities((prev) =>
        prev.map((community) => {
          if (community.id === communityId) {
            return {
              ...community,
              members: isCurrentlyJoined
                ? community.members + 1
                : Math.max(0, community.members - 1),
            };
          }
          return community;
        })
      );
    }
  };

  // Navigate to a community page
  const navigateToCommunity = (communityId: string) => {
    router.push(`/community/${communityId}`);
  };

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>

        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="shadow-sm transition animate-pulse bg-muted/50"
          >
            <CardContent className="p-3 h-24"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          COMMUNITIES
        </h3>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 w-full sm:w-auto min-w-[200px]"
            />
          </div>

          <Button size="sm" onClick={() => router.push("/community/create")}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {filteredCommunities.length > 0 ? (
          filteredCommunities.map((community) => (
            <Link
              href={`/community/${community.id}`}
              key={community.id}
              className="block"
              onClick={(e) => {
                e.preventDefault();
                navigateToCommunity(community.id);
              }}
            >
              <Card
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4"
                style={{ borderLeftColor: community.color || "var(--primary)" }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-base font-medium mr-2">
                          {community.name}
                        </h3>
                        {community.trending && (
                          <Badge
                            variant="outline"
                            className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" /> Trending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {community.description}
                      </p>

                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        <span>
                          {community.members.toLocaleString()} members
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={
                        joinedStatus[community.id] ? "outline" : "default"
                      }
                      size="sm"
                      className={
                        joinedStatus[community.id] ? "border-primary/50" : ""
                      }
                      onClick={(e) => handleJoinCommunity(e, community.id)}
                    >
                      {joinedStatus[community.id] ? "Joined" : "Join"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Communities Found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? `No communities match "${searchQuery}"`
                : "There are no communities available right now"}
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
        <div className="mt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            YOUR COMMUNITIES
          </h3>

          {Object.entries(joinedStatus).filter(([, isJoined]) => isJoined)
            .length > 0 ? (
            <div className="space-y-3">
              {communities
                .filter((community) => joinedStatus[community.id])
                .map((community) => (
                  <Link
                    href={`/community/${community.id}`}
                    key={`joined-${community.id}`}
                    className="block"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToCommunity(community.id);
                    }}
                  >
                    <Card
                      className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4"
                      style={{
                        borderLeftColor: community.color || "var(--primary)",
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{community.name}</h3>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Users className="h-3 w-3 mr-1" />
                              <span>
                                {community.members.toLocaleString()} members
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleJoinCommunity(e, community.id);
                            }}
                          >
                            Leave
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                You haven&apos;t joined any communities yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityList;
