// src/components/community/CommunitySidebar.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { toggleSidebar } from "@/redux/slices/communitySlice";
import { 
  Users, 
  ChevronLeft,
  ChevronRight,
  Home,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllCommunities } from "@/api/communities";
import { safeNavigate } from "@/utils/routerHistoryManager";

interface Community {
  id: string;
  name: string;
  color?: string;
}

const CommunitySidebar = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const isAuthenticated = useSelector((state: RootState) => !!state.user.token);
  const joinedCommunityIds = useSelector((state: RootState) => state.communities.joinedCommunities);
  const isSidebarOpen = useSelector((state: RootState) => state.communities.isSidebarOpen);
  
  const activeRouteId = router.query.id as string;

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const allCommunities = await getAllCommunities();
        
        // Filter to just joined communities and map to simplified structure
        const joinedCommunities = allCommunities
          .filter(community => joinedCommunityIds.includes(community.id))
          .map(community => ({
            id: community.id,
            name: community.name,
            color: community.color
          }));
        
        setCommunities(joinedCommunities);
      } catch (error) {
        console.error("Error fetching communities for sidebar:", error);
        
        // Fallback to just IDs if API fails
        setCommunities(
          joinedCommunityIds.map(id => ({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
            color: '#333333'
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchCommunities();
    }
  }, [joinedCommunityIds, isAuthenticated]);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };
  
  // Safe navigation to community
  const navigateToCommunity = (communityId: string) => {
    console.log(`Sidebar navigating to community: ${communityId}`);
    // Use the safe navigation function from routerHistoryManager
    safeNavigate(router, `/community/${communityId}`);
  };
  
  if (!isAuthenticated || joinedCommunityIds.length === 0) {
    return null; // Don't show sidebar if not logged in or no communities joined
  }

  return (
    <div 
      className={`fixed left-0 top-16 h-full bg-background border-r border-border transition-all duration-300 z-20 ${
        isSidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="p-2 flex flex-col h-full">
        {/* Toggle button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="self-end mb-4"
          onClick={handleToggleSidebar}
        >
          {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
        
        {/* Home link */}
        <Link href="/feed" className="mb-4">
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${router.pathname === "/feed" ? "bg-accent text-accent-foreground" : ""}`}
          >
            <Home className="mr-2 h-4 w-4" />
            {isSidebarOpen && <span>Home</span>}
          </Button>
        </Link>
        
        {/* Communities label */}
        {isSidebarOpen && (
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Your Communities
          </div>
        )}
        
        {/* Communities list */}
        <div className="overflow-y-auto flex-1 space-y-1">
          {loading ? (
            // Loading skeleton
            <>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="px-2 py-1.5">
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </>
          ) : (
            // Communities list
            <>
              {communities.map(community => (
                <div 
                  key={community.id}
                  className="block cursor-pointer"
                  onClick={() => navigateToCommunity(community.id)}
                  data-testid={`sidebar-community-${community.id}`}
                >
                  <div 
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      activeRouteId === community.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-3 flex-shrink-0" 
                      style={{ backgroundColor: community.color || 'var(--primary)' }}
                    ></div>
                    
                    {isSidebarOpen ? (
                      <span className="truncate">{community.name}</span>
                    ) : (
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-muted">
                        {community.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        
        {/* Create community button */}
        <Link href="/community" className="mt-4 block">
          <Button 
            variant="outline" 
            className="w-full justify-start"
          >
            <Users className="mr-2 h-4 w-4" />
            {isSidebarOpen && <span>All Communities</span>}
          </Button>
        </Link>
        
        <Link href="/community/create" className="mt-2 block">
          <Button 
            variant="default" 
            className="w-full justify-start"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isSidebarOpen && <span>Create Community</span>}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CommunitySidebar;