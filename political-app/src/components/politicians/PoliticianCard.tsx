import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { Politician } from "@/types/politician";

interface PoliticianCardProps {
  politician: Politician;
}

const PoliticianCard: React.FC<PoliticianCardProps> = ({ politician }) => {
  // Get party color
  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'republican':
        return 'bg-red-100 border-red-500';
      case 'democrat':
      case 'democratic':
        return 'bg-blue-100 border-blue-500';
      case 'independent':
        return 'bg-yellow-100 border-yellow-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };

  return (
    <Card className={`overflow-hidden shadow-md ${getPartyColor(politician.party)} border-l-4`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{politician.name}</CardTitle>
        <div className="text-sm text-gray-600">{politician.position}</div>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {politician.photoUrl ? (
            <div className="rounded-full h-16 w-16 overflow-hidden">
              <Image
                src={politician.photoUrl}
                alt={politician.name}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="rounded-full h-16 w-16 bg-gray-300 flex items-center justify-center text-gray-600">
              {politician.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <div className="font-medium">{politician.party}</div>
          <div className="text-sm">
            {politician.county ? `${politician.county}, ${politician.state}` : politician.state}
          </div>
          <div className="text-xs text-gray-500">
            {politician.yearsServed} {politician.yearsServed === 1 ? 'year' : 'years'} served
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoliticianCard;