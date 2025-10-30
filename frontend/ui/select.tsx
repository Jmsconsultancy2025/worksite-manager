import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, FlatList, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

export interface SelectItem {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  items: SelectItem[];
  placeholder?: string;
  style?: ViewStyle;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
}

interface SelectValueProps {
  placeholder?: string;
  value?: string;
  style?: TextStyle;
}

interface SelectContentProps {
  isOpen: boolean;
  onClose: () => void;
  items: SelectItem[];
  onSelect: (value: string) => void;
}

interface SelectItemProps {
  item: SelectItem;
  onPress: () => void;
  style?: ViewStyle;
}

export function Select({ value, onValueChange, items, placeholder, style }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = items.find(item => item.value === value);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <View style={style}>
      <SelectTrigger onPress={() => setIsOpen(true)}>
        <SelectValue placeholder={placeholder} value={selectedItem?.label} />
      </SelectTrigger>
      <SelectContent
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        onSelect={handleSelect}
      />
    </View>
  );
}

export function SelectTrigger({ children, onPress, style }: SelectTriggerProps) {
  return (
    <TouchableOpacity
      style={[styles.trigger, style]}
      onPress={onPress}
    >
      {children}
      <ChevronDown size={16} color="#6B7280" />
    </TouchableOpacity>
  );
}

export function SelectValue({ placeholder, value, style }: SelectValueProps) {
  return (
    <Text style={[styles.value, style]}>
      {value || placeholder || 'Select an option'}
    </Text>
  );
}

export function SelectContent({ isOpen, onClose, items, onSelect }: SelectContentProps) {
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.content}>
          <FlatList
            data={items}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <SelectItemComponent
                item={item}
                onPress={() => onSelect(item.value)}
              />
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function SelectItemComponent({ item, onPress }: SelectItemProps) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
    >
      <Text style={styles.itemText}>{item.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    minHeight: 40,
  },
  value: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    maxHeight: '50%',
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
  },
});