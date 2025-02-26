/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
mapboxgl.config.API_URL = "https://api.mapbox.com"; // ✅ Prevents telemetry CORS issue

interface ElectionMapProps {
  onCountySelected?: (county: string, state: string, fips: string) => void;
}

const ElectionMap = ({ onCountySelected }: ElectionMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapInitializedRef = useRef<boolean>(false);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [stateGeojson, setStateGeojson] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  // ✅ Fetch GeoJSON Data (Counties) - Only on mount
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch("/data/election-data.geojson");
        if (!response.ok) {
          throw new Error(`Failed to fetch election data: ${response.status}`);
        }
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
        setError(`Error loading election data: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    fetchGeoJSON();
    
    // ⚠️ CRITICAL: Only clean up map when component unmounts, not on every render
    return () => {
      if (mapRef.current) {
        console.log("Final cleanup - component unmounted");
        mapRef.current.remove();
        mapRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []);

  // ✅ Fetch State Borders GeoJSON - Only on mount
  useEffect(() => {
    const fetchStateGeoJSON = async () => {
      try {
        const response = await fetch("/data/us-states.geojson");
        if (!response.ok) {
          throw new Error(`Failed to fetch state data: ${response.status}`);
        }
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
        setError(`Error loading state borders: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    fetchStateGeoJSON();
  }, []);

  // Function to zoom to a county
  const zoomToCounty = useCallback((feature: any) => {
    if (!mapRef.current) {
      console.warn("Map not initialized, can't zoom");
      return;
    }
    
    try {
      console.log("Zooming to county:", feature.properties?.NAME);
      // Get the bounds of the county's geometry
      const coordinates = feature.geometry.coordinates[0];
      
      // Create a bounds object
      const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: number[]) => {
        return bounds.extend(coord as [number, number]);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      
      // Zoom to the bounds with some padding
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000 // Animation duration in milliseconds
      });
    } catch (error) {
      console.error("Error zooming to county:", error);
    }
  }, []);

  // Handle county selection - separated from map initialization
  const handleCountyClick = useCallback((event: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] | undefined }) => {
    if (!mapRef.current || !event.features || event.features.length === 0) return;
    
    const feature = event.features[0];
    const countyName = feature.properties?.NAME || "Unknown";
    const stateName = feature.properties?.state_name || "Unknown";
    const countyFips = feature.properties?.county_fips || "";
    
    console.log(`County clicked: ${countyName}, ${stateName}`);
    setSelectedCounty(countyName);
    setSelectedState(stateName);
    
    // Update the selected county highlight using both county name AND state name
    // This ensures we only highlight the specific county in the specific state
    mapRef.current.setFilter("selected-county", [
      "all",
      ["==", "NAME", countyName],
      ["==", "state_name", stateName]
    ]);
    
    // Zoom to the clicked county
    zoomToCounty(feature);
    
    // Call the callback if provided
    if (onCountySelected) {
      onCountySelected(countyName, stateName, countyFips);
    }
  }, [onCountySelected, zoomToCounty]);

  // Initialize map and set up layers when data is available
  useEffect(() => {
    // Only proceed if we have both data sources and the container
    if (!mapContainerRef.current || !geojsonData || !stateGeojson) {
      return;
    }
    
    // Skip if map is already initialized
    if (mapInitializedRef.current) {
      return;
    }
    
    try {
      if (!mapRef.current) {
        console.log("Creating new map instance");
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/light-v10",
          center: [-98.5795, 39.8283], // Center of the U.S.
          zoom: 4.5,
          preserveDrawingBuffer: true // May help with stability
        });

        mapRef.current = map;
        
        // Set up error handler
        map.on('error', (e) => {
          console.error('Mapbox error:', e);
          setError(`Mapbox error: ${e.error?.message || 'Unknown error'}`);
        });

        // Wait for map to load before setting up layers
        map.on("load", () => {
          console.log("Map loaded");
          
          // Add county data source
          map.addSource("election-data", {
            type: "geojson",
            data: geojsonData,
          });

          // Add county fill layer
          map.addLayer({
            id: "election-layer",
            type: "fill",
            source: "election-data",
            paint: {
              "fill-color": ["get", "fill_color"],
              "fill-opacity": 0.7,
              "fill-outline-color": "#000000",
            },
          });

          // Add selected county highlight layer with WHITE color instead of yellow
          map.addLayer({
            id: "selected-county",
            type: "line",
            source: "election-data",
            paint: {
              "line-color": "#FFFFFF", // Changed from yellow to white
              "line-width": 3,
              "line-opacity": 1, // Full opacity for better visibility
            },
            filter: ["==", "NAME", ""], // Initial filter with no counties selected
          });

          // Add state borders source and layer
          map.addSource("state-borders", {
            type: "geojson",
            data: stateGeojson,
          });

          map.addLayer({
            id: "state-border-layer",
            type: "line",
            source: "state-borders",
            layout: {},
            paint: {
              "line-color": "#000000", // Static black border
              "line-width": 2,
            },
          });

          // Set up event handlers
          map.on("mousemove", "election-layer", (event) => {
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

          map.on("mouseleave", "election-layer", () => {
            setTooltip(null);
          });

          map.on("click", "election-layer", handleCountyClick);
          
          // Mark map as initialized
          mapInitializedRef.current = true;
          setLoading(false);
          console.log("Map initialization complete");
        });
      }
    } catch (err) {
      console.error("Error initializing map:", err);
      setError(`Error initializing map: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [geojsonData, stateGeojson, handleCountyClick, zoomToCounty]);

  // If there's an error, display it
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        <h3 className="font-bold">Map Error</h3>
        <p>{error}</p>
        <p className="mt-2">Please check your browser console for more details.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          marginTop: "10px",
        }}
      >
        2020 U.S. Election Results by County
      </h1>
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-2">Loading map data...</p>
          </div>
        </div>
      )}
      
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "80vh", border: "1px solid black" }}
      />
      
      {/* Tooltip for County Name */}
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
            zIndex: 100,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default ElectionMap;