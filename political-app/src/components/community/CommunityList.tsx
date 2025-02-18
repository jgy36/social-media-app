import { Card, CardContent } from "@/components/ui/card";

const communities = ["Democrat", "Republican", "Libertarian", "Independent", "Conservative", "Socialist"];

const CommunityList = () => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-3">Communities</h2>
      <div className="space-y-2">
        {communities.map((community) => (
          <Card key={community} className="shadow-sm transition hover:shadow-md">
            <CardContent className="p-3 text-sm font-medium">{community}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityList;
