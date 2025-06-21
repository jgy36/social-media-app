// src/components/community/CommunitySearch.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useToast } from "@/hooks/use-toast"; // Import the toast hook

interface CommunitySearchProps {
  onSearch: (query: string) => void;
}

const CommunitySearch = ({ onSearch }: CommunitySearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { toast } = useToast(); // Get the toast function
  
  // Get user role from Redux state
  const user = useSelector((state: RootState) => state.user);
  const isAdmin = user.role === "ADMIN";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleCreateButtonClick = () => {
    if (isAdmin) {
      // If admin, navigate to create page
      router.push("/community/create");
    } else {
      // If not admin, show toast notification
      toast({
        title: "Permission Denied",
        description: "Only administrator accounts can create new communities.",
        variant: "destructive", // Use destructive variant for errors/warnings
        duration: 3000, // Show for 3 seconds
      });
    }
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

        {/* Show button to everyone but handle clicks differently */}
        <Button size="sm" onClick={handleCreateButtonClick}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </div>
    </div>
  );
};

export default CommunitySearch;