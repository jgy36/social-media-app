/*import { useEffect, useState } from "react";
import { fetchPoliticians } from "@/utils/api"; // ✅ Import API function
import type { Politician } from "@/types/politician";
import PoliticianCard from "./PoliticianCard";

const PoliticianList = () => {
  const [politicians, setPoliticians] = useState<Politician[]>([]);

  useEffect(() => {
    const loadPoliticians = async () => {
      const data = await fetchPoliticians();
      setPoliticians(data);
    };

    loadPoliticians();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {politicians.map((politician) => (
        <PoliticianCard key={politician.id} politician={politician} />
      ))}
    </div>
  );
};

export default PoliticianList;
*/
import PoliticianCard from "./PoliticianCard";

const PoliticianList = () => {
  // ✅ Mock Data (for now, replace later with API call)
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
    <div>
      {politicians.map((politician) => (
        <PoliticianCard key={politician.id} politician={politician} />
      ))}
    </div>
  );
};

export default PoliticianList;
