import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar"; // ✅ Add Navbar

// ✅ Dynamically Import ElectionMap to Disable SSR
const ElectionMap = dynamic(() => import("@/components/map/ElectionMap"), {
  ssr: false,
});

const MapPage = () => {
  return (
    <div>
      <Navbar />
      <div className="w-full h-screen">
        <h1 className="text-2xl font-bold text-center mt-4">Election Map</h1>
        <ElectionMap />
      </div>
    </div>
  );
};

export default MapPage;
