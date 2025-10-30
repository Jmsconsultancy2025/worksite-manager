import React, { useState } from 'react';
import { Image, View, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ImageWithFallbackProps {
  source: { uri: string };
  alt: string;
  style?: ViewStyle;
  fallbackIcon?: keyof typeof MaterialIcons.glyphMap;
  fallbackIconSize?: number;
  fallbackIconColor?: string;
}

export function ImageWithFallback({
  source,
  alt,
  style,
  fallbackIcon = 'image',
  fallbackIconSize = 48,
  fallbackIconColor = '#9E9E9E',
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <MaterialIcons
          name={fallbackIcon}
          size={fallbackIconSize}
          color={fallbackIconColor}
        />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      onError={() => setHasError(true)}
      accessibilityLabel={alt}
    />
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});