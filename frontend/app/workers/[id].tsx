import React, { useState, useMemo, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Alert,
  Linking,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getWorkerById, Worker, AttendanceRecord } from '../../data/workers';
import { updateAttendance as updateAttendanceStorage, loadWorkers, isExpired } from '../../lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Date formatting helper - DD-MM-YYYY format
function formatDDMMYYYY(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Toast notification component
const Toast = ({ message, visible, onHide }: { message: string; visible: boolean; onHide: () => void }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
      <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

export default function WorkerProfilePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const initialWorker = getWorkerById(id as string);

  // State
  const [workerData, setWorkerData] = useState<Worker | null>(initialWorker);
  const [attendanceView, setAttendanceView] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [advanceHistoryVisible, setAdvanceHistoryVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'from' | 'to'>('from');
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [selectedPayoutDate, setSelectedPayoutDate] = useState<string | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');

  const worker = workerData || initialWorker;

  // Load worker data from AsyncStorage on mount
  useEffect(() => {
    const loadWorkerData = async () => {
      try {
        const stored = await AsyncStorage.getItem(`worker_${id}`);
        if (stored) {
          const parsedData = JSON.parse(stored);
          setWorkerData(parsedData);
        }
      } catch (error) {
        console.error('Error loading worker data:', error);
      }
    };
    loadWorkerData();
  }, [id]);

  // Save worker data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveWorkerData = async () => {
      if (workerData) {
        try {
          await AsyncStorage.setItem(`worker_${id}`, JSON.stringify(workerData));
        } catch (error) {
          console.error('Error saving worker data:', error);
        }
      }
    };
    saveWorkerData();
  }, [workerData, id]);

  // Show toast notification
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  // Update attendance using unified storage function
  const updateAttendance = async (date: string, status: 'present' | 'half' | 'absent' | 'holiday') => {
    if (!workerData) return;

    const dateISO = typeof date === 'string' ? date : date.toISOString().split('T')[0];

    // Update via storage helper (saves to AsyncStorage with timestamp)
    const updatedWorkerData = await updateAttendanceStorage(id as string, dateISO, status);

    // Optimistic update: immediately refresh local state
    setWorkerData({
      ...workerData,
      attendance: updatedWorkerData.attendance || []
    });

    const statusLabels = {
      present: 'Present',
      half: 'Half Day',
      absent: 'Absent',
      holiday: 'Holiday',
    };
    showToast(`Attendance updated for ${formatDDMMYYYY(dateISO)}: ${statusLabels[status]}`);
    setAttendanceModalVisible(false);
  };

  // Handle date cell click
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setAttendanceModalVisible(true);
  };

  // Handle payout button click
  const handlePayoutClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedPayoutDate(dateStr);
    setPayoutAmount('');
    setPayoutModalVisible(true);
  };

  if (!worker) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Worker not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get current week dates
  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1 + (offset * 7));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedWeekOffset);

  // Get attendance for a specific date
  const getAttendanceForDate = (date: Date): AttendanceRecord | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    return worker.attendance.find(a => a.date === dateStr);
  };

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const weekDateStrings = weekDates.map(d => d.toISOString().split('T')[0]);
    const weekAttendance = worker.attendance.filter(a => weekDateStrings.includes(a.date));
    
    return {
      workingDays: weekAttendance.filter(a => a.status !== 'holiday').length,
      present: weekAttendance.filter(a => a.status === 'present').length,
      half: weekAttendance.filter(a => a.status === 'half').length,
      absent: weekAttendance.filter(a => a.status === 'absent').length,
    };
  }, [selectedWeekOffset, worker.attendance]);

  // Get monthly calendar dates
  const getMonthDates = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i));
    }
    return dates;
  };

  const monthDates = getMonthDates();

  // Calculate salary stats
  const salaryStats = useMemo(() => {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    
    const periodAttendance = worker.attendance.filter(a => {
      const date = new Date(a.date);
      return date >= fromDate && date <= toDate;
    });
    
    const presentDays = periodAttendance.filter(a => a.status === 'present').length;
    const halfDays = periodAttendance.filter(a => a.status === 'half').length;
    
    const dailyEarnings = (worker.dailyRate * presentDays) + (worker.dailyRate * 0.5 * halfDays);
    const totalAdvance = worker.advances
      .filter(a => new Date(a.date) >= fromDate && new Date(a.date) <= toDate)
      .reduce((sum, a) => sum + a.amount, 0);
    
    const totalEarnings = dailyEarnings + worker.overtime + worker.otherAdjustments;
    const netPayable = totalEarnings - totalAdvance;
    
    return {
      dailyEarnings,
      totalAdvance,
      overtime: worker.overtime,
      otherAdjustments: worker.otherAdjustments,
      totalEarnings,
      netPayable,
    };
  }, [dateFrom, dateTo, worker]);

  // Handle advance payment
  const handleAddAdvance = () => {
    if (!workerData) return;
    
    const amount = parseFloat(advanceAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid advance amount');
      return;
    }
    
    const newAdvance = {
      date: new Date().toISOString().split('T')[0],
      amount,
    };
    
    setWorkerData({
      ...workerData,
      advances: [...workerData.advances, newAdvance],
    });
    
    showToast(`Advance payment of ₹${amount} added successfully!`);
    setAdvanceAmount('');
  };

  // Handle payment
  const handleMarkPaid = () => {
    if (!workerData) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newPayment = {
      id: `p${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount,
      from: dateFrom,
      to: dateTo,
    };

    setWorkerData({
      ...workerData,
      payments: [...workerData.payments, newPayment],
    });

    showToast(`Payment of ₹${amount} recorded successfully!`);
    setPaymentAmount('');
  };

  // Handle payout for specific date
  const handlePayoutForDate = () => {
    if (!workerData || !selectedPayoutDate) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid payout amount');
      return;
    }

    const newAdvance = {
      date: selectedPayoutDate,
      amount,
    };

    setWorkerData({
      ...workerData,
      advances: [...workerData.advances, newAdvance],
    });

    showToast(`Payout of ₹${amount} recorded for ${formatDDMMYYYY(selectedPayoutDate)}!`);
    setPayoutAmount('');
    setPayoutModalVisible(false);
  };

  // Check if payout exists for a specific date
  const getPayoutForDate = (date: Date): number => {
    const dateStr = date.toISOString().split('T')[0];
    const payout = worker.advances.find(a => a.date === dateStr);
    return payout ? payout.amount : 0;
  };

  // Get status color - considers expiry (>24h)
  const getStatusColor = (status: string, markedAt?: number) => {
    // If expired, show gray
    if (markedAt && isExpired(markedAt)) {
      return '#9E9E9E'; // Gray
    }
    
    switch (status) {
      case 'present': return '#4CAF50'; // Green
      case 'half': return '#FFC107'; // Yellow
      case 'absent': return '#F44336'; // Red
      case 'holiday': return '#9E9E9E'; // Gray
      default: return '#E0E0E0'; // Light gray
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Worker Profile</Text>
        </View>

        {/* Worker Info Card - Compact */}
        <View style={styles.infoCard}>
          <View style={styles.compactHeader}>
            <Text style={styles.workerNameCompact}>{worker.name}</Text>
            <Text style={styles.workerRoleCompact}>{worker.role}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${worker.phone}`)} style={styles.phoneRow}>
              <MaterialIcons name="phone" size={16} color="#4CAF50" />
              <Text style={styles.phoneCompact}>{worker.phone}</Text>
            </TouchableOpacity>
            {/* Edit and Delete Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  // TODO: Implement edit functionality
                  Alert.alert('Edit Worker', 'Edit functionality will be implemented here');
                }}
              >
                <MaterialIcons name="edit" size={16} color="#2196F3" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
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
                            await AsyncStorage.removeItem(`worker_${worker.id}`);

                            // Navigate back to workers list
                            router.push('/workers');
                            showToast('Worker deleted successfully!');
                          } catch (error) {
                            Alert.alert('Error', 'Failed to delete worker');
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <MaterialIcons name="delete" size={16} color="#F44336" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Attendance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance</Text>
          
          {/* Toggle Buttons */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, attendanceView === 'weekly' && styles.toggleButtonActive]}
              onPress={() => setAttendanceView('weekly')}
            >
              <Text style={[styles.toggleText, attendanceView === 'weekly' && styles.toggleTextActive]}>
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, attendanceView === 'monthly' && styles.toggleButtonActive]}
              onPress={() => setAttendanceView('monthly')}
            >
              <Text style={[styles.toggleText, attendanceView === 'monthly' && styles.toggleTextActive]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>

          {attendanceView === 'weekly' ? (
            <View style={styles.weeklyView}>
              {/* Week Navigation */}
              <View style={styles.weekNav}>
                <TouchableOpacity onPress={() => setSelectedWeekOffset(selectedWeekOffset - 1)}>
                  <Text style={styles.navButton}>← Prev</Text>
                </TouchableOpacity>
                <Text style={styles.weekLabel}>
                  {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => setSelectedWeekOffset(selectedWeekOffset + 1)}>
                  <Text style={styles.navButton}>Next →</Text>
                </TouchableOpacity>
              </View>

              {/* Week Days - Vertical Layout */}
              <View style={styles.weekDaysVertical}>
                {weekDates.map((date, index) => {
                  const attendance = getAttendanceForDate(date);
                  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                  const statusColor = getStatusColor(attendance?.status || 'absent', attendance?.markedAt);
                  
                  return (
                    <TouchableOpacity key={index} style={styles.dayRowVertical} onPress={() => handleDateClick(date)}>
                      <View style={styles.dayInfo}>
                        <Text style={styles.dayNameVertical}>{dayNames[index]}</Text>
                        <Text style={styles.dayDateVertical}>{formatDDMMYYYY(date.toISOString().split('T')[0])}</Text>
                      </View>
                      <View style={styles.dayStatus}>
                        <View style={[styles.statusDotVertical, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusTextVertical, { color: statusColor }]}>
                          {attendance?.status === 'present' ? 'Present' : attendance?.status === 'half' ? 'Half Day' : attendance?.status === 'holiday' ? 'Holiday' : 'Absent'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.payoutButtonVertical,
                          getPayoutForDate(date) > 0 ? styles.payoutButtonPaid : styles.payoutButtonDefault
                        ]}
                        onPress={() => handlePayoutClick(date)}
                      >
                        <MaterialIcons
                          name="currency-rupee"
                          size={12}
                          color={getPayoutForDate(date) > 0 ? "#DC2626" : "#16A34A"}
                        />
                        <Text style={[
                          styles.payoutButtonTextVertical,
                          getPayoutForDate(date) > 0 ? styles.payoutButtonTextPaid : styles.payoutButtonTextDefault
                        ]}>
                          {getPayoutForDate(date) > 0 ? `Rs ${getPayoutForDate(date)} Paid` : 'Payout'}
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Weekly Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Working Days</Text>
                  <Text style={styles.statValue}>{weeklyStats.workingDays}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Present</Text>
                  <Text style={[styles.statValue, { color: '#4CAF50' }]}>{weeklyStats.present}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Half</Text>
                  <Text style={[styles.statValue, { color: '#FFC107' }]}>{weeklyStats.half}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Absent</Text>
                  <Text style={[styles.statValue, { color: '#F44336' }]}>{weeklyStats.absent}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.monthlyView}>
              {/* Month Navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity onPress={() => {
                  const newMonth = new Date(selectedMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setSelectedMonth(newMonth);
                }}>
                  <Text style={styles.navButton}>← Prev</Text>
                </TouchableOpacity>
                <Text style={styles.monthLabel}>
                  {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => {
                  const newMonth = new Date(selectedMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setSelectedMonth(newMonth);
                }}>
                  <Text style={styles.navButton}>Next →</Text>
                </TouchableOpacity>
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {monthDates.map((date, index) => {
                  const attendance = getAttendanceForDate(date);
                  const statusColor = getStatusColor(attendance?.status || 'absent', attendance?.markedAt);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.calendarCell,
                        { backgroundColor: statusColor + '20' }
                      ]}
                      onPress={() => handleDateClick(date)}
                    >
                      <Text style={styles.calendarDate}>{date.getDate()}</Text>
                      <View style={[styles.calendarDot, { backgroundColor: statusColor }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Salary & Earnings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Salary & Earnings</Text>
            <TouchableOpacity
              style={styles.viewAdvanceButton}
              onPress={() => setAdvanceHistoryVisible(true)}
            >
              <MaterialIcons name="receipt" size={18} color="#4CAF50" />
              <Text style={styles.viewAdvanceText}>View Payouts</Text>
            </TouchableOpacity>
          </View>
          
          {/* Date Range Selector */}
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>From</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => {
                  setDatePickerMode('from');
                  setDatePickerVisible(true);
                }}
              >
                <MaterialIcons name="calendar-today" size={18} color="#4CAF50" />
                <Text style={styles.datePickerButtonText}>
                  {formatDDMMYYYY(dateFrom)}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>To</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => {
                  setDatePickerMode('to');
                  setDatePickerVisible(true);
                }}
              >
                <MaterialIcons name="calendar-today" size={18} color="#4CAF50" />
                <Text style={styles.datePickerButtonText}>
                  {formatDDMMYYYY(dateTo)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>


          {/* Salary Cards */}
          <View style={styles.salaryGrid}>
            <View style={[styles.salaryCard, { borderLeftColor: '#4CAF50' }]}>
              <Text style={styles.salaryLabel}>Daily Earnings</Text>
              <Text style={styles.salaryValue}>₹{salaryStats.dailyEarnings.toFixed(0)}</Text>
            </View>

            <View style={[styles.salaryCard, { borderLeftColor: '#F44336' }]}>
              <Text style={styles.salaryLabel}>Total Payout</Text>
              <Text style={[styles.salaryValue, { color: '#F44336' }]}>₹{salaryStats.totalAdvance.toFixed(0)}</Text>
            </View>

            <View style={[styles.salaryCard, { borderLeftColor: '#2196F3' }]}>
              <Text style={styles.salaryLabel}>Overtime</Text>
              <Text style={styles.salaryValue}>₹{salaryStats.overtime}</Text>
            </View>

            <View style={[styles.salaryCard, { borderLeftColor: '#FF9800' }]}>
              <Text style={styles.salaryLabel}>Other Adjustments</Text>
              <Text style={styles.salaryValue}>₹{salaryStats.otherAdjustments}</Text>
            </View>

            <View style={[styles.salaryCard, { borderLeftColor: '#4CAF50' }]}>
              <Text style={styles.salaryLabel}>Total Earnings</Text>
              <Text style={styles.salaryValue}>₹{salaryStats.totalEarnings.toFixed(0)}</Text>
            </View>

            <View style={[styles.salaryCard, styles.netPayableCard]}>
              <Text style={[styles.salaryLabel, { color: '#FFFFFF' }]}>Net Payable</Text>
              <Text style={[styles.salaryValue, { color: '#FFFFFF', fontSize: 22 }]}>
                ₹{salaryStats.netPayable.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Record Payment</Text>
          <View style={styles.paymentContainer}>
            <View style={styles.paymentInput}>
              <MaterialIcons name="currency-rupee" size={20} color="#757575" />
              <TextInput
                style={styles.paymentField}
                placeholder="Actual Amount Paid"
                keyboardType="numeric"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
              />
            </View>
            <TouchableOpacity style={styles.markPaidButton} onPress={handleMarkPaid}>
              <Text style={styles.markPaidText}>Mark Paid</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction History */}
          {workerData && workerData.payments.length > 0 && (
            <View style={styles.transactionHistory}>
              <Text style={styles.transactionTitle}>Payment History</Text>
              {workerData.payments.map((payment) => (
                <View key={payment.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionAmount}>₹{payment.amount}</Text>
                    <Text style={styles.transactionDate}>
                      {new Date(payment.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </Text>
                  </View>
                  <View style={styles.transactionPeriod}>
                    <Text style={styles.transactionPeriodText}>
                      {new Date(payment.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(payment.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Attendance Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={attendanceModalVisible}
        onRequestClose={() => setAttendanceModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAttendanceModalVisible(false)}
        >
          <Pressable style={styles.attendanceModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.attendanceModalTitle}>Mark Attendance</Text>
            <Text style={styles.attendanceModalDate}>
              {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            
            <View style={styles.attendanceOptions}>
              <TouchableOpacity
                style={[styles.attendanceOption, { backgroundColor: '#E8F5E9' }]}
                onPress={() => selectedDate && updateAttendance(selectedDate, 'present')}
              >
                <MaterialIcons name="check-circle" size={32} color="#4CAF50" />
                <Text style={[styles.attendanceOptionText, { color: '#4CAF50' }]}>Present</Text>
                <Text style={styles.attendanceOptionHint}>Full day</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.attendanceOption, { backgroundColor: '#FFF9E6' }]}
                onPress={() => selectedDate && updateAttendance(selectedDate, 'half')}
              >
                <MaterialIcons name="timelapse" size={32} color="#FFC107" />
                <Text style={[styles.attendanceOptionText, { color: '#FFC107' }]}>Half Day</Text>
                <Text style={styles.attendanceOptionHint}>50% pay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.attendanceOption, { backgroundColor: '#FFEBEE' }]}
                onPress={() => selectedDate && updateAttendance(selectedDate, 'absent')}
              >
                <MaterialIcons name="cancel" size={32} color="#F44336" />
                <Text style={[styles.attendanceOptionText, { color: '#F44336' }]}>Absent</Text>
                <Text style={styles.attendanceOptionHint}>No pay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.attendanceOption, { backgroundColor: '#F5F5F5' }]}
                onPress={() => selectedDate && updateAttendance(selectedDate, 'holiday')}
              >
                <MaterialIcons name="wb-sunny" size={32} color="#9E9E9E" />
                <Text style={[styles.attendanceOptionText, { color: '#9E9E9E' }]}>Holiday</Text>
                <Text style={styles.attendanceOptionHint}>Day off</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Advance History Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={advanceHistoryVisible}
        onRequestClose={() => setAdvanceHistoryVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAdvanceHistoryVisible(false)}
        >
          <Pressable style={styles.attendanceModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.attendanceModalTitle}>Payout History</Text>
            <Text style={styles.attendanceModalDate}>{workerData?.name}</Text>
            
            <ScrollView style={styles.advanceHistoryList}>
              {workerData && workerData.advances && workerData.advances.length > 0 ? (
                workerData.advances.map((advance, index) => (
                  <View key={index} style={styles.advanceHistoryItem}>
                    <View style={styles.advanceHistoryInfo}>
                      <MaterialIcons name="receipt" size={24} color="#FF9800" />
                      <View style={styles.advanceHistoryDetails}>
                        <Text style={styles.advanceHistoryAmount}>Rs {advance.amount} Paid</Text>
                        <Text style={styles.advanceHistoryDate}>
                          {formatDDMMYYYY(advance.date)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <MaterialIcons name="info-outline" size={48} color="#BDBDBD" />
                  <Text style={styles.emptyStateText}>No advance payments yet</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAdvanceHistoryVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={datePickerVisible}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDatePickerVisible(false)}
        >
          <Pressable style={styles.datePickerModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.datePickerModalTitle}>Select Date</Text>

            {/* Quick Date Selection */}
            <View style={styles.quickDateRow}>
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  if (datePickerMode === 'from') {
                    setDateFrom(today);
                  } else {
                    setDateTo(today);
                  }
                  setDatePickerVisible(false);
                }}
              >
                <Text style={styles.quickDateText}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const lastWeek = new Date();
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  const dateStr = lastWeek.toISOString().split('T')[0];
                  if (datePickerMode === 'from') {
                    setDateFrom(dateStr);
                  } else {
                    setDateTo(dateStr);
                  }
                  setDatePickerVisible(false);
                }}
              >
                <Text style={styles.quickDateText}>Last Week</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const lastMonth = new Date();
                  lastMonth.setMonth(lastMonth.getMonth() - 1);
                  const dateStr = lastMonth.toISOString().split('T')[0];
                  if (datePickerMode === 'from') {
                    setDateFrom(dateStr);
                  } else {
                    setDateTo(dateStr);
                  }
                  setDatePickerVisible(false);
                }}
              >
                <Text style={styles.quickDateText}>Last Month</Text>
              </TouchableOpacity>
            </View>

            {/* Manual Date Input */}
            <View style={styles.manualDateInput}>
              <Text style={styles.manualDateLabel}>Or enter date (DD-MM-YYYY):</Text>
              <TextInput
                style={styles.manualDateField}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="#9E9E9E"
                onChangeText={(text) => {
                  if (text.length === 10 && text.includes('-')) {
                    const parts = text.split('-');
                    if (parts.length === 3) {
                      const [dd, mm, yyyy] = parts;
                      const isoDate = `${yyyy}-${mm}-${dd}`;
                      const date = new Date(isoDate);
                      if (!isNaN(date.getTime())) {
                        if (datePickerMode === 'from') {
                          setDateFrom(isoDate);
                        } else {
                          setDateTo(isoDate);
                        }
                        setDatePickerVisible(false);
                      }
                    }
                  }
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.datePickerCloseButton}
              onPress={() => setDatePickerVisible(false)}
            >
              <Text style={styles.datePickerCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Payout Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={payoutModalVisible}
        onRequestClose={() => setPayoutModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPayoutModalVisible(false)}
        >
          <Pressable style={styles.attendanceModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.attendanceModalTitle}>Record Payout</Text>
            <Text style={styles.attendanceModalDate}>
              {selectedPayoutDate && new Date(selectedPayoutDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>

            <View style={styles.payoutForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Worker Name</Text>
                <View style={styles.formInputDisabled}>
                  <Text style={styles.formInputText}>{worker.name}</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Payout Amount</Text>
                <View style={styles.formInput}>
                  <MaterialIcons name="currency-rupee" size={20} color="#757575" />
                  <TextInput
                    style={styles.formInputField}
                    value={payoutAmount}
                    onChangeText={setPayoutAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.advanceModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPayoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.giveAdvanceButton}
                onPress={handlePayoutForDate}
              >
                <Text style={styles.giveAdvanceButtonText}>Record Payout</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Toast Notification */}
      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
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
  // Header
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  // Worker Info Card - Compact
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
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
  compactHeader: {
    alignItems: 'center',
    gap: 8,
  },
  workerNameCompact: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    textAlign: 'center',
  },
  workerRoleCompact: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  phoneCompact: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 12,
  },
  // Attendance Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Weekly View
  weeklyView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  weekLabel: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  // Vertical Week Days
  weekDaysVertical: {
    marginBottom: 16,
  },
  dayRowVertical: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
  },
  dayInfo: {
    flex: 1,
  },
  dayNameVertical: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 2,
  },
  dayDateVertical: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  dayStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDotVertical: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTextVertical: {
    fontSize: 13,
    fontWeight: '600',
  },
  payoutButtonVertical: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
    marginLeft: 8,
  },
  payoutButtonDefault: {
    borderColor: '#16A34A',
    backgroundColor: '#FFFFFF',
  },
  payoutButtonPaid: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  payoutButtonTextVertical: {
    fontSize: 10,
    fontWeight: '600',
  },
  payoutButtonTextDefault: {
    color: '#16A34A',
  },
  payoutButtonTextPaid: {
    color: '#DC2626',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
  },
  // Monthly View
  monthlyView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calendarCell: {
    width: 45,
    height: 45,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
  },
  calendarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  // Salary Section
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  dateField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  salaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  salaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderLeftWidth: 4,
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
  salaryLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  salaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
  },
  netPayableCard: {
    width: '100%',
    backgroundColor: '#1A237E',
    borderLeftWidth: 0,
  },
  // Payment Section
  paymentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  paymentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentField: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    marginLeft: 8,
  },
  markPaidButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  markPaidText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Transaction History
  transactionHistory: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#757575',
  },
  transactionPeriod: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  transactionPeriodText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  // Attendance Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceModalContent: {
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
  attendanceModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 8,
    textAlign: 'center',
  },
  attendanceModalDate: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
    textAlign: 'center',
  },
  attendanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  attendanceOption: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  attendanceOptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  attendanceOptionHint: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  // Toast
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 9999,
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
  toastText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  // Section Header with Button
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAdvanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
  },
  viewAdvanceText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Advance History Modal
  advanceHistoryList: {
    maxHeight: 400,
  },
  advanceHistoryItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  advanceHistoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  advanceHistoryDetails: {
    flex: 1,
  },
  advanceHistoryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 2,
  },
  advanceHistoryDate: {
    fontSize: 12,
    color: '#757575',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 12,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Date Picker Button Styles
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  datePickerButtonText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  // Date Picker Modal Styles
  datePickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  datePickerModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
    textAlign: 'center',
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  manualDateInput: {
    marginBottom: 20,
  },
  manualDateLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
    textAlign: 'center',
  },
  manualDateField: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'center',
  },
  datePickerCloseButton: {
    backgroundColor: '#9E9E9E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  datePickerCloseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Payout Display Styles
  payoutDisplay: {
    marginBottom: 16,
    alignItems: 'center',
  },
  payoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  payoutForm: {
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
