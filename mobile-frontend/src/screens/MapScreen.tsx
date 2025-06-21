// src/screens/MapScreen.tsx - Modern X-style Design
import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Politician } from "@/types/politician";
import { getAllRelevantPoliticians } from "@/api/politicians";
import PoliticianCard from "@/components/politicians/PoliticianCard";
import ElectionMap from "@/components/map/ElectionMap";

const MapScreen = () => {
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedFips, setSelectedFips] = useState<string>("");
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Function to fetch politicians data
  const fetchPoliticians = useCallback(
    async (county: string, state: string) => {
      if (!county || !state) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching politicians for ${county}, ${state}`);
        const relevantPoliticians = await getAllRelevantPoliticians(
          county,
          state
        );
        setPoliticians(relevantPoliticians);
      } catch (err) {
        console.error("Error fetching politicians:", err);
        setError("Failed to load politicians data. Please try again later.");
        setPoliticians([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Handle county selection from ElectionMap
  const handleCountySelected = useCallback(
    (county: string, state: string, fips: string) => {
      console.log(`County selected: ${county}, ${state}, FIPS: ${fips}`);
      setSelectedCounty(county);
      setSelectedState(state);
      setSelectedFips(fips);
    },
    []
  );

  // Track when map component mounts
  const handleMapComponentReady = useCallback(() => {
    console.log("📊 ElectionMap component is ready and visible");
    setMapLoaded(true);
  }, []);

  // Fetch politicians when county/state selection changes
  useEffect(() => {
    if (selectedCounty && selectedState) {
      fetchPoliticians(selectedCounty, selectedState);
    }
  }, [selectedCounty, selectedState, fetchPoliticians]);

  // Retry handler
  const handleRetry = useCallback(() => {
    if (selectedCounty && selectedState) {
      fetchPoliticians(selectedCounty, selectedState);
    }
  }, [selectedCounty, selectedState, fetchPoliticians]);

  return (
    <View className="flex-1 bg-black">
      {/* Header - X-style minimal */}
      <View className="bg-black/95 backdrop-blur-md pt-12 pb-4 px-4 border-b border-gray-800">
        <Text className="text-xl font-bold text-white">Representatives</Text>
        <Text className="text-gray-400 text-sm mt-1">
          Select a county to view local representatives
        </Text>
      </View>

      {/* Error Alert - Compact */}
      {error && (
        <View className="bg-red-950 border border-red-800 mx-4 mt-3 p-3 rounded-lg">
          <View className="flex-row items-center">
            <MaterialIcons name="error-outline" size={18} color="#ef4444" />
            <Text className="ml-2 text-red-400 text-sm font-medium">
              Error loading data
            </Text>
          </View>
          <TouchableOpacity onPress={handleRetry} className="mt-2">
            <Text className="text-blue-400 text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-1">
        {/* Map Container */}
        <View className="flex-1 m-3 rounded-xl overflow-hidden border border-gray-800">
          <ElectionMap onCountySelected={handleCountySelected} />
        </View>

        {/* Representatives List - Compact bottom section */}
        <View className="h-72 bg-gray-950 mx-3 mb-3 rounded-xl border border-gray-800">
          {/* Header */}
          <View className="px-4 py-3 border-b border-gray-800">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">
                  Representatives
                </Text>
                {selectedCounty && selectedState ? (
                  <Text className="text-gray-400 text-sm mt-0.5">
                    {selectedCounty}, {selectedState}
                  </Text>
                ) : (
                  <Text className="text-gray-500 text-sm mt-0.5">
                    Select a county to view representatives
                  </Text>
                )}
              </View>

              {/* Count indicator */}
              {politicians.length > 0 && (
                <View className="bg-blue-600 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-medium">
                    {politicians.length}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <ScrollView
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View className="flex-1 items-center justify-center py-8">
                <MaterialIcons
                  name="hourglass-empty"
                  size={32}
                  color="#3b82f6"
                />
                <Text className="mt-2 text-gray-400 text-sm">Loading...</Text>
              </View>
            ) : error ? (
              <View className="flex-1 items-center justify-center py-8">
                <MaterialIcons name="error-outline" size={32} color="#ef4444" />
                <Text className="text-red-400 text-center mt-2 text-sm">
                  {error}
                </Text>
                <TouchableOpacity
                  onPress={handleRetry}
                  className="bg-red-600 px-3 py-2 rounded-lg mt-3"
                >
                  <Text className="text-white text-sm font-medium">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : politicians.length > 0 ? (
              <>
                {politicians.map((politician, index) => (
                  <View key={politician.id || index} className="py-2">
                    <PoliticianCard politician={politician} />
                  </View>
                ))}
              </>
            ) : selectedCounty ? (
              <View className="flex-1 items-center justify-center py-8">
                <MaterialIcons name="how-to-vote" size={32} color="#6b7280" />
                <Text className="text-gray-400 text-center mt-2 text-sm">
                  No representatives found
                </Text>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-8">
                <MaterialIcons name="touch-app" size={32} color="#6b7280" />
                <Text className="text-gray-400 text-center text-sm">
                  Select a county on the map above
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default MapScreen;
