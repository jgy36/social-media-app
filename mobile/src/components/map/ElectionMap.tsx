// src/components/map/ElectionMap.tsx
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from "react-native";
import { Map as MapIcon, Search } from "react-native-vector-icons/Feather";

// Note: For a full map implementation, you would need react-native-maps or react-native-mapbox-gl
// This is a simplified version that shows county selection

interface ElectionMapProps {
  onCountySelected?: (county: string, state: string, fips: string) => void;
}

interface CountyData {
  name: string;
  state: string;
  fips: string;
  per_gop: number;
  per_dem: number;
}

const ElectionMap = ({ onCountySelected }: ElectionMapProps) => {
  const [counties, setCounties] = useState<CountyData[]>([]);
  const [filteredCounties, setFilteredCounties] = useState<CountyData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading county data
    const loadCountyData = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch from your actual election data
        // For now, we'll create some mock data
        const mockCounties: CountyData[] = [
          { name: "Kent County", state: "Michigan", fips: "26081", per_gop: 0.45, per_dem: 0.55 },
          { name: "Ottawa County", state: "Michigan", fips: "26139", per_gop: 0.60, per_dem: 0.40 },
          { name: "Wayne County", state: "Michigan", fips: "26163", per_gop: 0.25, per_dem: 0.75 },
          // Add more counties as needed
        ];
        
        setCounties(mockCounties);
        setFilteredCounties(mockCounties);
      } catch (err) {
        setError("Failed to load election data");
      } finally {
        setLoading(false);
      }
    };

    loadCountyData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = counties.filter(county =>
        county.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        county.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCounties(filtered);
    } else {
      setFilteredCounties(counties);
    }
  }, [searchQuery, counties]);

  const handleCountySelect = (county: CountyData) => {
    setSelectedCounty(county.name);
    onCountySelected?.(county.name, county.state, county.fips);
  };

  const getPartyColor = (per_gop: number, per_dem: number) => {
    if (per_gop > per_dem) {
      return "bg-red-500";
    } else {
      return "bg-blue-500";
    }
  };

  const getPartyStrength = (per_gop: number, per_dem: number) => {
    const stronger = per_gop > per_dem ? "Republican" : "Democratic";
    const percentage = Math.max(per_gop, per_dem) * 100;
    return `${stronger} (${percentage.toFixed(1)}%)`;
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-lg font-bold mb-2">Map Error</Text>
        <Text className="text-gray-700 dark:text-gray-300 text-center">{error}</Text>
        <TouchableOpacity
          onPress={() => window.location.reload()}
          className="mt-4 bg-blue-500 px-4 py-2 rounded-md"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Election Results by County
        </Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-md p-3">
          <Search name="search" size={20} color="gray" className="mr-3" />
          <TextInput
            placeholder="Search counties..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-gray-900 dark:text-white"
          />
        </View>
      </View>

      {/* Notice about map implementation */}
      <View className="bg-blue-50 dark:bg-blue-900 p-4 mx-4 mt-4 rounded-md">
        <Text className="text-blue-800 dark:text-blue-300 text-sm">
          This is a simplified county list. In a full implementation, you would see an interactive map here.
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading election data...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCounties}
          keyExtractor={(item) => item.fips}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleCountySelect(item)}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                selectedCounty === item.name ? "bg-blue-50 dark:bg-blue-900" : ""
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {item.name}, {item.state}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {getPartyStrength(item.per_gop, item.per_dem)}
                  </Text>
                </View>
                <View className={`w-4 h-4 rounded-full ${getPartyColor(item.per_gop, item.per_dem)}`} />
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ElectionMap;