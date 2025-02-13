import { Politician } from "@/types/politician";

const PoliticianCard = ({ politician }: { politician: Politician }) => {
  return (
    <div className="border p-4 rounded shadow-md bg-white">
      <h2 className="text-lg font-bold">{politician.name}</h2>
      <p>Party: {politician.party}</p>
      <p>Position: {politician.position}</p>
    </div>
  );
};

export default PoliticianCard;
