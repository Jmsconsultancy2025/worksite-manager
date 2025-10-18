import React from 'react';
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

interface TextareaProps extends TextInputProps {
  style?: ViewStyle;
}

export function Textarea({ style, ...props }: TextareaProps) {
  return (
    <TextInput
      style={[styles.textarea, style]}
      multiline={true}
      textAlignVertical="top"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 80,
  },
});