// src/components/community/CommunityList.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAllCommunities,
  joinCommunity,
  leaveCommunity,
} from "@/api/communities";
import { updateUserCommunities } from "@/redux/slices/communitySlice";
import CommunityCard from "./CommunityCard";
import JoinedCommunityCard from "./JoinedCommunityCard";
import CommunitySearch from "./CommunitySearch";

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
        // Get all communities from API
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
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [userCommunities]);

  // Handle searching
  const handleSearch = (query: string) => {
    if (query.trim() === "") {
      setFilteredCommunities(communities);
    } else {
      const filtered = communities.filter(
        (community) =>
          community.name.toLowerCase().includes(query.toLowerCase()) ||
          community.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCommunities(filtered);
    }
  };

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

    // Also update filtered communities list
    setFilteredCommunities((prev) =>
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
        const response = await leaveCommunity(communityId);
        success = response.success;
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
        const response = await joinCommunity(communityId);
        success = response.success;
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

        // Also revert filtered communities
        setFilteredCommunities((prev) =>
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

      // Also revert filtered communities
      setFilteredCommunities((prev) =>
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

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>

        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-24 w-full shadow-sm transition animate-pulse bg-muted/50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CommunitySearch
        onSearch={(query) => {
          setSearchQuery(query);
          handleSearch(query);
        }}
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {filteredCommunities.length > 0 ? (
          filteredCommunities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onJoin={handleJoinCommunity}
            />
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
                  <JoinedCommunityCard
                    key={`joined-${community.id}`}
                    community={community}
                    onLeave={handleJoinCommunity}
                  />
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
