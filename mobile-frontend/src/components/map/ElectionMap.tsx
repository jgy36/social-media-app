// src/components/map/ElectionMap.tsx - Using react-native-maps
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import MapView, { Polygon, Region } from "react-native-maps";

interface ElectionMapProps {
  onCountySelected?: (county: string, state: string, fips: string) => void;
}

interface CountyData {
  name: string;
  state: string;
  fips: string;
  per_gop: number;
  per_dem: number;
  total_votes?: number;
  gop_votes?: number;
  dem_votes?: number;
  coordinates: Array<{ latitude: number; longitude: number }>;
}

const { width, height } = Dimensions.get("window");

const ElectionMap = ({ onCountySelected }: ElectionMapProps) => {
  const [counties, setCounties] = useState<CountyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<{
    name: string;
    state: string;
    fips: string;
  } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState<Region>({
    latitude: 39.8283,
    longitude: -98.5795,
    latitudeDelta: 20,
    longitudeDelta: 20,
  });

  // Color interpolation function
  const getColorForPercentage = useCallback(
    (perGop: number, perDem: number) => {
      if (perGop > perDem) {
        const intensity = Math.min(Math.max(perGop, 0.3), 0.9);
        return `rgba(255, 0, 0, ${intensity})`; // Red for Republican
      } else {
        const intensity = Math.min(Math.max(perDem, 0.3), 0.9);
        return `rgba(0, 0, 255, ${intensity})`; // Blue for Democratic
      }
    },
    []
  );

  // Convert GeoJSON coordinates to React Native Maps format
  const convertGeoJSONToPolygon = useCallback((geometry: any) => {
    if (!geometry || !geometry.coordinates) return [];

    // Handle different geometry types
    let coords = geometry.coordinates;

    // For MultiPolygon, take the first polygon
    if (geometry.type === "MultiPolygon") {
      coords = coords[0];
    }

    // For Polygon, take the outer ring (first array)
    if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
      coords = coords[0];
    }

    // Convert [longitude, latitude] to {latitude, longitude}
    return coords.map((coord: number[]) => ({
      latitude: coord[1],
      longitude: coord[0],
    }));
  }, []);

  // Load election data
  const loadElectionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load actual data first
      let electionData;
      try {
        electionData = require("../../../assets/data/election-data.json");
        console.log("✅ Loaded election data from assets");
      } catch (requireError) {
        console.log("Using mock data...");
        // Fallback to mock data
        electionData = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                NAME: "Kent County",
                state_name: "Michigan",
                county_fips: "26081",
                per_gop: 0.45,
                per_dem: 0.55,
                total_votes: 350000,
              },
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [-85.6681, 42.9634],
                    [-85.6681, 43.0634],
                    [-85.5681, 43.0634],
                    [-85.5681, 42.9634],
                    [-85.6681, 42.9634],
                  ],
                ],
              },
            },
            {
              type: "Feature",
              properties: {
                NAME: "Ottawa County",
                state_name: "Michigan",
                county_fips: "26139",
                per_gop: 0.62,
                per_dem: 0.38,
                total_votes: 180000,
              },
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [-86.0681, 42.8634],
                    [-86.0681, 42.9634],
                    [-85.9681, 42.9634],
                    [-85.9681, 42.8634],
                    [-86.0681, 42.8634],
                  ],
                ],
              },
            },
            {
              type: "Feature",
              properties: {
                NAME: "Los Angeles County",
                state_name: "California",
                county_fips: "06037",
                per_gop: 0.32,
                per_dem: 0.68,
                total_votes: 5200000,
              },
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [-118.5, 34.0],
                    [-118.5, 34.5],
                    [-118.0, 34.5],
                    [-118.0, 34.0],
                    [-118.5, 34.0],
                  ],
                ],
              },
            },
          ],
        };
      }

      if (!electionData.features || !Array.isArray(electionData.features)) {
        throw new Error("Invalid GeoJSON format");
      }

      // Process features into county data
      const processedCounties: CountyData[] = electionData.features
        .map((feature: any) => {
          const properties = feature.properties || {};
          const coordinates = convertGeoJSONToPolygon(feature.geometry);

          if (coordinates.length === 0) return null;

          return {
            name: properties.NAME || properties.name || "Unknown County",
            state:
              properties.state_name ||
              properties.STATE_NAME ||
              properties.state ||
              "Unknown State",
            fips:
              properties.county_fips ||
              properties.FIPS ||
              properties.fips ||
              "unknown",
            per_gop: parseFloat(properties.per_gop || properties.PER_GOP || 0),
            per_dem: parseFloat(properties.per_dem || properties.PER_DEM || 0),
            total_votes: parseInt(
              properties.total_votes || properties.TOTAL_VOTES || 0
            ),
            gop_votes: parseInt(
              properties.gop_votes || properties.GOP_VOTES || 0
            ),
            dem_votes: parseInt(
              properties.dem_votes || properties.DEM_VOTES || 0
            ),
            coordinates,
          };
        })
        .filter(
          (county: CountyData | null): county is CountyData =>
            county !== null && county.name !== "Unknown County"
        );

      setCounties(processedCounties);
      console.log(`Processed ${processedCounties.length} counties`);
    } catch (err) {
      console.error("Error loading election data:", err);
      setError(
        `Failed to load map data: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [convertGeoJSONToPolygon]);

  useEffect(() => {
    loadElectionData();
  }, [loadElectionData]);

  // Handle county selection
  const handleCountyPress = useCallback(
    (county: CountyData) => {
      setSelectedCounty({
        name: county.name,
        state: county.state,
        fips: county.fips,
      });

      // Zoom to the selected county
      if (county.coordinates.length > 0) {
        const latitudes = county.coordinates.map((coord) => coord.latitude);
        const longitudes = county.coordinates.map((coord) => coord.longitude);

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        setRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.5,
          longitudeDelta: (maxLng - minLng) * 1.5,
        });
      }

      onCountySelected?.(county.name, county.state, county.fips);
    },
    [onCountySelected]
  );

  // Search functionality
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    const foundCounty = counties.find(
      (county) =>
        county.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        county.state.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundCounty) {
      handleCountyPress(foundCounty);
    } else {
      Alert.alert("Not Found", `No county found matching "${searchQuery}"`);
    }
  }, [searchQuery, counties, handleCountyPress]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Map Loading Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadElectionData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading election map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Container */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        mapType="standard"
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {counties.map((county) => (
          <Polygon
            key={`${county.fips}-${county.name}`}
            coordinates={county.coordinates}
            fillColor={getColorForPercentage(county.per_gop, county.per_dem)}
            strokeColor={
              selectedCounty?.fips === county.fips ? "#FFFFFF" : "#000000"
            }
            strokeWidth={selectedCounty?.fips === county.fips ? 3 : 0.5}
            onPress={() => handleCountyPress(county)}
          />
        ))}
      </MapView>

      {/* Search Toggle Button */}
      <TouchableOpacity
        style={styles.searchToggle}
        onPress={() => setShowSearch(!showSearch)}
      >
        <Feather name="search" size={24} color="white" />
      </TouchableOpacity>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search counties..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Feather name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Selected County Info */}
      {selectedCounty && (
        <View style={styles.selectedCountyContainer}>
          <View style={styles.selectedCountyInfo}>
            <Text style={styles.selectedCountyName}>{selectedCounty.name}</Text>
            <Text style={styles.selectedCountyState}>
              {selectedCounty.state}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedCounty(null)}
          >
            <Feather name="x" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => {
            setRegion({
              latitude: 39.8283,
              longitude: -98.5795,
              latitudeDelta: 20,
              longitudeDelta: 20,
            });
            setSelectedCounty(null);
          }}
        >
          <Feather name="home" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Data Info */}
      <View style={styles.dataInfo}>
        <Text style={styles.dataInfoText}>
          {counties.length} counties loaded
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  searchToggle: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "#3B82F6",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  searchContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 80,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    margin: 3,
  },
  selectedCountyContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  selectedCountyInfo: {
    flex: 1,
  },
  selectedCountyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  selectedCountyState: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  zoomControls: {
    position: "absolute",
    bottom: 40,
    right: 20,
  },
  zoomButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dataInfo: {
    position: "absolute",
    top: 120,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dataInfoText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ElectionMap;
