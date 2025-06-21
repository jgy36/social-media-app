// src/components/community/JoinedCommunityCard.tsx
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { safeNavigate } from "@/utils/routerHistoryManager";

interface JoinedCommunityCardProps {
  community: {
    id: string;
    name: string;
    members: number;
    color?: string;
  };
  onLeave: (e: React.MouseEvent, communityId: string) => void;
}

const JoinedCommunityCard = ({ community, onLeave }: JoinedCommunityCardProps) => {
  const router = useRouter();

  // Navigate to community page
  const handleNavigate = () => {
    safeNavigate(router, `/community/${community.id}`);
  };

  return (
    <div
      key={`joined-${community.id}`}
      className="block cursor-pointer"
      onClick={handleNavigate}
    >
      <Card
        className="shadow-sm hover:shadow-md transition-shadow border-l-4"
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
                <span>{community.members.toLocaleString()} members</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onLeave(e, community.id);
              }}
            >
              Leave
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinedCommunityCard;