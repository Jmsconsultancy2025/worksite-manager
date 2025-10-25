import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { ReportsPage } from '../components/ReportsPage';

export default function Reports() {
  return (
    <SafeAreaView style={styles.container}>
      <ReportsPage />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});