// components/ui/skeleton.tsx
import React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: any;
}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <View
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

export { Skeleton };