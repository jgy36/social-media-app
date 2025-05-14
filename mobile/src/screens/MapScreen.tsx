// src/screens/MapScreen.tsx
import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { Politician } from "@/types/politician";
import { getAllRelevantPoliticians } from "@/api/politicians";
import PoliticianCard from "@/components/politicians/PoliticianCard";

const MapScreen = () => {
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch politicians data
  const fetchPoliticians = useCallback(async (county: string, state: string) => {
    if (!county || !state) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching politicians for ${county}, ${state}`);
      const relevantPoliticians = await getAllRelevantPoliticians(county, state);
      setPoliticians(relevantPoliticians);
    } catch (err) {
      console.error("Error fetching politicians:", err);
      setError("Failed to load politicians data. Please try again later.");
      setPoliticians([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle county selection from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'countySelected') {
        setSelectedCounty(data.county);
        setSelectedState(data.state);
        fetchPoliticians(data.county, data.state);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // HTML content for the map WebView
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>US Map</title>
        <script src="https://d3js.org/d3.v5.min.js"></script>
        <script src="https://d3js.org/topojson.v1.min.js"></script>
        <style>
            body { margin: 0; padding: 0; background: #f5f5f5; }
            .county { stroke: #fff; stroke-width: 0.5px; cursor: pointer; }
            .county:hover { stroke: #000; stroke-width: 1px; }
            .selected { fill: #3b82f6 !important; }
            #map { width: 100%; height: 100vh; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // You would need to implement a proper D3.js map here
            // This is a simplified placeholder
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            const svg = d3.select("#map")
                .append("svg")
                .attr("width", width)
                .attr("height", height);
            
            // Add click handler for counties
            svg.on("click", function() {
                // Mock data - in real implementation, you'd use actual county data
                const mockCounty = "Example County";
                const mockState = "Example State";
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'countySelected',
                    county: mockCounty,
                    state: mockState
                }));
            });
            
            // Add some mock counties as circles for demonstration
            const counties = [
                {name: "Los Angeles County", state: "California", x: 100, y: 200},
                {name: "Cook County", state: "Illinois", x: 300, y: 150},
                {name: "Harris County", state: "Texas", x: 250, y: 300}
            ];
            
            svg.selectAll(".county")
                .data(counties)
                .enter()
                .append("circle")
                .attr("class", "county")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 20)
                .attr("fill", "#e5e7eb")
                .on("click", function(d) {
                    svg.selectAll(".county").classed("selected", false);
                    d3.select(this).classed("selected", true);
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'countySelected',
                        county: d.name,
                        state: d.state
                    }));
                });
            
            // Add labels
            svg.selectAll(".label")
                .data(counties)
                .enter()
                .append("text")
                .attr("x", d => d.x)
                .attr("y", d => d.y - 25)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-family", "Arial")
                .text(d => d.name);
        </script>
    </body>
    </html>
  `;

  // Retry handler
  const handleRetry = useCallback(() => {
    if (selectedCounty && selectedState) {
      fetchPoliticians(selectedCounty, selectedState);
    }
  }, [selectedCounty, selectedState, fetchPoliticians]);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          Political Representatives
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center mt-1">
          Tap on any county to view local and state representatives
        </Text>
      </View>

      {/* Network error alert */}
      {error && (
        <View className="bg-red-50 dark:bg-red-900 p-4 m-4 rounded-lg">
          <View className="flex-row items-center">
            <MaterialIcons name="error-outline" size={24} color="#DC2626" />
            <Text className="ml-2 text-red-800 dark:text-red-200 font-medium">
              Error
            </Text>
          </View>
          <Text className="text-red-600 dark:text-red-300 mt-1">{error}</Text>
        </View>
      )}

      <View className="flex-1">
        {/* Map Container */}
        <View className="flex-2 bg-white dark:bg-gray-900 m-4 rounded-lg overflow-hidden">
          <WebView
            source={{ html: mapHTML }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-2 text-gray-500">Loading map...</Text>
              </View>
            )}
          />
        </View>

        {/* Politicians List */}
        <View className="flex-1 bg-white dark:bg-gray-900 mx-4 mb-4 rounded-lg">
          <View className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Representatives
            </Text>
            {selectedCounty && selectedState && (
              <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedCounty}, {selectedState}
              </Text>
            )}
          </View>

          <ScrollView className="flex-1 p-4">
            {isLoading ? (
              <View className="flex-1 items-center justify-center py-8">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-2 text-gray-500 dark:text-gray-400">
                  Loading politicians...
                </Text>
              </View>
            ) : error ? (
              <View className="flex-1 items-center justify-center py-8">
                <MaterialIcons name="error-outline" size={48} color="#EF4444" />
                <Text className="text-red-500 text-center mt-2">{error}</Text>
                <TouchableOpacity
                  onPress={handleRetry}
                  className="bg-red-500 px-4 py-2 rounded-lg mt-4"
                >
                  <Text className="text-white font-medium">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : politicians.length > 0 ? (
              politicians.map((politician) => (
                <View key={politician.id} className="mb-4">
                  <PoliticianCard politician={politician} />
                </View>
              ))
            ) : selectedCounty ? (
              <View className="flex-1 items-center justify-center py-8">
                <MaterialIcons name="how-to-vote" size={48} color="#6B7280" />
                <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                  No representatives found for this area
                </Text>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-8">
                <MaterialIcons name="map" size={48} color="#6B7280" />
                <Text className="text-gray-500 dark:text-gray-400 text-center">
                  Select a county on the map to view representatives
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