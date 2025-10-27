import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, People, AccountBalanceWallet, Note, BarChart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ReportsPage from '../components/ReportsPage';

export default function Reports() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ReportsPage />
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Home size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/workers')}>
          <People size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Workers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/cashbook')}>
          <AccountBalanceWallet size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Cashbook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/notes')}>
          <Note size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/reports')}>
          <BarChart size={24} color="#4CAF50" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Reports</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Bottom Navigation Bar
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#757575',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});