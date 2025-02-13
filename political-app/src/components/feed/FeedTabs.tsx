import { useState } from "react";

interface FeedTabsProps {
  onTabChange: (tab: "for-you" | "following") => void;
}

const FeedTabs = ({ onTabChange }: FeedTabsProps) => {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">(
    "for-you"
  );

  const handleTabClick = (tab: "for-you" | "following") => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <div className="flex border-b border-gray-300">
      <button
        onClick={() => handleTabClick("for-you")}
        className={`w-1/2 p-3 text-center font-semibold ${
          activeTab === "for-you"
            ? "border-b-2 border-blue-500 text-blue-500"
            : "text-gray-500"
        }`}
      >
        For You
      </button>
      <button
        onClick={() => handleTabClick("following")}
        className={`w-1/2 p-3 text-center font-semibold ${
          activeTab === "following"
            ? "border-b-2 border-blue-500 text-blue-500"
            : "text-gray-500"
        }`}
      >
        Following
      </button>
    </div>
  );
};

export default FeedTabs;
