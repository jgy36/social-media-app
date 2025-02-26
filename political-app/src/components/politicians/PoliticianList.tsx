// components/politicians/PoliticianList.tsx
import React from 'react';
import PoliticianCard from './PoliticianCard';
import { Politician } from '@/types/politician';

interface PoliticianListProps {
  politicians: Politician[];
  selectedCounty: string;
  selectedState: string;
  isLoading: boolean;
}

const PoliticianList: React.FC<PoliticianListProps> = ({
  politicians,
  selectedCounty,
  selectedState,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2">Loading politicians...</p>
      </div>
    );
  }

  if (!selectedCounty) {
    return (
      <div className="p-4 text-center">
        <p>Select a county on the map to view politicians</p>
      </div>
    );
  }

  if (politicians.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No politicians found for {selectedCounty}, {selectedState}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Politicians for {selectedCounty}, {selectedState}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pb-4">
        {politicians.map((politician) => (
          <PoliticianCard key={politician.id} politician={politician} />
        ))}
      </div>
    </div>
  );
};

export default PoliticianList;