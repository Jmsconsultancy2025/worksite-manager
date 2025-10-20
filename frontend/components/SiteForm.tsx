
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';

interface Site {
  id: string;
  name: string;
  location: string;
  totalWorkers: number;
  presentWorkers: number;
}

interface SiteFormProps {
  site?: Site | null;
  onSave: (site: Omit<Site, 'id' | 'totalWorkers' | 'presentWorkers'> & { id?: string }) => void;
  onClose: () => void;
}

const SiteForm: React.FC<SiteFormProps> = ({ site, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (site) {
      setName(site.name);
      setLocation(site.location);
    } else {
      setName('');
      setLocation('');
    }
  }, [site]);

  const handleSave = () => {
    if (!name.trim() || !location.trim()) {
      alert('Please fill in both name and location.');
      return;
    }
    onSave({ id: site?.id, name, location });
  };

  return (
    <ScrollView style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>{site ? 'Edit Site' : 'Add New Site'}</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Site Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g., Downtown Construction Project"
      />
      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="e.g., 123 Main St, Anytown"
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Site</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SiteForm;
