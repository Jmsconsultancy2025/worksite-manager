
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

interface Site {
  id: string;
  name: string;
  location: string;
  manager: string;
  totalWorkers: number;
  presentWorkers: number;
}

type SiteFormData = Omit<Site, 'id' | 'totalWorkers' | 'presentWorkers'> & { id?: string };

interface SiteFormProps {
  site: Site | null;
  onSave: (siteData: SiteFormData) => void;
  onCancel: () => void;
}

const SiteForm: React.FC<SiteFormProps> = ({ site, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [manager, setManager] = useState('');

  useEffect(() => {
    if (site) {
      setName(site.name);
      setLocation(site.location);
      setManager(site.manager);
    } else {
      setName('');
      setLocation('');
      setManager('');
    }
  }, [site]);

  const handleSave = () => {
    if (!name.trim() || !location.trim() || !manager.trim()) {
      alert('Please fill all fields');
      return;
    }
    onSave({
      id: site?.id,
      name,
      location,
      manager,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{site ? 'Edit Site' : 'Add New Site'}</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Site Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Site Manager"
          value={manager}
          onChangeText={setManager}
          placeholderTextColor="#999"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SiteForm;
