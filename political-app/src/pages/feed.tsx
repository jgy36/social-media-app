import { useState } from "react";
import FeedTabs from "@/components/feed/FeedTabs";
import PostList from "@/components/feed/PostList";
import Navbar from "@/components/navbar/Navbar"; // ✅ Add Navbar

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">(
    "for-you"
  );

  return (
    <div>
      {/* ✅ Show Navbar */}
      <Navbar />

      <div className="max-w-2xl mx-auto p-4">
        {/* ✅ Pass activeTab and onTabChange to FeedTabs */}
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ✅ Pass activeTab to PostList */}
        <PostList activeTab={activeTab} />
      </div>
    </div>
  );
};

export default FeedPage;
