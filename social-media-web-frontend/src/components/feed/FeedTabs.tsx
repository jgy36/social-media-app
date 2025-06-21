interface FeedTabsProps {
  activeTab: "for-you" | "following" | "communities";
  onTabChange: (tab: "for-you" | "following" | "communities") => void;
}

const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-around border-b pb-2">
      <button
        className={`px-4 py-2 ${activeTab === "for-you" ? "font-bold" : ""}`}
        onClick={() => onTabChange("for-you")}
      >
        For You
      </button>
      <button
        className={`px-4 py-2 ${activeTab === "following" ? "font-bold" : ""}`}
        onClick={() => onTabChange("following")}
      >
        Following
      </button>
      <button
        className={`px-4 py-2 ${activeTab === "communities" ? "font-bold" : ""}`}
        onClick={() => onTabChange("communities")}
      >
        Communities
      </button>
    </div>
  );
};

export default FeedTabs;