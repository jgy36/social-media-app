// src/screens/PoliticiansScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker';
import { Politician } from "@/types/politician";
import { getAllPoliticians, getCabinetMembers } from "@/api/politicians";
import PoliticianCard from "@/components/politicians/PoliticianCard";

const PoliticiansScreen = () => {
  const navigation = useNavigation();
  
  // State for all politicians data
  const [allPoliticians, setAllPoliticians] = useState<Politician[]>([]);
  const [cabinetMembers, setCabinetMembers] = useState<Politician[]>([]);
  const [federalPoliticians, setFederalPoliticians] = useState<Politician[]>([]);
  const [statePoliticians, setStatePoliticians] = useState<Politician[]>([]);
  const [countyPoliticians, setCountyPoliticians] = useState<Politician[]>([]);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for filter options
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableParties, setAvailableParties] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for the active tab
  const [activeTab, setActiveTab] = useState("all");

  // Define fetchData function with useCallback
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all politicians
      console.log("Fetching all politicians...");
      const politicians = await getAllPoliticians();
      setAllPoliticians(politicians);

      // Fetch cabinet members
      console.log("Fetching cabinet members...");
      const cabinet = await getCabinetMembers();

      // Format cabinet data to match Politician format
      const formattedCabinet = cabinet.map((member) => ({
        ...member,
        state: member.state || "Federal",
        yearsServed: member.yearsServed || 0,
        photoUrl: member.photoUrl === "N/A" ? null : member.photoUrl,
      }));

      setCabinetMembers(formattedCabinet);

      // Categorize politicians - exclude cabinet members from federal
      const cabinetIds = new Set(cabinet.map((c) => c.id));

      const federal = politicians.filter(
        (p) => p.state === "Federal" && !cabinetIds.has(p.id)
      );

      const state = politicians.filter(
        (p) => p.county === null && p.state !== "Federal"
      );

      const county = politicians.filter((p) => p.county !== null);

      setFederalPoliticians(federal);
      setStatePoliticians(state);
      setCountyPoliticians(county);

      // Extract available filter options including cabinet
      const allPoliticiansWithCabinet = [
        ...politicians,
        ...cabinet.filter((c) => !politicians.some((p) => p.id === c.id)),
      ];

      const uniqueStates = new Set(
        allPoliticiansWithCabinet.map((p) => p.state)
      );
      const states = Array.from(uniqueStates).filter(Boolean).sort();

      const uniqueParties = new Set(
        allPoliticiansWithCabinet.map((p) => p.party)
      );
      const parties = Array.from(uniqueParties).filter(Boolean).sort();

      setAvailableStates(states);
      setAvailableParties(parties);
    } catch (error) {
      console.error("Error fetching politicians:", error);
      setError("Failed to load politicians data. Please try again.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load politicians data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, partyFilter, stateFilter]);

  // Apply filters to politicians
  const filterPoliticians = (politicians: Politician[]) => {
    return politicians.filter((politician) => {
      // Apply search filter
      const matchesSearch =
        searchQuery === "" ||
        politician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (politician.position &&
          politician.position
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      // Apply party filter
      const matchesParty =
        partyFilter === "all" || politician.party === partyFilter;

      // Apply state filter
      const matchesState =
        stateFilter === "all" || politician.state === stateFilter;

      return matchesSearch && matchesParty && matchesState;
    });
  };

  // Get paginated data
  const getPaginatedData = (data: Politician[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  // Filter politicians based on current filters
  const filteredCabinet = filterPoliticians(cabinetMembers);
  const filteredFederal = filterPoliticians(federalPoliticians);
  const filteredState = filterPoliticians(statePoliticians);
  const filteredCounty = filterPoliticians(countyPoliticians);

  // Combine all unique politicians
  const allUniquePoliticians = [...cabinetMembers];

  // Add other politicians that are not in cabinet
  const cabinetIds = new Set(cabinetMembers.map((c) => c.id));
  federalPoliticians.forEach((p) => {
    if (!cabinetIds.has(p.id)) allUniquePoliticians.push(p);
  });

  // Add state and county politicians
  statePoliticians.forEach((p) => allUniquePoliticians.push(p));
  countyPoliticians.forEach((p) => allUniquePoliticians.push(p));

  const filteredAll = filterPoliticians(allUniquePoliticians);

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "cabinet":
        return getPaginatedData(filteredCabinet);
      case "federal":
        return getPaginatedData(filteredFederal);
      case "state":
        return getPaginatedData(filteredState);
      case "county":
        return getPaginatedData(filteredCounty);
      default:
        return getPaginatedData(filteredAll);
    }
  };

  // Get total count for current tab
  const getCurrentCount = () => {
    switch (activeTab) {
      case "cabinet":
        return filteredCabinet.length;
      case "federal":
        return filteredFederal.length;
      case "state":
        return filteredState.length;
      case "county":
        return filteredCounty.length;
      default:
        return filteredAll.length;
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setPartyFilter("all");
    setStateFilter("all");
    setCurrentPage(1);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Tab button component
  const TabButton = ({ id, label, count }: { id: string; label: string; count: number }) => (
    <TouchableOpacity
      onPress={() => {
        setActiveTab(id);
        setCurrentPage(1);
      }}
      className={`flex-1 py-3 items-center ${
        activeTab === id ? 'border-b-2 border-blue-500' : ''
      }`}
    >
      <Text className={`font-medium text-sm ${
        activeTab === id ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
      }`}>
        {label}
      </Text>
      <Text className={`text-xs ${
        activeTab === id ? 'text-blue-500' : 'text-gray-500'
      }`}>
        ({count})
      </Text>
    </TouchableOpacity>
  );

  // Render politician item
  const renderPolitician = ({ item }: { item: Politician }) => (
    <PoliticianCard politician={item} />
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Politicians Directory
        </Text>

        {/* Search Input */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 mb-4">
          <MaterialIcons name="search" size={24} color="#6B7280" />
          <TextInput
            className="flex-1 py-3 px-3 text-gray-900 dark:text-white"
            placeholder="Search by name or position..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={!isLoading && !error}
          />
        </View>

        {/* Filters */}
        <View className="flex-row space-x-3 mb-4">
          <View className="flex-1">
            <Picker
              selectedValue={partyFilter}
              onValueChange={setPartyFilter}
              enabled={!isLoading && !error}
              style={{ color: '#374151' }}
            >
              <Picker.Item label="All Parties" value="all" />
              {availableParties.map((party) => (
                <Picker.Item key={party} label={party} value={party} />
              ))}
            </Picker>
          </View>

          <View className="flex-1">
            <Picker
              selectedValue={stateFilter}
              onValueChange={setStateFilter}
              enabled={!isLoading && !error}
              style={{ color: '#374151' }}
            >
              <Picker.Item label="All States" value="all" />
              {availableStates.map((state) => (
                <Picker.Item key={state} label={state} value={state} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Reset Filters Button */}
        <TouchableOpacity
          onPress={resetFilters}
          className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg self-start"
          disabled={isLoading || !!error}
        >
          <Text className="text-gray-700 dark:text-gray-300 font-medium">
            Reset Filters
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View className="bg-red-50 dark:bg-red-900 p-4 m-4 rounded-lg">
          <View className="flex-row items-center">
            <MaterialIcons name="error-outline" size={24} color="#DC2626" />
            <Text className="ml-2 text-red-800 dark:text-red-200 font-medium">
              Error Loading Data
            </Text>
          </View>
          <Text className="text-red-600 dark:text-red-300 mt-1">{error}</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-red-100 dark:bg-red-800 px-3 py-2 rounded mt-2 self-start"
          >
            <Text className="text-red-800 dark:text-red-200">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500 dark:text-gray-400">
            Loading politicians...
          </Text>
        </View>
      ) : (
        <>
          {/* Tabs */}
          <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row">
              <TabButton id="all" label="All" count={filteredAll.length} />
              <TabButton id="cabinet" label="Cabinet" count={filteredCabinet.length} />
              <TabButton id="federal" label="Federal" count={filteredFederal.length} />
              <TabButton id="state" label="State" count={filteredState.length} />
              <TabButton id="county" label="County" count={filteredCounty.length} />
            </View>
          </View>

          {/* Politicians List */}
          <FlatList
            data={getCurrentData()}
            renderItem={renderPolitician}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            contentContainerStyle={{
              paddingVertical: 16,
              paddingHorizontal: 16,
            }}
            ItemSeparatorComponent={() => <View className="h-4" />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-12">
                <MaterialIcons name="how-to-vote" size={64} color="#6B7280" />
                <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                  No politicians found
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                  No politicians match your current filters
                </Text>
              </View>
            )}
          />

          {/* Pagination Info */}
          {getCurrentCount() > 0 && (
            <View className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-center text-gray-600 dark:text-gray-400">
                Showing {Math.min(currentPage * itemsPerPage, getCurrentCount())} of {getCurrentCount()} results
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default PoliticiansScreen;