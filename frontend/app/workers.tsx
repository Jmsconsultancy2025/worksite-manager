import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Types
type AttendanceStatus = 'present' | 'absent' | 'halfday' | null;

interface Worker {
  id: string;
  name: string;
  phone: string;
  role: string;
  attendanceStatus: AttendanceStatus;
  overtime: boolean;
  maxAdvanceLimit: number;
}

// Mock worker data
const initialWorkers: Worker[] = [
  {
    id: '1',
    name: 'Sanga',
    phone: '9876543210',
    role: 'Mason',
    attendanceStatus: null,
    overtime: false,
    maxAdvanceLimit: 5000,
  },
  {
    id: '2',
    name: 'Liana',
    phone: '9876543211',
    role: 'Helper',
    attendanceStatus: null,
    overtime: false,
    maxAdvanceLimit: 3000,
  },
  {
    id: '3',
    name: 'Rema',
    phone: '9876543212',
    role: 'Carpenter',
    attendanceStatus: null,
    overtime: false,
    maxAdvanceLimit: 4500,
  },
  {
    id: '4',
    name: 'Joseph',
    phone: '9876543213',
    role: 'Electrician',
    attendanceStatus: null,
    overtime: false,
    maxAdvanceLimit: 4000,
  },
  {
    id: '5',
    name: 'Maria',
    phone: '9876543214',
    role: 'Painter',
    attendanceStatus: null,
    overtime: false,
    maxAdvanceLimit: 3500,
  },
];

export default function WorkersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWorkers = mockWorkers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.phone.includes(searchQuery)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#1A237E" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Zonuam Site Workers</Text>
            <Text style={styles.headerSubtitle}>Viewing: Zonuam Site</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#9E9E9E" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search worker by name or phone number"
            placeholderTextColor="#BDBDBD"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Workers List */}
        <ScrollView
          style={styles.workersList}
          contentContainerStyle={styles.workersListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredWorkers.map((worker) => (
            <View key={worker.id} style={styles.workerCard}>
              {/* Left Column: Worker Info */}
              <View style={styles.leftColumn}>
                <View style={styles.workerBasicInfo}>
                  <Text style={styles.workerName}>{worker.name}</Text>
                  <Text style={styles.workerPhone}>{worker.phone}</Text>
                  <Text style={styles.workerRole}>{worker.role}</Text>
                </View>
              </View>

              {/* Middle Column: Status Badges */}
              <View style={styles.middleColumn}>
                <View style={styles.statusRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>P</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>H</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>A</Text>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <MaterialIcons name="more-vert" size={18} color="#757575" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Right Column: Advance Button - Always aligned with name */}
              <View style={styles.rightColumn}>
                <TouchableOpacity style={styles.advanceButton}>
                  <MaterialIcons name="currency-rupee" size={13} color="#FF9800" />
                  <Text style={styles.advanceButtonText}>Advance</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.floatingButton}>
          <MaterialIcons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
            <MaterialIcons name="home" size={24} color="#9E9E9E" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="people" size={24} color="#4CAF50" />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Workers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#9E9E9E" />
            <Text style={styles.navLabel}>Cashbook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="note" size={24} color="#9E9E9E" />
            <Text style={styles.navLabel}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="bar-chart" size={24} color="#9E9E9E" />
            <Text style={styles.navLabel}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
  },
  // Workers List Styles
  workersList: {
    flex: 1,
  },
  workersListContent: {
    paddingHorizontal: 16,
  },
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 88,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // Left Column: Worker Basic Info
  leftColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  workerBasicInfo: {
    justifyContent: 'center',
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 4,
    lineHeight: 20,
  },
  workerPhone: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 3,
    fontWeight: '500',
    lineHeight: 18,
  },
  workerRole: {
    fontSize: 13,
    color: '#9E9E9E',
    lineHeight: 16,
  },
  // Middle Column: Status Badges
  middleColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#757575',
  },
  moreButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Right Column: Advance Button (Always aligned)
  rightColumn: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  advanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FF9800',
    backgroundColor: '#FFFFFF',
    gap: 3,
  },
  advanceButtonText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  // Floating Button
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  // Bottom Navigation Bar
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});
