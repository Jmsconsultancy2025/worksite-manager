import React from 'react';
import { Switch as RNSwitch, StyleSheet, ViewStyle } from 'react-native';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  style?: ViewStyle;
}

export function Switch({ checked, onCheckedChange, style }: SwitchProps) {
  return (
    <RNSwitch
      value={checked}
      onValueChange={onCheckedChange}
      trackColor={{ false: '#D1D5DB', true: '#2E7D32' }}
      thumbColor={checked ? '#FFFFFF' : '#F3F4F6'}
      style={style}
    />
  );
}