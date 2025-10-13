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
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  
  // Modal states
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [advanceModalVisible, setAdvanceModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  
  // Advance form state
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.phone.includes(searchQuery)
  );

  // Handle attendance status change
  const updateAttendanceStatus = (workerId: string, status: AttendanceStatus) => {
    setWorkers(prevWorkers =>
      prevWorkers.map(worker =>
        worker.id === workerId
          ? { ...worker, attendanceStatus: status }
          : worker
      )
    );
    setOptionsModalVisible(false);
  };

  // Handle badge click
  const handleBadgeClick = (worker: Worker, status: AttendanceStatus) => {
    updateAttendanceStatus(worker.id, worker.attendanceStatus === status ? null : status);
  };

  // Open options menu
  const openOptionsMenu = (worker: Worker) => {
    setSelectedWorker(worker);
    setOptionsModalVisible(true);
  };

  // Open advance modal
  const openAdvanceModal = (worker: Worker) => {
    setSelectedWorker(worker);
    setAdvanceAmount('');
    setAdvanceModalVisible(true);
  };

  // Handle give advance
  const handleGiveAdvance = () => {
    if (selectedWorker && advanceAmount) {
      const amount = parseFloat(advanceAmount);
      if (amount > 0 && amount <= selectedWorker.maxAdvanceLimit) {
        // Here you would typically call an API to record the advance
        alert(`Advance of ₹${amount} given to ${selectedWorker.name}`);
        setAdvanceModalVisible(false);
      } else {
        alert(`Amount must be between ₹1 and ₹${selectedWorker.maxAdvanceLimit}`);
      }
    }
  };

  // Get badge style based on status
  const getBadgeStyle = (worker: Worker, badgeType: 'P' | 'H' | 'A') => {
    const statusMap = { P: 'present', H: 'halfday', A: 'absent' };
    const isActive = worker.attendanceStatus === statusMap[badgeType];
    
    if (isActive) {
      if (badgeType === 'P') return { backgroundColor: '#4CAF50', color: '#FFFFFF' };
      if (badgeType === 'H') return { backgroundColor: '#FFC107', color: '#FFFFFF' };
      if (badgeType === 'A') return { backgroundColor: '#F44336', color: '#FFFFFF' };
    }
    return { backgroundColor: '#E0E0E0', color: '#757575' };
  };

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
                  <TouchableOpacity
                    style={[styles.badge, { backgroundColor: getBadgeStyle(worker, 'P').backgroundColor }]}
                    onPress={() => handleBadgeClick(worker, 'present')}
                  >
                    <Text style={[styles.badgeText, { color: getBadgeStyle(worker, 'P').color }]}>P</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.badge, { backgroundColor: getBadgeStyle(worker, 'H').backgroundColor }]}
                    onPress={() => handleBadgeClick(worker, 'halfday')}
                  >
                    <Text style={[styles.badgeText, { color: getBadgeStyle(worker, 'H').color }]}>H</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.badge, { backgroundColor: getBadgeStyle(worker, 'A').backgroundColor }]}
                    onPress={() => handleBadgeClick(worker, 'absent')}
                  >
                    <Text style={[styles.badgeText, { color: getBadgeStyle(worker, 'A').color }]}>A</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => openOptionsMenu(worker)}
                  >
                    <MaterialIcons name="more-vert" size={18} color="#757575" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Right Column: Advance Button */}
              <View style={styles.rightColumn}>
                <TouchableOpacity
                  style={styles.advanceButton}
                  onPress={() => openAdvanceModal(worker)}
                >
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
            <MaterialIcons name="home" size={24} color="#757575" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="people" size={24} color="#181e29" />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Workers</Text>
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
      </View>

      {/* Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={styles.optionsModalContent}>
            <Text style={styles.optionsModalTitle}>
              Options for {selectedWorker?.name}
            </Text>
            
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => selectedWorker && updateAttendanceStatus(selectedWorker.id, 'present')}
            >
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.optionText}>Present</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => selectedWorker && updateAttendanceStatus(selectedWorker.id, 'absent')}
            >
              <MaterialIcons name="cancel" size={24} color="#F44336" />
              <Text style={styles.optionText}>Absent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => selectedWorker && updateAttendanceStatus(selectedWorker.id, 'halfday')}
            >
              <MaterialIcons name="timelapse" size={24} color="#FFC107" />
              <Text style={styles.optionText}>Half Day</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <MaterialIcons name="access-time" size={24} color="#2196F3" />
              <Text style={styles.optionText}>Overtime</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <MaterialIcons name="more-horiz" size={24} color="#757575" />
              <Text style={styles.optionText}>Others</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Advance Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={advanceModalVisible}
        onRequestClose={() => setAdvanceModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAdvanceModalVisible(false)}
        >
          <Pressable style={styles.advanceModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.advanceModalTitle}>Give Advance</Text>
            
            <View style={styles.advanceForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Worker Name</Text>
                <View style={styles.formInputDisabled}>
                  <Text style={styles.formInputText}>{selectedWorker?.name}</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="calendar-today" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={advanceDate}
                    onChangeText={setAdvanceDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount (₹)</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="currency-rupee" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={advanceAmount}
                    onChangeText={setAdvanceAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.formHint}>
                  Max limit: ₹{selectedWorker?.maxAdvanceLimit}
                </Text>
              </View>
            </View>

            <View style={styles.advanceModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAdvanceModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.giveAdvanceButton}
                onPress={handleGiveAdvance}
              >
                <Text style={styles.giveAdvanceButtonText}>Give Advance</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Right Column: Advance Button
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
    color: '#181e29',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Options Modal Styles
  optionsModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 320,
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
  optionsModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  optionText: {
    fontSize: 16,
    color: '#424242',
    marginLeft: 16,
    fontWeight: '500',
  },
  // Advance Modal Styles
  advanceModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
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
  advanceModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 20,
    textAlign: 'center',
  },
  advanceForm: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  formInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formInputDisabled: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formInputField: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    marginLeft: 8,
  },
  formInputText: {
    fontSize: 14,
    color: '#757575',
  },
  formHint: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  advanceModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  giveAdvanceButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  giveAdvanceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});