import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { X } from 'lucide-react-native';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface DialogTitleProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Dialog({ isOpen, onClose, children }: DialogProps) {
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
        <TouchableOpacity
          style={styles.content}
          activeOpacity={1}
          onPress={() => {}}
        >
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export function DialogContent({ children, style }: DialogContentProps) {
  return (
    <View style={[styles.dialogContent, style]}>
      {children}
    </View>
  );
}

export function DialogHeader({ children, style }: DialogHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
}

export function DialogTitle({ children, style }: DialogTitleProps) {
  return (
    <View style={[styles.title, style]}>
      {children}
    </View>
  );
}

export function DialogDescription({ children, style }: DialogDescriptionProps) {
  return (
    <View style={[styles.description, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  dialogContent: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
  },
});