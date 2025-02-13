/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
mapboxgl.config.API_URL = "https://api.mapbox.com"; // ✅ Prevents telemetry CORS issue

const ElectionMap = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [stateGeojson, setStateGeojson] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // 🔹 Function to interpolate colors based on percentage
  const getColorForPercentage = (perGop: number, perDem: number) => {
    if (perGop > perDem) {
      const intensity = Math.round(perGop * 255); // Scale from 0 to 255
      return `rgb(${intensity}, 0, 0)`; // Shades of Red
    } else {
      const intensity = Math.round(perDem * 255);
      return `rgb(0, 0, ${intensity})`; // Shades of Blue
    }
  };

  // ✅ Fetch GeoJSON Data (Counties)
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch("/data/election-data.geojson");
        const data = await response.json();

        // ✅ Apply Smooth Color Gradient
        data.features.forEach((feature: any) => {
          const perGop = feature.properties.per_gop || 0;
          const perDem = feature.properties.per_dem || 0;
          feature.properties.fill_color = getColorForPercentage(perGop, perDem);
        });

        setGeojsonData(data);
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
      }
    };

    fetchGeoJSON();
  }, []);

  // ✅ Fetch State Borders GeoJSON
  useEffect(() => {
    const fetchStateGeoJSON = async () => {
      try {
        const response = await fetch("/data/us-states.geojson");
        const data = await response.json();

        // ✅ Ensure each state has a unique id
        data.features.forEach((feature: any, index: number) => {
          if (!feature.id) {
            feature.id = feature.properties.GEOID || index; // Assign GEOID or fallback to index
          }
        });

        setStateGeojson(data);
      } catch (error) {
        console.error("Error loading State Borders GeoJSON:", error);
      }
    };

    fetchStateGeoJSON();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || geojsonData === null || stateGeojson === null) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/light-v10",
      center: [-98.5795, 39.8283], // 🇺🇸 Center of the U.S.
      zoom: 4.5,
    });

    mapInstance.on("load", () => {
      // ✅ Add County Layer
      mapInstance.addSource("election-data", {
        type: "geojson",
        data: geojsonData,
      });

      mapInstance.addLayer({
        id: "election-layer",
        type: "fill",
        source: "election-data",
        paint: {
          "fill-color": ["get", "fill_color"],
          "fill-opacity": 0.7,
          "fill-outline-color": "#000000",
        },
      });

      // ✅ Add State Borders Layer (WITHOUT Hover Effect)
      mapInstance.addSource("state-borders", {
        type: "geojson",
        data: stateGeojson,
      });

      mapInstance.addLayer({
        id: "state-border-layer",
        type: "line",
        source: "state-borders",
        layout: {},
        paint: {
          "line-color": "#000000", // Static black border
          "line-width": 2,
        },
      });

      // ✅ Mousemove event for hover tooltip
      mapInstance.on("mousemove", "election-layer", (event) => {
        if (event.features && event.features.length > 0) {
          const countyName = event.features[0].properties?.NAME || "Unknown";
          const stateName = event.features[0].properties?.state_name || "Unknown";
          setTooltip({
            x: event.point.x,
            y: event.point.y,
            content: `${countyName}, ${stateName}`,
          });
        }
      });

      // ✅ Hide tooltip when not hovering
      mapInstance.on("mouseleave", "election-layer", () => {
        setTooltip(null);
      });

      setMap(mapInstance);
    });

    return () => mapInstance.remove();
  }, [geojsonData, stateGeojson]);

  return (
    <div>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          marginTop: "10px",
        }}
      >
        Election Map
      </h1>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "80vh", border: "1px solid black" }}
      />
      
      {/* ✅ Tooltip for County Name */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "6px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            pointerEvents: "none",
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default ElectionMap;
