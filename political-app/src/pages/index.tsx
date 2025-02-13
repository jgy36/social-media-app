import { useState } from "react";
import FeedTabs from "@/components/feed/FeedTabs";
import PostList from "@/components/feed/PostList";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Tab Switcher */}
      <FeedTabs onTabChange={setActiveTab} />

      {/* Show Posts Based on Selected Tab */}
      <PostList activeTab={activeTab} />
    </div>
  );
};

export default HomePage; 
