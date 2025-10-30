import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'blue' | 'purple';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ children, variant = 'default', style, textStyle }: BadgeProps) {
  const badgeStyle = [
    styles.base,
    styles[variant],
    style,
  ];

  const textStyleCombined = [
    styles.text,
    textStyle,
  ];

  return (
    <Text style={badgeStyle}>
      <Text style={textStyleCombined}>{children}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  default: {
    backgroundColor: '#E0E0E0',
  },
  green: {
    backgroundColor: '#DCFCE7',
  },
  blue: {
    backgroundColor: '#DBEAFE',
  },
  purple: {
    backgroundColor: '#E9D5FF',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  defaultText: {
    color: '#374151',
  },
  greenText: {
    color: '#166534',
  },
  blueText: {
    color: '#1E40AF',
  },
  purpleText: {
    color: '#7C3AED',
  },
});