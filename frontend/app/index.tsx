
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReferralModal } from '../components/ReferralModal';
import { SignupSigninModal } from '../components/SignupSigninModal';
import { SettingsModal } from '../components/SettingsModal';
import { AddSiteModal, NewSiteData } from '../components/AddSiteModal';
import SiteCard from '../components/SiteCard';
import Toast from 'react-native-toast-message';

// Sample site data
const sampleSites = [
  {
    id: '1',
    name: 'Zonuam Site',
    location: 'Zonuam, Aizawl',
    manager: 'John Smith',
    totalWorkers: 12,
    presentWorkers: 10,
  },
  {
    id: '2',
    name: 'Pu Sanga Building Site',
    location: 'Chanmari, Aizawl',
    manager: 'Sarah Johnson',
    totalWorkers: 8,
    presentWorkers: 7,
  },
  {
    id: '3',
    name: 'Chaltlang Site',
    location: 'Chaltlang Lily Veng',
    manager: 'Mike Wilson',
    totalWorkers: 15,
    presentWorkers: 15,
  },
  {
    id: '4',
    name: 'Ramhlun Site',
    location: 'Ramhlun North, Aizawl',
    manager: 'David Brown',
    totalWorkers: 6,
    presentWorkers: 5,
  },
  {
    id: '5',
    name: 'Bawngkawn Site',
    location: 'Bawngkawn, Aizawl',
    manager: 'Lisa Davis',
    totalWorkers: 9,
    presentWorkers: 9,
  },
];

export default function Index() {
    const router = useRouter();
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [isSignupSigninModalOpen, setIsSignupSigninModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
    const [isEditSiteModalOpen, setIsEditSiteModalOpen] = useState(false);
    const [editingSite, setEditingSite] = useState(null);
    const [siteData, setSiteData] = useState(sampleSites);
    const [searchQuery, setSearchQuery] = useState('');

    // Handler to add new site
    const handleAddSite = (newSiteData: NewSiteData) => {
      const newId = (Math.max(...siteData.map((s) => parseInt(s.id))) + 1).toString();
      const newSite = {
        id: newId,
        name: newSiteData.name,
        location: newSiteData.location,
        totalWorkers: newSiteData.numberOfWorkers,
        presentWorkers: 0, // Start with 0 present workers
      };

      setSiteData((prev) => [...prev, newSite]);
    };

    // Handler to delete site
    const handleDeleteSite = (siteId: string) => {
      // In a real app, you would also handle deleting workers associated with this site.
      // For example: setWorkers(workers.filter(w => w.siteId !== siteId));
      setSiteData(prevSites => prevSites.filter(site => site.id !== siteId));
    };

    // Handler to edit site
    const handleEditSite = (site: any) => {
      setEditingSite(site);
      setIsEditSiteModalOpen(true);
    };

    // Handler to update site
    const handleUpdateSite = (updatedSiteData: NewSiteData) => {
      setSiteData(prevSites =>
        prevSites.map(site =>
          site.id === editingSite.id
            ? {
                ...site,
                name: updatedSiteData.name,
                location: updatedSiteData.location,
                manager: updatedSiteData.manager || site.manager,
                totalWorkers: updatedSiteData.numberOfWorkers,
              }
            : site
        )
      );
      setEditingSite(null);
    };

    const filteredSites = siteData.filter(site =>
      site.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  console.log("App entry loaded");
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <Text style={styles.brandTitle}>Worksite Manager</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.signInButton} onPress={() => setIsSignupSigninModalOpen(true)}>
            <MaterialIcons name="person-add" size={16} color="#4CAF50" />
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.referButton} onPress={() => setIsReferralModalOpen(true)}>
            <MaterialIcons name="card-giftcard" size={16} color="#4CAF50" />
            <Text style={styles.referText}>Refer a Friend</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={() => {
              console.log('Settings icon pressed');
              setIsSettingsModalOpen(true);
            }}
          >
            <MaterialIcons name="settings" size={24} color="#757575" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>
            You are managing {siteData.length} sites
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#9E9E9E" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sites or workers by name / location"
            placeholderTextColor="#BDBDBD"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Site Cards */}
        {filteredSites.map((site) => (
          <SiteCard
            key={site.id}
            site={site}
            onDelete={handleDeleteSite}
            onEdit={handleEditSite}
          />
        ))}

        {/* Add New Site Card */}
        <TouchableOpacity
          style={styles.addSiteCard}
          onPress={() => setIsAddSiteModalOpen(true)}
        >
          <View style={styles.addSiteContent}>
            <View style={styles.addIconContainer}>
              <MaterialIcons name="add" size={32} color="#4CAF50" />
            </View>
            <Text style={styles.addSiteText}>Add New Site</Text>
            <Text style={styles.addSiteSubtext}>Create a new worksite to manage workers</Text>
          </View>
        </TouchableOpacity>

        {/* Powered By Section */}
        <View style={styles.poweredBySection}>
          <Text style={styles.poweredByText}>Powered by</Text>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/images/miztech-logo.png')} style={styles.logoImage} />
          </View>
        </View>

        {/* Bottom spacing for footer */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Referral Modal */}
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
      />

      {/* Signup/Signin Modal */}
      <SignupSigninModal
        isOpen={isSignupSigninModalOpen}
        onClose={() => setIsSignupSigninModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Add Site Modal */}
      <AddSiteModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        onAddSite={handleAddSite}
      />

      {/* Edit Site Modal */}
      <AddSiteModal
        isOpen={isEditSiteModalOpen}
        onClose={() => {
          setIsEditSiteModalOpen(false);
          setEditingSite(null);
        }}
        onAddSite={handleUpdateSite}
        initialData={editingSite}
        isEditing={true}
      />

      {/* Toast */}
      <Toast />

      {/* Add Site Button at bottom */}
      <View style={styles.addSiteBottomContainer}>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsAddSiteModalOpen(true)}>
          <MaterialIcons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Site</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/reports')}>
          <MaterialIcons name="bar-chart" size={28} color="#333333" />
          <Text style={styles.navLabel}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/feedback')}>
          <MaterialIcons name="feedback" size={28} color="#333333" />
          <Text style={styles.navLabel}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/about')}>
          <MaterialIcons name="info" size={28} color="#333333" />
          <Text style={styles.navLabel}>About Us</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/plans')}>
          <MaterialIcons name="star" size={28} color="#333333" />
          <Text style={styles.navLabel}>Plans</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </>
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
    paddingTop: 0,
  },
  // Top Bar Styles
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'left',
    flex: 1,
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
  addSiteButton: {
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
  addSiteText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Header Styles
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 24,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  addSiteBottomContainer: {
    position: 'absolute',
    bottom: 80, // Above the bottom nav
    right: 16,
    alignItems: 'flex-end',
    paddingVertical: 16,
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
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  // Add Site Card Styles
  addSiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
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
  addSiteContent: {
    alignItems: 'center',
  },
  addIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addSiteText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  addSiteSubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  // Bottom Navigation Bar
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 60, // Ensure large enough tap targets for mobile
  },
  navLabel: {
    fontSize: 12,
    color: '#555555',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#4CAF50',
  },
});


