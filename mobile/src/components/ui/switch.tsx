// components/ui/switch.tsx
import React from "react";
import { Switch as RNSwitch } from "react-native";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onCheckedChange, 
  disabled,
  className 
}) => (
  <RNSwitch
    value={checked}
    onValueChange={onCheckedChange}
    disabled={disabled}
    trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
    thumbColor={checked ? '#ffffff' : '#ffffff'}
    ios_backgroundColor="#e5e7eb"
    className={className}
  />
);

export { Switch };