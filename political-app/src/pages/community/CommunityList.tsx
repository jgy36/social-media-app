// components/community/CommunityList.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp,
  Star,
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";

// Define community type
interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  trending?: boolean;
  category?: string;
  color?: string;
}

const CommunityList = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.token;

  // Mock communities data
  const MOCK_COMMUNITIES: Community[] = [
    {
      id: "democrat",
      name: "Democrat",
      description: "Democratic Party discussions",
      members: 15243,
      trending: true,
      category: "Political Party",
      color: "blue"
    },
    {
      id: "republican",
      name: "Republican",
      description: "Republican Party discussions",
      members: 14876,
      category: "Political Party",
      color: "red"
    },
    {
      id: "libertarian",
      name: "Libertarian",
      description: "Libertarian Party discussions",
      members: 8932,
      category: "Political Party",
      color: "yellow"
    },
    {
      id: "independent",
      name: "Independent",
      description: "Independent voter discussions",
      members: 10547,
      trending: true,
      category: "Political Party",
      color: "purple"
    },
    {
      id: "conservative",
      name: "Conservative",
      description: "Conservative viewpoints",
      members: 12765,
      category: "Political Philosophy",
      color: "darkred"
    },
    {
      id: "socialist",
      name: "Socialist",
      description: "Socialist perspectives",
      members: 9876,
      category: "Political Philosophy",
      color: "darkred"
    }
  ];

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setCommunities(MOCK_COMMUNITIES);
      setLoading(false);
      
      // Get joined communities from localStorage
      if (typeof window !== 'undefined') {
        const storedCommunities = localStorage.getItem('joinedCommunities');
        if (storedCommunities) {
          setJoinedCommunities(JSON.parse(storedCommunities));
        }
      }
    }, 500);
    // Since MOCK_COMMUNITIES is defined outside the component and doesn't change,
    // we can safely disable the exhaustive-deps lint rule here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoinCommunity = (e: React.MouseEvent, communityId: string) => {
    e.preventDefault(); // Prevent navigation to community page
    e.stopPropagation(); // Prevent event bubbling
    
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/community/${communityId}`));
      return;
    }
    
    // Toggle joined status
    let updatedJoinedCommunities: string[];
    
    if (joinedCommunities.includes(communityId)) {
      // Leave community
      updatedJoinedCommunities = joinedCommunities.filter(id => id !== communityId);
    } else {
      // Join community
      updatedJoinedCommunities = [...joinedCommunities, communityId];
    }
    
    // Update state
    setJoinedCommunities(updatedJoinedCommunities);
    
    // Update localStorage
    localStorage.setItem('joinedCommunities', JSON.stringify(updatedJoinedCommunities));
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="shadow-sm transition animate-pulse bg-muted/50">
            <CardContent className="p-3 h-16"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">RECOMMENDED COMMUNITIES</h3>
      </div>
      
      <div className="space-y-3">
        {communities.map((community) => (
          <Link 
            href={`/community/${community.id}`} 
            key={community.id}
            className="block"
          >
            <Card 
              className="shadow-sm transition hover:shadow-md cursor-pointer border-l-4"
              style={{ borderLeftColor: community.color || 'currentColor' }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-base font-medium mr-2">{community.name}</h3>
                      {community.trending && (
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          <TrendingUp className="h-3 w-3 mr-1" /> Trending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{community.members.toLocaleString()} members</span>
                    </div>
                  </div>
                  
                  <Button
                    variant={joinedCommunities.includes(community.id) ? "outline" : "default"}
                    size="sm"
                    className={joinedCommunities.includes(community.id) ? "border-primary/50" : ""}
                    onClick={(e) => handleJoinCommunity(e, community.id)}
                  >
                    {joinedCommunities.includes(community.id) ? "Joined" : "Join"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {isAuthenticated && joinedCommunities.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">YOUR COMMUNITIES</h3>
          <div className="space-y-3">
            {communities
              .filter(c => joinedCommunities.includes(c.id))
              .map(community => (
                <Link 
                  href={`/community/${community.id}`} 
                  key={`joined-${community.id}`}
                  className="block"
                >
                  <Card 
                    className="shadow-sm transition hover:shadow-md cursor-pointer border-l-4"
                    style={{ borderLeftColor: community.color || 'currentColor' }}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{community.name}</span>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{community.members.toLocaleString()} members</span>
                          </div>
                        </div>
                        
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => router.push('/community/create')}
        >
          <User className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      </div>
    </div>
  );
};

export default CommunityList;