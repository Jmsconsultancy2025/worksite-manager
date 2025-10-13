import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock site data
const mockSites = [
  {
    id: '1',
    name: 'Zonuam Site',
    location: 'Zonuam, Aizawl',
    totalWorkers: 12,
    presentWorkers: 10,
  },
  {
    id: '2',
    name: 'Pu Sanga Building Site',
    location: 'Chanmari, Aizawl',
    totalWorkers: 8,
    presentWorkers: 7,
  },
  {
    id: '3',
    name: 'Chaltlang Site',
    location: 'Chaltlang Lily Veng',
    totalWorkers: 15,
    presentWorkers: 15,
  },
];

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <Text style={styles.brandTitle}>Worksite</Text>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.signInButton}>
              <MaterialIcons name="person-add" size={16} color="#4CAF50" />
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.referButton}>
              <MaterialIcons name="card-giftcard" size={16} color="#4CAF50" />
              <Text style={styles.referText}>Refer a Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsIcon}>
              <MaterialIcons name="settings" size={24} color="#757575" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#9E9E9E" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sites or workers by name / location"
            placeholderTextColor="#BDBDBD"
          />
        </View>

        {/* Site Cards */}
        {mockSites.map((site) => (
          <TouchableOpacity 
            key={site.id} 
            style={styles.siteCard}
            onPress={() => router.push('/workers')}
          >
            <Text style={styles.siteName}>{site.name}</Text>
            <Text style={styles.siteLocation}>{site.location}</Text>
            <View style={styles.workerStats}>
              <Text style={styles.workerText}>
                Workers: <Text style={styles.workerNumber}>{site.totalWorkers}</Text>
              </Text>
              <Text style={styles.separator}> | </Text>
              <Text style={styles.workerText}>
                Present: <Text style={styles.presentNumber}>{site.presentWorkers}</Text>
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Add New Site Card */}
        <TouchableOpacity style={styles.addSiteCard}>
          <View style={styles.addIconCircle}>
            <MaterialIcons name="add" size={32} color="#9E9E9E" />
          </View>
          <Text style={styles.addSiteTitle}>Add New Site</Text>
          <Text style={styles.addSiteSubtitle}>Create a new construction site</Text>
        </TouchableOpacity>

        {/* Powered By Section */}
        <View style={styles.poweredBySection}>
          <Text style={styles.poweredByText}>Powered by</Text>
          <View style={styles.logoContainer}>
            <MaterialIcons name="business" size={32} color="#424242" />
          </View>
        </View>

        {/* Bottom spacing for footer */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="home" size={24} color="#181e29" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="people" size={24} color="#757575" />
          <Text style={styles.navLabel}>Workers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="event-note" size={24} color="#757575" />
          <Text style={styles.navLabel}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="account-balance-wallet" size={24} color="#757575" />
          <Text style={styles.navLabel}>Payroll</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="settings" size={24} color="#757575" />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
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
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // Top Bar Styles
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    letterSpacing: 0.5,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    backgroundColor: '#FFFFFF',
    gap: 3,
  },
  signInText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  referButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    backgroundColor: '#FFFFFF',
    gap: 3,
  },
  referText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  settingsIcon: {
    padding: 4,
  },
  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
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
  // Site Card Styles
  siteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  siteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  siteLocation: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  workerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerText: {
    fontSize: 14,
    color: '#757575',
  },
  workerNumber: {
    fontWeight: '600',
    color: '#424242',
  },
  separator: {
    color: '#BDBDBD',
  },
  presentNumber: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  // Add New Site Card Styles
  addSiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addSiteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  addSiteSubtitle: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  // Powered By Section
  poweredBySection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  poweredByText: {
    fontSize: 13,
    color: '#BDBDBD',
    marginBottom: 8,
  },
  logoContainer: {
    padding: 8,
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
    color: '#757575',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#181e29',
    fontWeight: '600',
  },
});
