import { Politician } from "@/types/politician";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // ✅ Badge for Party Affiliation

const PoliticianCard = ({ politician }: { politician: Politician }) => {
  // ✅ Party Badge Colors
  const partyColors: Record<string, string> = {
    Democrat: "bg-blue-500 text-white",
    Republican: "bg-red-500 text-white",
    Libertarian: "bg-yellow-500 text-black",
    Independent: "bg-gray-500 text-white",
    Conservative: "bg-purple-500 text-white",
    Socialist: "bg-green-500 text-white",
  };

  return (
    <Card className="shadow-md transition hover:shadow-lg">
      <CardContent className="p-4">
        {/* ✅ Name & Party Badge */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">{politician.name}</h2>
          <Badge className={partyColors[politician.party] || "bg-muted text-foreground"}>
            {politician.party}
          </Badge>
        </div>

        {/* ✅ Position & State */}
        <p className="text-sm text-muted-foreground">Position: {politician.position}</p>
        <p className="text-sm text-muted-foreground">State: {politician.state}</p>
      </CardContent>
    </Card>
  );
};

export default PoliticianCard;
