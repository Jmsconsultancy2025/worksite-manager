import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import SiteCard from '../components/SiteCard';
import SiteForm from '../components/SiteForm';

interface Site {
  id: string;
  name: string;
  location: string;
  manager: string;
  totalWorkers: number;
  presentWorkers: number;
}

const SitesPage = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  useEffect(() => {
    // Load sites from storage or API
    const sampleSites: Site[] = [
      { id: '1', name: 'Downtown Tower', location: '123 Main St', manager: 'John Doe', totalWorkers: 50, presentWorkers: 45 },
      { id: '2', name: 'Suburban Mall', location: '456 Oak Ave', manager: 'Jane Smith', totalWorkers: 75, presentWorkers: 60 },
    ];
    setSites(sampleSites);
  }, []);

  const handleAddSite = () => {
    setEditingSite(null);
    setModalVisible(true);
  };

  const handleEditSite = (site: Site) => {
    setEditingSite(site);
    setModalVisible(true);
  };

  const handleDeleteSite = (siteId: string) => {
    setSites(prevSites => prevSites.filter(site => site.id !== siteId));
  };

  const handleSaveSite = (siteData: Omit<Site, 'id' | 'totalWorkers' | 'presentWorkers'> & { id?: string }) => {
    if (siteData.id) {
      // Edit existing site
      setSites(prevSites =>
        prevSites.map(site =>
          site.id === siteData.id ? { ...site, name: siteData.name, location: siteData.location, manager: siteData.manager } : site
        )
      );
    } else {
      // Add new site
      const newSite: Site = {
        id: Date.now().toString(),
        name: siteData.name,
        location: siteData.location,
        manager: siteData.manager,
        totalWorkers: 0, // Default values
        presentWorkers: 0,
      };
      setSites(prevSites => [newSite, ...prevSites]);
    }
    setModalVisible(false);
    setEditingSite(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Work Sites</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSite}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={sites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SiteCard
            site={item}
            onEdit={handleEditSite}
            onDelete={handleDeleteSite}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={false}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingSite(null);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <SiteForm
            site={editingSite}
            onSave={handleSaveSite}
            onCancel={() => {
              setModalVisible(false);
              setEditingSite(null);
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default SitesPage;