// src/components/profile/UserCommunities.tsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllCommunities } from "@/utils/api";
import Link from "next/link";

interface Community {
  id: string;
  name: string;
  members: number;
  color?: string;
}

const UserCommunities = () => {
  const [communityDetails, setCommunityDetails] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  
  const joinedCommunityIds = useSelector((state: RootState) => state.communities.joinedCommunities);
  const featuredCommunityIds = useSelector((state: RootState) => state.communities.featuredCommunities);
  
  useEffect(() => {
    const fetchCommunityDetails = async () => {
      if (joinedCommunityIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const allCommunities = await getAllCommunities();
        
        // Filter to joined communities
        const joinedCommunities = allCommunities
          .filter(community => joinedCommunityIds.includes(community.id))
          .map(community => ({
            id: community.id,
            name: community.name,
            members: community.members,
            color: community.color
          }));
        
        setCommunityDetails(joinedCommunities);
      } catch (error) {
        console.error("Error fetching community details:", error);
        
        // Fallback if API fails
        setCommunityDetails(
          joinedCommunityIds.map(id => ({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
            members: 0,
            color: '#333333'
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommunityDetails();
  }, [joinedCommunityIds]);
  
  // If no communities, display a message
  if (!loading && joinedCommunityIds.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">
            <Users className="inline-block mr-2 h-5 w-5" />
            Your Communities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">You haven&#39;t joined any communities yet.</p>
            <Link href="/community">
              <Button className="mt-2">Browse Communities</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Display top 5 communities
  const displayCommunities = communityDetails
    // Prioritize featured communities
    .sort((a, b) => {
      const aFeatured = featuredCommunityIds.includes(a.id);
      const bFeatured = featuredCommunityIds.includes(b.id);
      
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      return 0;
    })
    // Limit to first 5
    .slice(0, 5);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">
          <Users className="inline-block mr-2 h-5 w-5" />
          Your Top Communities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {displayCommunities.map(community => (
              <Link key={community.id} href={`/community/${community.id}`}>
                <div 
                  className="p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer border-l-4 flex justify-between items-center" 
                  style={{ borderLeftColor: community.color || 'var(--primary)' }}
                >
                  <div>
                    <h3 className="font-medium">{community.name}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{community.members.toLocaleString()} members</span>
                    </div>
                  </div>
                  
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
            
            {/* Link to view all communities if more than 5 */}
            {joinedCommunityIds.length > 5 && (
              <div className="text-center mt-4">
                <Link href="/community">
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted px-3 py-1">
                    View all {joinedCommunityIds.length} communities
                  </Badge>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCommunities;