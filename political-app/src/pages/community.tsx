import Navbar from "@/components/navbar/Navbar";
import CommunityList from "@/components/community/CommunityList";
import LearnSection from "@/components/community/LearnSection";

const Community = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Community</h1>
        <CommunityList />
        <LearnSection />
      </div>
    </div>
  );
};

export default Community;
