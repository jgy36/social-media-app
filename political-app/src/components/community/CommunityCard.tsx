// src/components/community/CommunityCard.tsx
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp } from "lucide-react";
import { safeNavigate } from "@/utils/routerHistoryManager";

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string;
    members: number;
    trending?: boolean;
    color?: string;
    isJoined?: boolean;
  };
  onJoin: (e: React.MouseEvent, communityId: string) => void;
}

const CommunityCard = ({ community, onJoin }: CommunityCardProps) => {
  const router = useRouter();

  // Navigate to community page
  const handleNavigate = () => {
    safeNavigate(router, `/community/${community.id}`);
  };

  return (
    <div
      key={community.id}
      className="block cursor-pointer"
      onClick={handleNavigate}
      data-testid={`community-card-${community.id}`}
    >
      <Card
        className="shadow-sm hover:shadow-md transition-shadow border-l-4"
        style={{ borderLeftColor: community.color || "var(--primary)" }}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-base font-medium mr-2">{community.name}</h3>
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
                <span>{community.members.toLocaleString()} members</span>
              </div>
            </div>

            <Button
              variant={community.isJoined ? "outline" : "default"}
              size="sm"
              className={community.isJoined ? "border-primary/50" : ""}
              onClick={(e) => onJoin(e, community.id)}
            >
              {community.isJoined ? "Joined" : "Join"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityCard;