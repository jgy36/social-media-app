// src/components/politicians/PoliticianList.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import PoliticianCard from "./PoliticianCard";
import { Politician } from "@/types/politician";
import { Feather } from "@expo/vector-icons";
interface PoliticianListProps {
  politicians: Politician[];
  selectedCounty: string;
  selectedState: string;
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
}

export const PoliticianList: React.FC<PoliticianListProps> = ({
  politicians,
  selectedCounty,
  selectedState,
  isLoading,
  error,
  onRetry,
}) => {
  // Group politicians by level (county and state)
  const countyPoliticians = politicians.filter(
    (p) =>
      p.county === `${selectedCounty} County` || p.county === selectedCounty
  );
  const statePoliticians = politicians.filter((p) => !p.county);

  // Render county section
  const renderCountySection = () => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-4 mb-2">
        COUNTY OFFICIALS
      </Text>
      <FlatList
        data={countyPoliticians}
        renderItem={({ item }) => (
          <PoliticianCard key={item.id} politician={item} />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  // Render state section
  const renderStateSection = () => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-4 mb-2">
        STATE OFFICIALS
      </Text>
      <FlatList
        data={statePoliticians}
        renderItem={({ item }) => (
          <PoliticianCard key={item.id} politician={item} />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  // If there's an error, show error state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Feather
          name="alert-circle"
          size={48}
          color="#EF4444"
          className="mb-4"
        />
        <Text className="text-red-500 font-medium mb-2 text-center">
          Error loading politicians
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-4 text-center">
          {error}
        </Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md flex-row items-center"
          >
            <Feather
              name="refresh-cw"
              size={16}
              color="gray"
              className="mr-2"
            />
            <Text className="text-gray-700 dark:text-gray-300">Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">
          Loading politicians...
        </Text>
      </View>
    );
  }

  if (!selectedCounty) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Feather name="chevron-down" size={48} color="gray" className="mb-4" />
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          Select a county on the map to view politicians
        </Text>
      </View>
    );
  }

  if (politicians.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Feather name="search" size={48} color="gray" className="mb-4" />
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          No politicians found for {selectedCounty}, {selectedState}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          Politicians for{" "}
          <Text className="text-blue-500">
            {selectedCounty}, {selectedState}
          </Text>
        </Text>
      </View>

      <FlatList
        data={[
          { type: "header", title: "All Politicians" },
          { type: "county-header", data: countyPoliticians },
          ...countyPoliticians.map((p) => ({ type: "politician", data: p })),
          { type: "state-header", data: statePoliticians },
          ...statePoliticians.map((p) => ({ type: "politician", data: p })),
        ].filter((item) => {
          // Filter out empty sections
          if (item.type === "county-header" && countyPoliticians.length === 0)
            return false;
          if (item.type === "state-header" && statePoliticians.length === 0)
            return false;
          return true;
        })}
        renderItem={({ item }: any) => {
          if (item.type === "header") {
            return (
              <Text className="text-lg font-bold text-gray-900 dark:text-white px-4 py-3">
                {item.title}
              </Text>
            );
          } else if (item.type === "county-header") {
            return (
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-4 py-2">
                COUNTY OFFICIALS
              </Text>
            );
          } else if (item.type === "state-header") {
            return (
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-4 py-2">
                STATE OFFICIALS
              </Text>
            );
          } else if (item.type === "politician") {
            return <PoliticianCard politician={item.data} />;
          }
          return null;
        }}
        keyExtractor={(item: any, index) =>
          item.type === "politician"
            ? item.data.id.toString()
            : `${item.type}-${index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};
