import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { updateAttendance, loadWorkers, updateWorkerHiddenStatus, checkWorkerLimit, getUserSubscription, updateSalary, isExpired, loadWorkersList, saveWorkersList } from '../lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddWorkerModal, NewWorkerData } from '../components/AddWorkerModal';

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
  hidden: boolean;
  todayAdvanceTotal: number;
  dailyRate: number;
  site: string;
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
    hidden: false,
    todayAdvanceTotal: 0,
    dailyRate: 500,
    site: 'Zonuam Site',
  },
  {
    id: '2',
    name: 'Liana',
    phone: '9876543211',
    role: 'Helper',
    attendanceStatus: null,
    overtime: false,
    maxAdvanceLimit: 3000,
    hidden: false,
    todayAdvanceTotal: 0,
    dailyRate: 300,
    site: 'Pu Sanga Building Site',
  },
  {
    id: '3',
    name: 'Rema',
    phone: '9876543212',
    role: 'Carpenter',
    attendanceStatus: null,
    overtime: false,
    maxAdvanceLimit: 4500,
    hidden: false,
    todayAdvanceTotal: 0,
    dailyRate: 450,
    site: 'Zonuam Site',
  },
  {
    id: '4',
    name: 'Joseph',
    phone: '9876543213',
    role: 'Electrician',
    attendanceStatus: null,
    overtime: false,
    maxAdvanceLimit: 4000,
    hidden: false,
    todayAdvanceTotal: 0,
    dailyRate: 400,
    site: 'Chaltlang Site',
  },
  {
    id: '5',
    name: 'Maria',
    phone: '9876543214',
    role: 'Painter',
    attendanceStatus: null,
    overtime: false,
    maxAdvanceLimit: 3500,
    hidden: false,
    todayAdvanceTotal: 0,
    dailyRate: 350,
    site: 'Pu Sanga Building Site',
  },
];

export default function WorkersPage() {
  const router = useRouter();
  const { site } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [showHiddenWorkers, setShowHiddenWorkers] = useState(false);
  const siteParam = site as string;

  // Helper function to calculate today's advance total for a worker
  const calculateTodayAdvanceTotal = (workerData: any): number => {
    if (!workerData || !Array.isArray(workerData.advances)) return 0;
    const today = new Date().toISOString().split('T')[0];
    return workerData.advances
      .filter((advance: any) => advance && typeof advance === 'object' && advance.date === today && typeof advance.amount === 'number')
      .reduce((total: number, advance: any) => total + advance.amount, 0);
  };

  // Load workers data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedWorkersList = await loadWorkersList();
        const storedWorkers = await loadWorkers();

        // If no stored workers list, use initial workers and save them
        let workersToUse = Array.isArray(storedWorkersList) && storedWorkersList.length > 0 ? storedWorkersList : initialWorkers;

        const updatedWorkers = workersToUse.map(worker => {
          const storedWorker = storedWorkers[worker.id];
          if (storedWorker) {
            // Check if attendance is expired (24 hours old)
            let attendanceStatus = null;
            if (Array.isArray(storedWorker.attendance) && storedWorker.attendance.length > 0) {
              const latestAttendance = storedWorker.attendance[storedWorker.attendance.length - 1];
              if (latestAttendance && !isExpired(latestAttendance.markedAt)) {
                attendanceStatus = latestAttendance.status === 'present' ? 'present' :
                                  latestAttendance.status === 'half' ? 'halfday' :
                                  latestAttendance.status === 'absent' ? 'absent' : null;
              }
            }
            return {
              ...worker,
              attendanceStatus: attendanceStatus,
              hidden: storedWorker.hidden || false,
              todayAdvanceTotal: calculateTodayAdvanceTotal(storedWorker)
            };
          }
          return worker;
        });
        setWorkers(updatedWorkers);

        // Save initial workers if none were stored
        if (!Array.isArray(storedWorkersList) || storedWorkersList.length === 0) {
          await saveWorkersList(initialWorkers);
        }
      } catch (error) {
        console.error('Error loading workers data:', error);
        // Fallback to initial workers
        setWorkers(initialWorkers);
      }
    };
    loadData();

    // Set up interval to check for day change and reset advances at midnight
    const checkDayChange = async () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const lastCheckedDate = await AsyncStorage.getItem('lastAdvanceCheckDate');

      if (lastCheckedDate !== currentDate) {
        // Day has changed, reset todayAdvanceTotal for all workers
        setWorkers(prevWorkers =>
          prevWorkers.map(worker => ({ ...worker, todayAdvanceTotal: 0 }))
        );
        await AsyncStorage.setItem('lastAdvanceCheckDate', currentDate);
      }
    };

    // Check immediately and then every minute
    checkDayChange();
    const interval = setInterval(checkDayChange, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);
  
  // Modal states
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [advanceModalVisible, setAdvanceModalVisible] = useState(false);
  const [overtimeModalVisible, setOvertimeModalVisible] = useState(false);
  const [adjustmentModalVisible, setAdjustmentModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  
  // Advance form state
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Overtime form state
  const [overtimeRate, setOvertimeRate] = useState('');
  const [overtimeHours, setOvertimeHours] = useState('');
  
  // Adjustment form state
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');

  // Add Worker Modal state
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);

  // Edit Worker Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');

  const filteredWorkers = workers.filter(
    (worker) => {
      const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            worker.phone.includes(searchQuery);
      const matchesSite = !siteParam || siteParam === 'All Sites' || worker.site === siteParam;
      const matchesHidden = showHiddenWorkers || !worker.hidden;
      return matchesSearch && matchesSite && matchesHidden;
    }
  );

  // Debug logging
  useEffect(() => {
    console.log('Workers Page - Site Param:', siteParam);
    console.log('Workers Page - Total Workers:', workers.length);
    console.log('Workers Page - Filtered Workers:', filteredWorkers.length);
    console.log('Workers Page - Worker Sites:', workers.map(w => w.site));
  }, [siteParam, workers, filteredWorkers]);

  const getTodayAttendanceStatus = async (workerId: string): Promise<AttendanceStatus> => {
    try {
      const storedWorkers = await loadWorkers();
      const workerData = storedWorkers[workerId];
      if (workerData && Array.isArray(workerData.attendance)) {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = workerData.attendance.find(a => a && typeof a === 'object' && a.date === today);
        if (todayRecord) {
          return todayRecord.status === 'present' ? 'present' :
                 todayRecord.status === 'half' ? 'halfday' :
                 todayRecord.status === 'absent' ? 'absent' : null;
        }
      }
    } catch (error) {
      console.error('Error getting attendance status:', error);
    }
    return null;
  };

  // Handle attendance status change
  const updateAttendanceStatus = async (workerId: string, status: AttendanceStatus, dailyRate?: number) => {
    const today = new Date().toISOString().split('T')[0];
    const attendanceStatus = status === 'present' ? 'present' : status === 'halfday' ? 'half' : status === 'absent' ? 'absent' : 'holiday';

    // Save to AsyncStorage using the storage helper
    await updateAttendance(workerId, today, attendanceStatus);

    // Update salary based on attendance status
    if (dailyRate) {
      let salaryAmount = 0;
      if (status === 'present') {
        salaryAmount = dailyRate;
      } else if (status === 'halfday') {
        salaryAmount = dailyRate * 0.5;
      } else if (status === 'absent') {
        salaryAmount = 0;
      }
      await updateSalary(workerId, today, salaryAmount);
    }

    // Update local state
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
  const handleBadgeClick = async (worker: Worker, status: AttendanceStatus) => {
    const newStatus = worker.attendanceStatus === status ? null : status;
    await updateAttendanceStatus(worker.id, newStatus, worker.dailyRate);
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
  const handleGiveAdvance = async () => {
    if (!selectedWorker) return;

    // Check if salary management is available in current plan
    const subscription = await getUserSubscription();
    if (subscription.plan === 'basic') {
      Alert.alert(
        'Feature Not Available',
        'Salary management and payouts are available in Standard and Pro plans. Upgrade to manage worker salaries.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/plans') }
        ]
      );
      return;
    }

    const amount = parseFloat(advanceAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedWorker.maxAdvanceLimit) {
      Alert.alert('Error', `Please enter a valid payout amount between ₹1 and ₹${selectedWorker.maxAdvanceLimit}`);
      return;
    }

    try {
      // Load worker profile data from AsyncStorage
      const storedData = await AsyncStorage.getItem(`worker_${selectedWorker.id}`);
      if (storedData) {
        const workerData = JSON.parse(storedData);

        // Add new advance to worker's data
        const newAdvance = {
          date: advanceDate,
          amount: amount,
        };

        workerData.advances = [...(workerData.advances || []), newAdvance];

        // Save updated data back to AsyncStorage
        await AsyncStorage.setItem(`worker_${selectedWorker.id}`, JSON.stringify(workerData));

        // Update local state with new total
        const newTotal = calculateTodayAdvanceTotal(workerData);
        setWorkers(prevWorkers =>
          prevWorkers.map(worker =>
            worker.id === selectedWorker.id ? { ...worker, todayAdvanceTotal: newTotal } : worker
          )
        );

        Alert.alert('Success', `Payout of ₹${amount} given to ${selectedWorker.name}`);
        setAdvanceModalVisible(false);
        setAdvanceAmount('');
      } else {
        Alert.alert('Error', 'Worker profile not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record payout');
    }
  };

  // Handle overtime entry
  const handleAddOvertime = async () => {
    if (!selectedWorker) return;

    // Check if advanced attendance tracking is available
    const subscription = await getUserSubscription();
    if (subscription.plan === 'basic') {
      Alert.alert(
        'Feature Not Available',
        'Overtime tracking is available in Standard and Pro plans. Upgrade to track overtime hours.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/plans') }
        ]
      );
      return;
    }

    const rate = parseFloat(overtimeRate);
    const hours = parseFloat(overtimeHours);

    if (isNaN(rate) || isNaN(hours) || rate <= 0 || hours <= 0) {
      Alert.alert('Error', 'Please enter valid rate and hours');
      return;
    }

    try {
      const storedData = await AsyncStorage.getItem(`worker_${selectedWorker.id}`);
      if (storedData) {
        const workerData = JSON.parse(storedData);

        const overtimeEntry = {
          date: new Date().toISOString().split('T')[0],
          rate: rate,
          hours: hours,
          amount: rate * hours,
        };

        workerData.overtimeEntries = [...(workerData.overtimeEntries || []), overtimeEntry];
        workerData.overtime = (workerData.overtime || 0) + overtimeEntry.amount;

        await AsyncStorage.setItem(`worker_${selectedWorker.id}`, JSON.stringify(workerData));

        Alert.alert('Success', `Overtime of ₹${overtimeEntry.amount} added for ${selectedWorker.name}`);
        setOvertimeModalVisible(false);
        setOvertimeRate('');
        setOvertimeHours('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add overtime');
    }
  };

  // Handle adjustment entry
  const handleAddAdjustment = async () => {
    if (!selectedWorker) return;

    // Check if advanced features are available
    const subscription = await getUserSubscription();
    if (subscription.plan === 'basic') {
      Alert.alert(
        'Feature Not Available',
        'Custom adjustments are available in Standard and Pro plans. Upgrade to add custom salary adjustments.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/plans') }
        ]
      );
      return;
    }

    const amount = parseFloat(adjustmentAmount);

    if (isNaN(amount) || amount === 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (adjustmentNote.length > 100) {
      Alert.alert('Error', 'Note must be 100 characters or less');
      return;
    }

    try {
      const storedData = await AsyncStorage.getItem(`worker_${selectedWorker.id}`);
      if (storedData) {
        const workerData = JSON.parse(storedData);

        const adjustmentEntry = {
          date: new Date().toISOString().split('T')[0],
          amount: amount,
          note: adjustmentNote || 'No note',
        };

        workerData.adjustmentEntries = [...(workerData.adjustmentEntries || []), adjustmentEntry];
        workerData.otherAdjustments = (workerData.otherAdjustments || 0) + amount;

        await AsyncStorage.setItem(`worker_${selectedWorker.id}`, JSON.stringify(workerData));

        Alert.alert('Success', `Adjustment of ₹${amount} added for ${selectedWorker.name}`);
        setAdjustmentModalVisible(false);
        setAdjustmentAmount('');
        setAdjustmentNote('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add adjustment');
    }
  };

  // Handle hide worker
  const handleHideWorker = async (workerId: string) => {
    await updateWorkerHiddenStatus(workerId, true);

    setWorkers(prevWorkers =>
      prevWorkers.map(worker =>
        worker.id === workerId ? { ...worker, hidden: true } : worker
      )
    );
    Alert.alert('Success', 'Worker hidden successfully!');
  };

  // Handle activate worker
  const handleActivateWorker = async (workerId: string) => {
    await updateWorkerHiddenStatus(workerId, false);

    setWorkers(prevWorkers =>
      prevWorkers.map(worker =>
        worker.id === workerId ? { ...worker, hidden: false } : worker
      )
    );
    Alert.alert('Success', 'Worker activated successfully!');
  };

  // Handle delete worker
  const handleDeleteWorker = async (workerId: string) => {
    Alert.alert(
      'Delete Worker',
      'Are you sure you want to delete this worker? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove from AsyncStorage
              await AsyncStorage.removeItem(`worker_${workerId}`);

              // Update local state
              const updatedWorkers = workers.filter(worker => worker.id !== workerId);
              setWorkers(updatedWorkers);

              // Save updated list to AsyncStorage
              await saveWorkersList(updatedWorkers);

              Alert.alert('Success', 'Worker deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete worker');
            }
          }
        }
      ]
    );
  };

  // Handle edit worker
  const handleEditWorker = (worker: Worker) => {
    setEditingWorker(worker);
    setEditName(worker.name);
    setEditPhone(worker.phone);
    setEditRole(worker.role);
    setEditModalVisible(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingWorker) return;

    if (!editName.trim() || !editPhone.trim() || !editRole.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Load existing worker data
      const storedData = await AsyncStorage.getItem(`worker_${editingWorker.id}`);
      let workerData = storedData ? JSON.parse(storedData) : {};

      // Update worker data
      workerData.name = editName.trim();
      workerData.phone = editPhone.trim();
      workerData.role = editRole.trim();

      // Save updated data
      await AsyncStorage.setItem(`worker_${editingWorker.id}`, JSON.stringify(workerData));

      // Update local state
      const updatedWorkers = workers.map(worker =>
        worker.id === editingWorker.id
          ? { ...worker, name: editName.trim(), phone: editPhone.trim(), role: editRole.trim() }
          : worker
      );
      setWorkers(updatedWorkers);

      // Save updated list to AsyncStorage
      await saveWorkersList(updatedWorkers);

      Alert.alert('Success', 'Worker updated successfully!');
      setEditModalVisible(false);
      setEditingWorker(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update worker');
    }
  };

  // Handle add worker
  const handleAddWorker = async (newWorkerData: NewWorkerData) => {
    // Check worker limit before adding
    const canAddWorker = await checkWorkerLimit(workers.length);
    if (!canAddWorker) {
      const subscription = await getUserSubscription();
      const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
      Alert.alert(
        'Worker Limit Reached',
        `Your ${planName} plan allows up to ${subscription.plan === 'basic' ? '10' : subscription.plan === 'standard' ? '50' : 'unlimited'} workers. Upgrade to add more workers.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/plans') }
        ]
      );
      return;
    }

    // For now, use a simple ID generation and add to the workers array
    const newWorkerId = Math.max(...workers.map(w => parseInt(w.id))) + 1;
    const newWorker: Worker = {
      id: newWorkerId.toString(),
      name: newWorkerData.name,
      phone: newWorkerData.phone,
      role: newWorkerData.role,
      attendanceStatus: null,
      overtime: false,
      maxAdvanceLimit: 5000, // Default limit
      hidden: false,
      todayAdvanceTotal: 0,
      dailyRate: newWorkerData.dailyRate,
      site: newWorkerData.site || siteParam || 'All Sites',
    };

    const updatedWorkers = [...workers, newWorker];
    setWorkers(updatedWorkers);

    // Save to AsyncStorage
    await saveWorkersList(updatedWorkers);

    Alert.alert('Success', `Worker ${newWorkerData.name} added successfully!`);
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
            <Text style={styles.headerTitle}>{siteParam ? `${siteParam} Workers` : 'All Workers'}</Text>
            <Text style={styles.headerSubtitle}>Viewing: {siteParam || 'All Sites'}</Text>
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

        {/* Show Hidden Workers Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Show Hidden Workers</Text>
          <TouchableOpacity
            style={[styles.toggleSwitch, showHiddenWorkers && styles.toggleSwitchActive]}
            onPress={() => setShowHiddenWorkers(!showHiddenWorkers)}
          >
            <View style={[styles.toggleKnob, showHiddenWorkers && styles.toggleKnobActive]} />
          </TouchableOpacity>
        </View>

        {/* Workers List */}
        <ScrollView
          style={styles.workersList}
          contentContainerStyle={styles.workersListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredWorkers.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="people-outline" size={64} color="#BDBDBD" />
              <Text style={styles.emptyStateTitle}>No Workers Found</Text>
              <Text style={styles.emptyStateText}>
                {siteParam && siteParam !== 'All Sites' 
                  ? `No workers found for ${siteParam}`
                  : 'No workers available. Add a worker to get started!'}
              </Text>
            </View>
          ) : (
            filteredWorkers.map((worker) => {
              const displayWorker = worker;

            return (
              <TouchableOpacity
                key={worker.id}
                style={styles.workerCard}
                onPress={() => router.push(`/workers/${worker.id}`)}
              >
                {/* Left Column: Worker Info */}
                <View style={styles.leftColumn}>
                  <View style={styles.workerBasicInfo}>
                    <Text style={styles.workerName}>{worker.name}</Text>
                    <Text style={styles.workerPhone}>{worker.phone}</Text>
                    <Text style={styles.workerRole}>{worker.role}</Text>
                    {/* Status Options */}
                    <View style={styles.statusOptions}>
                      {!worker.hidden ? (
                        <>
                          <Text style={[styles.statusText, styles.activeStatus]}>Active</Text>
                          <TouchableOpacity
                            style={styles.hideButton}
                            onPress={() => handleHideWorker(worker.id)}
                          >
                            <Text style={styles.hideButtonText}>Hide</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={styles.activateButton}
                          onPress={() => handleActivateWorker(worker.id)}
                        >
                          <Text style={styles.activateButtonText}>Activate</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>

                {/* Middle Column: Status Badges */}
                <View style={styles.middleColumn}>
                  <View style={styles.statusRow}>
                    <TouchableOpacity
                      style={[styles.badge, { backgroundColor: getBadgeStyle(displayWorker, 'P').backgroundColor }]}
                      onPress={() => handleBadgeClick(displayWorker, 'present')}
                    >
                      <Text style={[styles.badgeText, { color: getBadgeStyle(displayWorker, 'P').color }]}>P</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.badge, { backgroundColor: getBadgeStyle(displayWorker, 'H').backgroundColor }]}
                      onPress={() => handleBadgeClick(displayWorker, 'halfday')}
                    >
                      <Text style={[styles.badgeText, { color: getBadgeStyle(displayWorker, 'H').color }]}>H</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.badge, { backgroundColor: getBadgeStyle(displayWorker, 'A').backgroundColor }]}
                      onPress={() => handleBadgeClick(displayWorker, 'absent')}
                    >
                      <Text style={[styles.badgeText, { color: getBadgeStyle(displayWorker, 'A').color }]}>A</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.moreButton}
                      onPress={() => openOptionsMenu(displayWorker)}
                    >
                      <MaterialIcons name="more-vert" size={18} color="#757575" />
                    </TouchableOpacity>
                  </View>
                </View>

              {/* Right Column: Advance Button */}
              <View style={styles.rightColumn}>
                <TouchableOpacity
                  style={[
                    styles.advanceButton,
                    worker.todayAdvanceTotal > 0 ? styles.advanceButtonPaid : styles.advanceButtonDefault
                  ]}
                  onPress={() => openAdvanceModal(worker)}
                >
                  <MaterialIcons
                    name="currency-rupee"
                    size={13}
                    color={worker.todayAdvanceTotal > 0 ? "#DC2626" : "#16A34A"}
                  />
                  <Text style={[
                    styles.advanceButtonText,
                    worker.todayAdvanceTotal > 0 ? styles.advanceButtonTextPaid : styles.advanceButtonTextDefault
                  ]}>
                    {worker.todayAdvanceTotal > 0 ? `Rs ${worker.todayAdvanceTotal} Paid` : 'Payout'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            );
          }))}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.floatingButton} onPress={() => setIsAddWorkerModalOpen(true)}>
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
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/cashbook')}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#9E9E9E" />
            <Text style={styles.navLabel}>Cashbook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/notes')}>
            <MaterialIcons name="note" size={24} color="#9E9E9E" />
            <Text style={styles.navLabel}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/reports')}>
            <MaterialIcons name="bar-chart" size={24} color="#9E9E9E" />
            <Text style={styles.navLabel}>Reports</Text>
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

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                setOptionsModalVisible(false);
                setTimeout(() => setOvertimeModalVisible(true), 300);
              }}
            >
              <MaterialIcons name="access-time" size={24} color="#2196F3" />
              <Text style={styles.optionText}>Overtime</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                setOptionsModalVisible(false);
                setTimeout(() => setAdjustmentModalVisible(true), 300);
              }}
            >
              <MaterialIcons name="attach-money" size={24} color="#FF9800" />
              <Text style={styles.optionText}>Other Adjustments</Text>
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
            <Text style={styles.advanceModalTitle}>Payout</Text>
            
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
                <Text style={styles.formLabel}>Payout Amount</Text>
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
                  Maximum payout limit: ₹{selectedWorker?.maxAdvanceLimit}
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
                <Text style={styles.giveAdvanceButtonText}>Submit Payout</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Overtime Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={overtimeModalVisible}
        onRequestClose={() => setOvertimeModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setOvertimeModalVisible(false)}
        >
          <Pressable style={styles.advanceModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.advanceModalTitle}>Overtime Entry</Text>
            <Text style={styles.modalSubtitle}>for {selectedWorker?.name}</Text>
            
            <View style={styles.advanceForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Overtime Rate (₹ per hour)</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="currency-rupee" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={overtimeRate}
                    onChangeText={setOvertimeRate}
                    placeholder="Enter rate per hour"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Overtime Hours</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="access-time" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={overtimeHours}
                    onChangeText={setOvertimeHours}
                    placeholder="Enter hours"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {overtimeRate && overtimeHours && !isNaN(parseFloat(overtimeRate)) && !isNaN(parseFloat(overtimeHours)) && (
                <Text style={styles.calculationHint}>
                  Total: ₹{(parseFloat(overtimeRate) * parseFloat(overtimeHours)).toFixed(0)}
                </Text>
              )}
            </View>

            <View style={styles.advanceModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setOvertimeModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.giveAdvanceButton}
                onPress={handleAddOvertime}
              >
                <Text style={styles.giveAdvanceButtonText}>Add Overtime</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Adjustment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={adjustmentModalVisible}
        onRequestClose={() => setAdjustmentModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAdjustmentModalVisible(false)}
        >
          <Pressable style={styles.advanceModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.advanceModalTitle}>Add Custom Amount</Text>
            <Text style={styles.modalSubtitle}>for {selectedWorker?.name}</Text>
            
            <View style={styles.advanceForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount (₹)</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="currency-rupee" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={adjustmentAmount}
                    onChangeText={setAdjustmentAmount}
                    placeholder="Enter amount (+ or -)"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.formHint}>
                  Use negative (-) for deductions, positive for additions
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Note / Comment</Text>
                <TextInput
                  style={styles.textAreaInput}
                  value={adjustmentNote}
                  onChangeText={setAdjustmentNote}
                  placeholder="Add a note about this adjustment (optional)"
                  multiline
                  numberOfLines={3}
                  maxLength={100}
                />
                <Text style={styles.characterCount}>
                  {adjustmentNote.length}/100 characters
                </Text>
              </View>
            </View>

            <View style={styles.advanceModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAdjustmentModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.giveAdvanceButton}
                onPress={handleAddAdjustment}
              >
                <Text style={styles.giveAdvanceButtonText}>Add Amount</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Worker Modal */}
      <AddWorkerModal
        isOpen={isAddWorkerModalOpen}
        onClose={() => setIsAddWorkerModalOpen(false)}
        onAddWorker={handleAddWorker}
        currentSiteName={siteParam || "All Sites"}
      />

      {/* Edit Worker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable style={styles.advanceModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.advanceModalTitle}>Edit Worker</Text>

            <View style={styles.advanceForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="person" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter worker name"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="phone" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="Enter phone number"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Role</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="work" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={editRole}
                    onChangeText={setEditRole}
                    placeholder="Enter worker role"
                  />
                </View>
              </View>
            </View>

            <View style={styles.advanceModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.giveAdvanceButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.giveAdvanceButtonText}>Save Changes</Text>
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
    padding: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 35, 126, 0.1)',
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
  // Toggle Styles
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#4CAF50',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
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
  todayAdvanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 4,
  },
  // Status Options Styles
  statusOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeStatus: {
    color: '#4CAF50',
  },
  hideButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
    backgroundColor: '#FFFFFF',
  },
  hideButtonText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  activateButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  activateButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Action Buttons Styles
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#FFFFFF',
  },
  editButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F44336',
    backgroundColor: '#FFFFFF',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 4,
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
    gap: 3,
  },
  advanceButtonDefault: {
    borderColor: '#16A34A',
    backgroundColor: '#FFFFFF',
  },
  advanceButtonPaid: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  advanceButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  advanceButtonTextDefault: {
    color: '#16A34A',
  },
  advanceButtonTextPaid: {
    color: '#DC2626',
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
  modalSubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -12,
  },
  textAreaInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#424242',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 11,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 4,
  },
  calculationHint: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
});