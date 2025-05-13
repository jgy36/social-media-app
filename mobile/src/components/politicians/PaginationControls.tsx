// src/components/politicians/PaginationControls.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'react-native-vector-icons/Feather';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pageNumbers: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    // Always show first page
    pageNumbers.push(1);

    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if at start or end
    if (currentPage <= 3) {
      endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - maxVisiblePages + 2);
    }

    // Add ellipsis if needed
    if (startPage > 2) {
      pageNumbers.push('ellipsis');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push('ellipsis');
    }

    // Always show last page if there are multiple pages
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <View className="mt-6 flex-row items-center justify-center">
      <TouchableOpacity
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex-row items-center px-3 py-2 rounded-md mr-2 ${
          currentPage === 1 
            ? 'bg-gray-200 dark:bg-gray-700' 
            : 'bg-blue-500 dark:bg-blue-600'
        }`}
      >
        <ChevronLeft 
          name="chevron-left" 
          size={16} 
          color={currentPage === 1 ? 'gray' : 'white'} 
          className="mr-1" 
        />
        <Text className={currentPage === 1 ? 'text-gray-500' : 'text-white'}>
          Previous
        </Text>
      </TouchableOpacity>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <View key={`ellipsis-${index}`} className="px-3 py-2 justify-center">
              <Text className="text-gray-500">...</Text>
            </View>
          ) : (
            <TouchableOpacity
              key={page}
              onPress={() => onPageChange(page)}
              className={`px-3 py-2 rounded-md ${
                page === currentPage
                  ? 'bg-blue-500 dark:bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <Text className={page === currentPage ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                {page}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex-row items-center px-3 py-2 rounded-md ml-2 ${
          currentPage === totalPages 
            ? 'bg-gray-200 dark:bg-gray-700' 
            : 'bg-blue-500 dark:bg-blue-600'
        }`}
      >
        <Text className={currentPage === totalPages ? 'text-gray-500' : 'text-white'}>
          Next
        </Text>
        <ChevronRight 
          name="chevron-right" 
          size={16} 
          color={currentPage === totalPages ? 'gray' : 'white'} 
          className="ml-1" 
        />
      </TouchableOpacity>
    </View>
  );
};

export default PaginationControls;