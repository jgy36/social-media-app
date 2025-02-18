import { Card, CardContent } from "@/components/ui/card";
import PoliticianCard from "./PoliticianCard";

const PoliticianList = () => {
  // ✅ Mock Data (Replace later with API call)
  const politicians = [
    {
      id: 1,
      name: "John Doe",
      party: "Independent",
      state: "California",
      position: "Senator",
      yearsServed: 6,
      termStart: "2015-01-03",
      termEnd: "2021-01-03",
    },
    {
      id: 2,
      name: "Jane Smith",
      party: "Democrat",
      state: "New York",
      position: "Governor",
      yearsServed: 4,
      termStart: "2019-01-01",
      termEnd: "2023-01-01",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {politicians.map((politician) => (
        <Card key={politician.id} className="shadow-md transition hover:shadow-lg">
          <CardContent className="p-4">
            <PoliticianCard politician={politician} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PoliticianList;
