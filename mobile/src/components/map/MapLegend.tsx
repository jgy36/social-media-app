// components/map/MapLegend.tsx
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

interface LegendItem {
  color: string;
  label: string;
  percentage?: number;
}

interface MapLegendProps {
  title?: string;
  items?: LegendItem[];
  type?: 'discrete' | 'gradient';
  className?: string;
}

const MapLegend: React.FC<MapLegendProps> = ({
  title = "Legend",
  items = [],
  type = 'discrete',
  className = ""
}) => {
  const defaultPoliticalItems: LegendItem[] = [
    { color: '#dc2626', label: 'Republican', percentage: 45 },
    { color: '#2563eb', label: 'Democrat', percentage: 40 },
    { color: '#7c3aed', label: 'Independent', percentage: 10 },
    { color: '#6b7280', label: 'Other', percentage: 5 },
  ];

  const legendItems = items.length > 0 ? items : defaultPoliticalItems;

  const renderGradientLegend = () => (
    <View className="mt-2">
      <LinearGradient
        colors={['#dc2626', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#15803d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="h-4 rounded-md mx-2"
      />
      <View className="flex-row justify-between px-2 mt-1">
        <Text className="text-xs text-gray-600 dark:text-gray-400">Low</Text>
        <Text className="text-xs text-gray-600 dark:text-gray-400">High</Text>
      </View>
    </View>
  );

  const renderDiscreteLegend = () => (
    <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
      {legendItems.map((item, index) => (
        <View key={index} className="flex-row items-center justify-between p-2 rounded-lg mb-1">
          <View className="flex-row items-center flex-1">
            <View 
              className="w-4 h-4 rounded-full mr-3 border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: item.color }}
            />
            <Text className="text-gray-900 dark:text-gray-100 font-medium">
              {item.label}
            </Text>
          </View>
          {item.percentage !== undefined && (
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              {item.percentage}%
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md ${className}`}>
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </Text>
      
      {type === 'gradient' ? renderGradientLegend() : renderDiscreteLegend()}
      
      <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Tap legend items for more details
        </Text>
      </View>
    </View>
  );
};

export default MapLegend;