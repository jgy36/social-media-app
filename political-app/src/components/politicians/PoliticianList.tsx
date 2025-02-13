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
