
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

interface Site {
  id: string;
  name: string;
  location: string;
  manager: string;
  totalWorkers: number;
  presentWorkers: number;
}

interface SiteCardProps {
  site: Site;
  onDelete: (siteId: string) => void;
  onEdit: (site: Site) => void;
}

const SiteCard: React.FC<SiteCardProps> = ({ site, onDelete, onEdit }) => {
  const router = useRouter();

  const handleCardPress = () => {
    router.push(`/workers?site=${encodeURIComponent(site.name)}`);
  };

  const handleEdit = () => {
    onEdit(site);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Site',
      `Are you sure you want to delete ${site.name}? This will also remove all workers assigned to this site.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(site.id),
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleCardPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.siteName}>{site.name}</Text>
        <Menu>
          <MenuTrigger>
            {/* The outer View prevents the card's onPress from firing */}
            <View onStartShouldSetResponder={() => true} style={styles.menuTrigger}>
              <MaterialIcons name="more-vert" size={20} color="#757575" />
            </View>
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: styles.menuOptionsContainer,
            }}
          >
            <MenuOption onSelect={handleEdit}>
              <View style={styles.menuOption}>
                <MaterialIcons name="edit" size={16} color="#424242" />
                <Text style={[styles.menuOptionText, { color: '#424242' }]}>Edit Site</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={handleDelete}>
              <View style={styles.menuOption}>
                <MaterialIcons name="delete" size={16} color="#E53935" />
                <Text style={styles.menuOptionText}>Delete Site</Text>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
      <Text style={styles.siteLocation}>{site.location}</Text>
      <Text style={styles.siteDetail}>Manager: {site.manager}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  siteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    flex: 1,
    marginRight: 8,
  },
  siteLocation: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 16,
  },
  siteDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  workerStat: {
    flex: 1,
    alignItems: 'center',
  },
  workerCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  workerLabel: {
    fontSize: 12,
    color: '#757575',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#F0F0F0',
  },
  menuTrigger: {
    padding: 8,
  },
  menuOptionsContainer: {
    borderRadius: 8,
    marginTop: 30,
    width: 150,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuOptionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#E53935',
  },
});

export default SiteCard;
