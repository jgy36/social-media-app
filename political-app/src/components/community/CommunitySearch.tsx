// src/components/community/CommunitySearch.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/router";

interface CommunitySearchProps {
  onSearch: (query: string) => void;
}

const CommunitySearch = ({ onSearch }: CommunitySearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-sm font-medium text-muted-foreground">COMMUNITIES</h3>

      <div className="flex gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities"
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-8 h-9 w-full sm:w-auto min-w-[200px]"
          />
        </div>

        <Button size="sm" onClick={() => router.push("/community/create")}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </div>
    </div>
  );
};

export default CommunitySearch;