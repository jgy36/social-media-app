import dynamic from "next/dynamic";

// ✅ Dynamically Import ElectionMap to Disable SSR
const ElectionMap = dynamic(() => import("@/components/map/ElectionMap"), {
  ssr: false,
});

const MapPage = () => {
  return (
    <div className="w-full h-screen">
      <h1 className="text-2xl font-bold text-center mt-4">Election Map</h1>
      <ElectionMap />
    </div>
  );
};

export default MapPage;
