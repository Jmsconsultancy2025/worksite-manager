import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
 Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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

// Custom hooks for data management
const useWorkersData = () => {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [loading, setLoading] = useState(false);

  // Helper function to calculate today's advance total for a worker
  const calculateTodayAdvanceTotal = useCallback((workerData: any): number => {
    if (!workerData || !Array.isArray(workerData.advances)) return 0;
    const today = new Date().toISOString().split('T')[0];
    return workerData.advances
      .filter((advance: any) => advance && typeof advance === 'object' && advance.date === today && typeof advance.amount === 'number')
      .reduce((total: number, advance: any) => total + advance.amount, 0);
  }, []);

  // Load workers data from Backend API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to fetch from backend first
      try {
        const response = await fetch('http://localhost:8001/api/workers');
        if (response.ok) {
          const backendWorkers = await response.json();
          console.log('✅ Workers loaded from backend:', backendWorkers.length);
          
          // Map backend data to frontend format
          const mappedWorkers = backendWorkers.map((w: any) => ({
            id: w.id,
            name: w.name,
            phone: w.phone,
            role: w.role,
            site: w.site_id || 'Zonuam Site',
            dailyRate: w.daily_rate || 500,
            attendanceStatus: 'absent',
            advances: w.advances || [],
            payments: w.payments || [],
            hidden: w.hidden || false,
            todayAdvanceTotal: 0,
          }));
          
          setWorkers(mappedWorkers);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('⚠️ Backend not available, using localStorage fallback');
      }
      
      // Fallback to localStorage if backend fails
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
    } finally {
      setLoading(false);
    }
  }, [calculateTodayAdvanceTotal]);

  // Update worker in state
  const updateWorker = useCallback((workerId: string, updates: Partial<Worker>) => {
    setWorkers(prevWorkers =>
      prevWorkers.map(worker =>
        worker.id === workerId ? { ...worker, ...updates } : worker
      )
    );
  }, []);

  // Add new worker
  const addWorker = useCallback(async (newWorker: Worker) => {
    const updatedWorkers = [...workers, newWorker];
    setWorkers(updatedWorkers);
    await saveWorkersList(updatedWorkers);
  }, [workers]);

  // Delete worker
  const deleteWorker = useCallback(async (workerId: string) => {
    const updatedWorkers = workers.filter(worker => worker.id !== workerId);
    setWorkers(updatedWorkers);
    await saveWorkersList(updatedWorkers);
  }, [workers]);

  useFocusEffect(
    React.useCallback(() => {
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
    }, [loadData])
  );

  return {
    workers,
    loading,
    loadData,
    updateWorker,
    addWorker,
    deleteWorker,
    refreshData: loadData
  };
};

// Custom hook for modal state management
const useModalState = () => {
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [advanceModalVisible, setAdvanceModalVisible] = useState(false);
  const [overtimeModalVisible, setOvertimeModalVisible] = useState(false);
  const [adjustmentModalVisible, setAdjustmentModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const closeAllModals = useCallback(() => {
    setIsAddWorkerModalOpen(false);
    setOptionsModalVisible(false);
    setAdvanceModalVisible(false);
    setOvertimeModalVisible(false);
    setAdjustmentModalVisible(false);
    setEditModalVisible(false);
  }, []);

  return {
    isAddWorkerModalOpen,
    setIsAddWorkerModalOpen,
    optionsModalVisible,
    setOptionsModalVisible,
    advanceModalVisible,
    setAdvanceModalVisible,
    overtimeModalVisible,
    setOvertimeModalVisible,
    adjustmentModalVisible,
    setAdjustmentModalVisible,
    editModalVisible,
    setEditModalVisible,
    closeAllModals
  };
};

// Custom hook for form state management
const useFormState = () => {
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [overtimeRate, setOvertimeRate] = useState('');
  const [overtimeHours, setOvertimeHours] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');

  const resetForm = useCallback(() => {
    setSelectedWorker(null);
    setAdvanceAmount('');
    setAdvanceDate(new Date().toISOString().split('T')[0]);
    setOvertimeRate('');
    setOvertimeHours('');
    setAdjustmentAmount('');
    setAdjustmentNote('');
    setEditName('');
    setEditPhone('');
    setEditRole('');
  }, []);

  return {
    selectedWorker,
    setSelectedWorker,
    advanceAmount,
    setAdvanceAmount,
    advanceDate,
    setAdvanceDate,
    overtimeRate,
    setOvertimeRate,
    overtimeHours,
    setOvertimeHours,
    adjustmentAmount,
    setAdjustmentAmount,
    adjustmentNote,
    setAdjustmentNote,
    editName,
    setEditName,
    editPhone,
    setEditPhone,
    editRole,
    setEditRole,
    resetForm
  };
};

export default function WorkersPage() {
  const router = useRouter();
  const { site } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showHiddenWorkers, setShowHiddenWorkers] = useState(false);

  // Custom hooks
  const { workers, loading, loadData, updateWorker, addWorker, deleteWorker } = useWorkersData();
  const modalState = useModalState();
  const formState = useFormState();

  const siteParam = site as string;

  // Filtered workers based on search, site, and hidden status
  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            worker.phone.includes(searchQuery);
      const matchesSite = !siteParam || siteParam === 'All Sites' || worker.site === siteParam;
      const matchesHidden = showHiddenWorkers || !worker.hidden;
      return matchesSearch && matchesSite && matchesHidden;
    });
  }, [workers, searchQuery, siteParam, showHiddenWorkers]);

  // Debug logging
  useEffect(() => {
    console.log('Workers Page - Site Param:', siteParam);
    console.log('Workers Page - Total Workers:', workers.length);
    console.log('Workers Page - Filtered Workers:', filteredWorkers.length);
    console.log('Workers Page - Worker Sites:', workers.map(w => w.site));
  }, [siteParam, workers, filteredWorkers]);

  // Attendance management functions
  const getTodayAttendanceStatus = useCallback(async (workerId: string): Promise<AttendanceStatus> => {
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
  }, []);

  const updateAttendanceStatus = useCallback(async (workerId: string, status: AttendanceStatus, dailyRate?: number) => {
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
    updateWorker(workerId, { attendanceStatus: status });
    modalState.setOptionsModalVisible(false);
  }, [updateWorker, modalState]);

  // Handle badge click
  const handleBadgeClick = useCallback(async (worker: Worker, status: AttendanceStatus) => {
    const newStatus = worker.attendanceStatus === status ? null : status;
    await updateAttendanceStatus(worker.id, newStatus, worker.dailyRate);
  }, [updateAttendanceStatus]);

  // Modal handlers
  const openOptionsMenu = useCallback((worker: Worker) => {
    formState.setSelectedWorker(worker);
    modalState.setOptionsModalVisible(true);
  }, [formState, modalState]);

  const openAdvanceModal = useCallback((worker: Worker) => {
    formState.setSelectedWorker(worker);
    formState.setAdvanceAmount('');
    modalState.setAdvanceModalVisible(true);
  }, [formState, modalState]);

  // Worker management functions
  const handleGiveAdvance = useCallback(async () => {
    if (!formState.selectedWorker) return;

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

    const amount = parseFloat(formState.advanceAmount);
    if (isNaN(amount) || amount <= 0 || amount > formState.selectedWorker.maxAdvanceLimit) {
      Alert.alert('Error', `Please enter a valid payout amount between ₹1 and ₹${formState.selectedWorker.maxAdvanceLimit}`);
      return;
    }

    try {
      // Load worker profile data from AsyncStorage
      const storedData = await AsyncStorage.getItem(`worker_${formState.selectedWorker.id}`);
      if (storedData) {
        const workerData = JSON.parse(storedData);

        // Add new advance to worker's data
        const newAdvance = {
          date: formState.advanceDate,
          amount: amount,
        };

        workerData.advances = [...(workerData.advances || []), newAdvance];

        // Save updated data back to AsyncStorage
        await AsyncStorage.setItem(`worker_${formState.selectedWorker.id}`, JSON.stringify(workerData));

        // Update local state with new total
        const today = new Date().toISOString().split('T')[0];
        const newTotal = workerData.advances
          .filter((advance: any) => advance && typeof advance === 'object' && advance.date === today && typeof advance.amount === 'number')
          .reduce((total: number, advance: any) => total + advance.amount, 0);

        updateWorker(formState.selectedWorker.id, { todayAdvanceTotal: newTotal });

        Alert.alert('Success', `Payout of ₹${amount} given to ${formState.selectedWorker.name}`);
        modalState.setAdvanceModalVisible(false);
        formState.setAdvanceAmount('');
      } else {
        Alert.alert('Error', 'Worker profile not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record payout');
    }
  }, [formState, modalState, updateWorker, router]);

  const handleAddOvertime = useCallback(async () => {
    if (!formState.selectedWorker) return;

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

    const rate = parseFloat(formState.overtimeRate);
    const hours = parseFloat(formState.overtimeHours);

    if (isNaN(rate) || isNaN(hours) || rate <= 0 || hours <= 0) {
      Alert.alert('Error', 'Please enter valid rate and hours');
      return;
    }

    try {
      const storedData = await AsyncStorage.getItem(`worker_${formState.selectedWorker.id}`);
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

        await AsyncStorage.setItem(`worker_${formState.selectedWorker.id}`, JSON.stringify(workerData));

        Alert.alert('Success', `Overtime of ₹${overtimeEntry.amount} added for ${formState.selectedWorker.name}`);
        modalState.setOvertimeModalVisible(false);
        formState.setOvertimeRate('');
        formState.setOvertimeHours('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add overtime');
    }
  }, [formState, modalState, router]);

  const handleAddAdjustment = useCallback(async () => {
    if (!formState.selectedWorker) return;

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

    const amount = parseFloat(formState.adjustmentAmount);

    if (isNaN(amount) || amount === 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (formState.adjustmentNote.length > 100) {
      Alert.alert('Error', 'Note must be 100 characters or less');
      return;
    }

    try {
      const storedData = await AsyncStorage.getItem(`worker_${formState.selectedWorker.id}`);
      if (storedData) {
        const workerData = JSON.parse(storedData);

        const adjustmentEntry = {
          date: new Date().toISOString().split('T')[0],
          amount: amount,
          note: formState.adjustmentNote || 'No note',
        };

        workerData.adjustmentEntries = [...(workerData.adjustmentEntries || []), adjustmentEntry];
        workerData.otherAdjustments = (workerData.otherAdjustments || 0) + amount;

        await AsyncStorage.setItem(`worker_${formState.selectedWorker.id}`, JSON.stringify(workerData));

        Alert.alert('Success', `Adjustment of ₹${amount} added for ${formState.selectedWorker.name}`);
        modalState.setAdjustmentModalVisible(false);
        formState.setAdjustmentAmount('');
        formState.setAdjustmentNote('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add adjustment');
    }
  }, [formState, modalState, router]);

  const handleHideWorker = useCallback(async (workerId: string) => {
    await updateWorkerHiddenStatus(workerId, true);
    updateWorker(workerId, { hidden: true });
    Alert.alert('Success', 'Worker hidden successfully!');
  }, [updateWorker]);

  const handleActivateWorker = useCallback(async (workerId: string) => {
    await updateWorkerHiddenStatus(workerId, false);
    updateWorker(workerId, { hidden: false });
    Alert.alert('Success', 'Worker activated successfully!');
  }, [updateWorker]);

  const handleDeleteWorker = useCallback(async (workerId: string) => {
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
              await deleteWorker(workerId);
              Alert.alert('Success', 'Worker deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete worker');
            }
          }
        }
      ]
    );
  }, [deleteWorker]);

  const handleEditWorker = useCallback((worker: Worker) => {
    formState.setSelectedWorker(worker);
    formState.setEditName(worker.name);
    formState.setEditPhone(worker.phone);
    formState.setEditRole(worker.role);
    modalState.setEditModalVisible(true);
  }, [formState, modalState]);

  const handleSaveEdit = useCallback(async () => {
    if (!formState.selectedWorker) return;

    if (!formState.editName.trim() || !formState.editPhone.trim() || !formState.editRole.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Load existing worker data
      const storedData = await AsyncStorage.getItem(`worker_${formState.selectedWorker.id}`);
      let workerData = storedData ? JSON.parse(storedData) : {};

      // Update worker data
      workerData.name = formState.editName.trim();
      workerData.phone = formState.editPhone.trim();
      workerData.role = formState.editRole.trim();

      // Save updated data
      await AsyncStorage.setItem(`worker_${formState.selectedWorker.id}`, JSON.stringify(workerData));

      // Update local state
      updateWorker(formState.selectedWorker.id, {
        name: formState.editName.trim(),
        phone: formState.editPhone.trim(),
        role: formState.editRole.trim()
      });

      Alert.alert('Success', 'Worker updated successfully!');
      modalState.setEditModalVisible(false);
      formState.resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to update worker');
    }
  }, [formState, modalState, updateWorker]);

  const handleAddWorker = useCallback(async (newWorkerData: NewWorkerData) => {
    try {
      // Create worker via API
      const response = await fetch('http://localhost:8001/api/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newWorkerData.name,
          phone: newWorkerData.phone,
          role: newWorkerData.role,
          daily_rate: newWorkerData.dailyRate,
          site_id: newWorkerData.site || siteParam || 'Zonuam Site',
        }),
      });

      if (response.ok) {
        const newWorker = await response.json();
        console.log('✅ Worker added to backend:', newWorker);
        
        // Reload workers from backend
        await loadData();
        Alert.alert('Success', 'Worker added successfully!');
      } else {
        throw new Error('Failed to add worker');
      }
    } catch (error) {
      console.error('❌ Error adding worker:', error);
      
      // Fallback to localStorage
      const newWorkerId = Math.max(...workers.map(w => parseInt(w.id)), 0) + 1;
      const newWorker: Worker = {
        id: newWorkerId.toString(),
        name: newWorkerData.name,
        phone: newWorkerData.phone,
        role: newWorkerData.role,
        attendanceStatus: null,
        overtime: false,
        maxAdvanceLimit: 5000,
        hidden: false,
        todayAdvanceTotal: 0,
        dailyRate: newWorkerData.dailyRate,
        site: newWorkerData.site || siteParam || 'All Sites',
      };

      await addWorker(newWorker);
      Alert.alert('Success', `Worker ${newWorkerData.name} added successfully!`);
    }

    // Close modal and reset form
    modalState.setIsAddWorkerModalOpen(false);
    formState.resetForm();
  }, [workers, siteParam, addWorker, modalState, formState, router, loadData]);

  // Edit worker handler
  const handleEditWorker = useCallback((worker: Worker) => {
    formState.setFormName(worker.name);
    formState.setFormPhone(worker.phone);
    formState.setFormRole(worker.role);
    formState.setFormDailyRate(worker.dailyRate.toString());
    formState.setEditingWorkerId(worker.id);
    modalState.setIsAddWorkerModalOpen(true);
  }, [formState, modalState]);

  // Update worker handler
  const handleUpdateWorker = useCallback(async (workerId: string, updatedData: NewWorkerData) => {
    try {
      // Try backend API first
      const response = await fetch(`http://localhost:8001/api/workers/${workerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedData.name,
          phone: updatedData.phone,
          role: updatedData.role,
          daily_rate: updatedData.dailyRate,
        }),
      });

      if (response.ok) {
        await loadData();
        Alert.alert('Success', 'Worker updated successfully!');
      } else {
        throw new Error('Failed to update worker');
      }
    } catch (error) {
      console.error('❌ Error updating worker:', error);
      
      // Fallback to localStorage
      const updatedWorker = workers.find(w => w.id === workerId);
      if (updatedWorker) {
        updatedWorker.name = updatedData.name;
        updatedWorker.phone = updatedData.phone;
        updatedWorker.role = updatedData.role;
        updatedWorker.dailyRate = updatedData.dailyRate;
        await updateWorker(updatedWorker);
        Alert.alert('Success', 'Worker updated successfully!');
      }
    }

    modalState.setIsAddWorkerModalOpen(false);
    formState.resetForm();
    formState.setEditingWorkerId(null);
  }, [workers, updateWorker, loadData, modalState, formState]);

  // Delete worker handler
  const handleDeleteWorker = useCallback(async (workerId: string, workerName: string) => {
    Alert.alert(
      'Delete Worker',
      `Are you sure you want to delete ${workerName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Try backend API first
              const response = await fetch(`http://localhost:8001/api/workers/${workerId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                await loadData();
                Alert.alert('Success', 'Worker deleted successfully!');
              } else {
                throw new Error('Failed to delete worker');
              }
            } catch (error) {
              console.error('❌ Error deleting worker:', error);
              
              // Fallback to localStorage
              await deleteWorker(workerId);
              Alert.alert('Success', 'Worker deleted successfully!');
            }
          },
        },
      ]
    );
  }, [loadData, deleteWorker]);

  // Get badge style based on status
  const getBadgeStyle = useCallback((worker: Worker, badgeType: 'P' | 'H' | 'A') => {
    const statusMap = { P: 'present', H: 'halfday', A: 'absent' };
    const isActive = worker.attendanceStatus === statusMap[badgeType];

    if (isActive) {
      if (badgeType === 'P') return { backgroundColor: '#4CAF50', color: '#FFFFFF' };
      if (badgeType === 'H') return { backgroundColor: '#FFC107', color: '#FFFFFF' };
      if (badgeType === 'A') return { backgroundColor: '#F44336', color: '#FFFFFF' };
    }
    return { backgroundColor: '#E0E0E0', color: '#757575' };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading workers...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            filteredWorkers.map((worker) => (
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
                    
                    {/* Action Buttons */}
                    <View style={styles.workerActions}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => handleEditWorker(worker)}
                      >
                        <MaterialIcons name="edit" size={16} color="#3B82F6" />
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteWorker(worker.id, worker.name)}
                      >
                        <MaterialIcons name="delete" size={16} color="#EF4444" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                    
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
            ))
          )}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => modalState.setIsAddWorkerModalOpen(true)}
        >
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
        visible={modalState.optionsModalVisible}
        onRequestClose={() => modalState.setOptionsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => modalState.setOptionsModalVisible(false)}
        >
          <View style={styles.optionsModalContent}>
            <Text style={styles.optionsModalTitle}>
              Options for {formState.selectedWorker?.name}
            </Text>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => formState.selectedWorker && updateAttendanceStatus(formState.selectedWorker.id, 'present')}
            >
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.optionText}>Present</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => formState.selectedWorker && updateAttendanceStatus(formState.selectedWorker.id, 'absent')}
            >
              <MaterialIcons name="cancel" size={24} color="#F44336" />
              <Text style={styles.optionText}>Absent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => formState.selectedWorker && updateAttendanceStatus(formState.selectedWorker.id, 'halfday')}
            >
              <MaterialIcons name="timelapse" size={24} color="#FFC107" />
              <Text style={styles.optionText}>Half Day</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                modalState.setOptionsModalVisible(false);
                setTimeout(() => modalState.setOvertimeModalVisible(true), 300);
              }}
            >
              <MaterialIcons name="access-time" size={24} color="#2196F3" />
              <Text style={styles.optionText}>Overtime</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                modalState.setOptionsModalVisible(false);
                setTimeout(() => modalState.setAdjustmentModalVisible(true), 300);
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
        visible={modalState.advanceModalVisible}
        onRequestClose={() => modalState.setAdvanceModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => modalState.setAdvanceModalVisible(false)}
        >
          <Pressable style={styles.advanceModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.advanceModalTitle}>Payout</Text>

            <View style={styles.advanceForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Worker Name</Text>
                <View style={styles.formInputDisabled}>
                  <Text style={styles.formInputText}>{formState.selectedWorker?.name}</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="calendar-today" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={formState.advanceDate}
                    onChangeText={formState.setAdvanceDate}
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
                    value={formState.advanceAmount}
                    onChangeText={formState.setAdvanceAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.formHint}>
                  Maximum payout limit: ₹{formState.selectedWorker?.maxAdvanceLimit}
                </Text>
              </View>
            </View>

            <View style={styles.advanceModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => modalState.setAdvanceModalVisible(false)}
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
        visible={modalState.overtimeModalVisible}
        onRequestClose={() => modalState.setOvertimeModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => modalState.setOvertimeModalVisible(false)}
        >
          <Pressable style={styles.advanceModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.advanceModalTitle}>Overtime Entry</Text>
            <Text style={styles.modalSubtitle}>for {formState.selectedWorker?.name}</Text>

            <View style={styles.advanceForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Overtime Rate (₹ per hour)</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="currency-rupee" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={formState.overtimeRate}
                    onChangeText={formState.setOvertimeRate}
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
                    value={formState.overtimeHours}
                    onChangeText={formState.setOvertimeHours}
                    placeholder="Enter hours"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {formState.overtimeRate && formState.overtimeHours && !isNaN(parseFloat(formState.overtimeRate)) && !isNaN(parseFloat(formState.overtimeHours)) && (
                <Text style={styles.calculationHint}>
                  Total: ₹{(parseFloat(formState.overtimeRate) * parseFloat(formState.overtimeHours)).toFixed(0)}
                </Text>
              )}
            </View>

            <View style={styles.advanceModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => modalState.setOvertimeModalVisible(false)}
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
        visible={modalState.adjustmentModalVisible}
        onRequestClose={() => modalState.setAdjustmentModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => modalState.setAdjustmentModalVisible(false)}
        >
          <Pressable style={styles.advanceModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.advanceModalTitle}>Add Custom Amount</Text>
            <Text style={styles.modalSubtitle}>for {formState.selectedWorker?.name}</Text>

            <View style={styles.advanceForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount (₹)</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="currency-rupee" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={formState.adjustmentAmount}
                    onChangeText={formState.setAdjustmentAmount}
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
                  value={formState.adjustmentNote}
                  onChangeText={formState.setAdjustmentNote}
                  placeholder="Add a note about this adjustment (optional)"
                  multiline
                  numberOfLines={3}
                  maxLength={100}
                />
                <Text style={styles.characterCount}>
                  {formState.adjustmentNote.length}/100 characters
                </Text>
              </View>
            </View>

            <View style={styles.advanceModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => modalState.setAdjustmentModalVisible(false)}
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
        isOpen={modalState.isAddWorkerModalOpen}
        onClose={() => modalState.setIsAddWorkerModalOpen(false)}
        onAddWorker={handleAddWorker}
        currentSiteName={siteParam || "All Sites"}
      />

      {/* Edit Worker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalState.editModalVisible}
        onRequestClose={() => modalState.setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => modalState.setEditModalVisible(false)}
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
                    value={formState.editName}
                    onChangeText={formState.setEditName}
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
                    value={formState.editPhone}
                    onChangeText={formState.setEditPhone}
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
                    value={formState.editRole}
                    onChangeText={formState.setEditRole}
                    placeholder="Enter worker role"
                  />
                </View>
              </View>
            </View>

            <View style={styles.advanceModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => modalState.setEditModalVisible(false)}
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
   backgroundColor: '#FFFFFF',
 },
 container: {
   flex: 1,
   backgroundColor: '#FFFFFF',
 },
 loadingContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
 header: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 16,
   paddingVertical: 12,
   borderBottomWidth: 1,
   borderBottomColor: '#E0E0E0',
 },
 backButton: {
   marginRight: 12,
 },
 headerTextContainer: {
   flex: 1,
 },
 headerTitle: {
   fontSize: 18,
   fontWeight: 'bold',
   color: '#1A237E',
 },
 headerSubtitle: {
   fontSize: 14,
   color: '#757575',
   marginTop: 2,
 },
 searchContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   marginHorizontal: 16,
   marginVertical: 12,
   paddingHorizontal: 12,
   paddingVertical: 8,
   backgroundColor: '#F5F5F5',
   borderRadius: 8,
 },
 searchIcon: {
   marginRight: 8,
 },
 searchInput: {
   flex: 1,
   fontSize: 16,
   color: '#333333',
 },
 toggleContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   marginHorizontal: 16,
   marginVertical: 8,
 },
 toggleLabel: {
   fontSize: 16,
   color: '#333333',
 },
 toggleSwitch: {
   width: 50,
   height: 24,
   borderRadius: 12,
   backgroundColor: '#E0E0E0',
   justifyContent: 'center',
   paddingHorizontal: 2,
 },
 toggleSwitchActive: {
   backgroundColor: '#4CAF50',
 },
 toggleKnob: {
   width: 20,
   height: 20,
   borderRadius: 10,
   backgroundColor: '#FFFFFF',
   transform: [{ translateX: 0 }],
 },
 toggleKnobActive: {
   transform: [{ translateX: 26 }],
 },
 workersList: {
   flex: 1,
 },
 workersListContent: {
   paddingHorizontal: 16,
   paddingTop: 8,
 },
 emptyState: {
   alignItems: 'center',
   justifyContent: 'center',
   paddingVertical: 64,
 },
 emptyStateTitle: {
   fontSize: 20,
   fontWeight: 'bold',
   color: '#757575',
   marginTop: 16,
 },
 emptyStateText: {
   fontSize: 16,
   color: '#BDBDBD',
   textAlign: 'center',
   marginTop: 8,
   paddingHorizontal: 32,
 },
 workerCard: {
   flexDirection: 'row',
   backgroundColor: '#FFFFFF',
   borderRadius: 8,
   padding: 16,
   marginVertical: 4,
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 1,
   },
   shadowOpacity: 0.1,
   shadowRadius: 2,
   elevation: 2,
 },
 leftColumn: {
   flex: 1,
 },
 workerBasicInfo: {
   flex: 1,
 },
 workerName: {
   fontSize: 16,
   fontWeight: 'bold',
   color: '#333333',
 },
 workerPhone: {
   fontSize: 14,
   color: '#757575',
   marginTop: 2,
 },
 workerRole: {
   fontSize: 14,
   color: '#757575',
   marginTop: 2,
 },
 statusOptions: {
   flexDirection: 'row',
   alignItems: 'center',
   marginTop: 8,
 },
 statusText: {
   fontSize: 12,
   fontWeight: 'bold',
   marginRight: 8,
 },
 activeStatus: {
   color: '#4CAF50',
 },
 hideButton: {
   backgroundColor: '#FFC107',
   paddingHorizontal: 8,
   paddingVertical: 4,
   borderRadius: 4,
 },
 hideButtonText: {
   fontSize: 12,
   color: '#FFFFFF',
   fontWeight: 'bold',
 },
 activateButton: {
   backgroundColor: '#4CAF50',
   paddingHorizontal: 8,
   paddingVertical: 4,
   borderRadius: 4,
 },
 activateButtonText: {
   fontSize: 12,
   color: '#FFFFFF',
   fontWeight: 'bold',
 },
 middleColumn: {
   justifyContent: 'center',
   marginHorizontal: 12,
 },
 statusRow: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 badge: {
   width: 32,
   height: 32,
   borderRadius: 16,
   justifyContent: 'center',
   alignItems: 'center',
   marginRight: 8,
 },
 badgeText: {
   fontSize: 14,
   fontWeight: 'bold',
 },
 moreButton: {
   width: 32,
   height: 32,
   borderRadius: 16,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: '#F5F5F5',
 },
 rightColumn: {
   justifyContent: 'center',
 },
 advanceButton: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 12,
   paddingVertical: 6,
   borderRadius: 16,
   borderWidth: 1,
 },
 advanceButtonDefault: {
   borderColor: '#16A34A',
   backgroundColor: '#F0FDF4',
 },
 advanceButtonPaid: {
   borderColor: '#DC2626',
   backgroundColor: '#FEF2F2',
 },
 advanceButtonText: {
   fontSize: 12,
   fontWeight: 'bold',
   marginLeft: 4,
 },
 advanceButtonTextDefault: {
   color: '#16A34A',
 },
 advanceButtonTextPaid: {
   color: '#DC2626',
 },
 floatingButton: {
   position: 'absolute',
   bottom: 100,
   right: 20,
   width: 56,
   height: 56,
   borderRadius: 28,
   backgroundColor: '#4CAF50',
   justifyContent: 'center',
   alignItems: 'center',
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 2,
   },
   shadowOpacity: 0.25,
   shadowRadius: 4,
   elevation: 5,
 },
 bottomNav: {
   flexDirection: 'row',
   backgroundColor: '#FFFFFF',
   borderTopWidth: 1,
   borderTopColor: '#E0E0E0',
   paddingVertical: 8,
   paddingHorizontal: 16,
 },
 navItem: {
   flex: 1,
   alignItems: 'center',
   justifyContent: 'center',
 },
 navLabel: {
   fontSize: 12,
   color: '#9E9E9E',
   marginTop: 4,
 },
 navLabelActive: {
   color: '#4CAF50',
 },
 modalOverlay: {
   flex: 1,
   backgroundColor: 'rgba(0, 0, 0, 0.5)',
   justifyContent: 'center',
   alignItems: 'center',
 },
 optionsModalContent: {
   backgroundColor: '#FFFFFF',
   borderRadius: 8,
   padding: 16,
   marginHorizontal: 32,
   width: '80%',
 },
 optionsModalTitle: {
   fontSize: 18,
   fontWeight: 'bold',
   color: '#333333',
   marginBottom: 16,
   textAlign: 'center',
 },
 optionItem: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingVertical: 12,
   paddingHorizontal: 16,
   borderBottomWidth: 1,
   borderBottomColor: '#E0E0E0',
 },
 optionText: {
   fontSize: 16,
   color: '#333333',
   marginLeft: 12,
 },
 advanceModalContent: {
   backgroundColor: '#FFFFFF',
   borderRadius: 8,
   padding: 20,
   marginHorizontal: 20,
   width: '90%',
   maxHeight: '80%',
 },
 advanceModalTitle: {
   fontSize: 20,
   fontWeight: 'bold',
   color: '#333333',
   marginBottom: 4,
   textAlign: 'center',
 },
 modalSubtitle: {
   fontSize: 16,
   color: '#757575',
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
   fontSize: 16,
   fontWeight: 'bold',
   color: '#333333',
   marginBottom: 8,
 },
 formInputDisabled: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 12,
   paddingVertical: 12,
   backgroundColor: '#F5F5F5',
   borderRadius: 8,
   borderWidth: 1,
   borderColor: '#E0E0E0',
 },
 formInputText: {
   fontSize: 16,
   color: '#757575',
   flex: 1,
 },
 formInput: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 12,
   paddingVertical: 8,
   backgroundColor: '#FFFFFF',
   borderRadius: 8,
   borderWidth: 1,
   borderColor: '#E0E0E0',
 },
 formInputField: {
   fontSize: 16,
   color: '#333333',
   flex: 1,
   marginLeft: 8,
 },
 formHint: {
   fontSize: 12,
   color: '#757575',
   marginTop: 4,
 },
 textAreaInput: {
   paddingHorizontal: 12,
   paddingVertical: 8,
   backgroundColor: '#FFFFFF',
   borderRadius: 8,
   borderWidth: 1,
   borderColor: '#E0E0E0',
   fontSize: 16,
   color: '#333333',
   textAlignVertical: 'top',
 },
 characterCount: {
   fontSize: 12,
   color: '#757575',
   textAlign: 'right',
   marginTop: 4,
 },
 calculationHint: {
   fontSize: 14,
   color: '#4CAF50',
   fontWeight: 'bold',
   textAlign: 'center',
   marginTop: 8,
 },
 advanceModalButtons: {
   flexDirection: 'row',
   justifyContent: 'space-between',
 },
 cancelButton: {
   flex: 1,
   backgroundColor: '#F5F5F5',
   paddingVertical: 12,
   borderRadius: 8,
   marginRight: 8,
   alignItems: 'center',
 },
 cancelButtonText: {
   fontSize: 16,
   color: '#757575',
   fontWeight: 'bold',
 },
 giveAdvanceButton: {
   flex: 1,
   backgroundColor: '#4CAF50',
   paddingVertical: 12,
   borderRadius: 8,
   marginLeft: 8,
   alignItems: 'center',
 },
 giveAdvanceButtonText: {
   fontSize: 16,
   color: '#FFFFFF',
   fontWeight: 'bold',
 },
});