// src/components/layout/MainLayout.tsx
import { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Navbar from "@/components/navbar/Navbar";
import CommunitySidebar from "@/components/community/CommunitySidebar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isSidebarOpen = useSelector((state: RootState) => state.communities.isSidebarOpen);
  const isAuthenticated = useSelector((state: RootState) => !!state.user.token);
  const joinedCommunities = useSelector((state: RootState) => state.communities.joinedCommunities);
  
  const showSidebar = isAuthenticated && joinedCommunities.length > 0;
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <div className="flex flex-grow relative">
        {/* Community Sidebar */}
        {showSidebar && <CommunitySidebar />}
        
        {/* Main Content */}
        <main className={`flex-grow transition-all duration-300 ${
          showSidebar && isSidebarOpen ? "ml-64" : showSidebar ? "ml-16" : "ml-0"
        }`}>
          <div className="container mx-auto p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;