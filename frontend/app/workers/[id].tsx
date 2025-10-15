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

  const worker = workerData;

  // Load worker data from localStorage on mount
  useEffect(() => {
    const loadWorkerData = () => {
      try {
        const stored = localStorage.getItem(`worker_${id}`);
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

  // Save worker data to localStorage whenever it changes
  useEffect(() => {
    if (workerData) {
      try {
        localStorage.setItem(`worker_${id}`, JSON.stringify(workerData));
      } catch (error) {
        console.error('Error saving worker data:', error);
      }
    }
  }, [workerData, id]);

  // Show toast notification
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  // Check if attendance is older than 24 hours
  const isAttendanceExpired = (timestamp: number | undefined): boolean => {
    if (!timestamp) return false;
    const now = Date.now();
    const hoursPassed = (now - timestamp) / (1000 * 60 * 60);
    return hoursPassed >= 24;
  };

  // Update attendance for a specific date
  const updateAttendance = (date: string, status: 'present' | 'half' | 'absent' | 'holiday') => {
    if (!workerData) return;

    const updatedAttendance = [...workerData.attendance];
    const existingIndex = updatedAttendance.findIndex(a => a.date === date);

    const newRecord: AttendanceRecord = {
      date,
      status,
      timestamp: Date.now(), // Record when attendance was marked
    };

    if (existingIndex >= 0) {
      updatedAttendance[existingIndex] = newRecord;
    } else {
      updatedAttendance.push(newRecord);
    }

    setWorkerData({
      ...workerData,
      attendance: updatedAttendance,
    });

    const statusLabels = {
      present: 'Present',
      half: 'Half Day',
      absent: 'Absent',
      holiday: 'Holiday',
    };
    showToast(`Attendance updated: ${statusLabels[status]} for ${formatDDMMYYYY(date)}`);
    setAttendanceModalVisible(false);
  };

  // Handle date cell click
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setAttendanceModalVisible(true);
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

  // Get status color - considers if attendance is expired (>24 hours)
  const getStatusColor = (status: string, timestamp?: number) => {
    // If attendance is expired (>24 hours old), return gray
    if (timestamp && isAttendanceExpired(timestamp)) {
      return '#9E9E9E'; // Gray for expired
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
            <View style={styles.avatarSmall}>
              <MaterialIcons name="person" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.workerDetails}>
              <Text style={styles.workerNameCompact}>{worker.name}</Text>
              <Text style={styles.workerRoleCompact}>{worker.role}</Text>
              <View style={styles.contactRow}>
                <MaterialIcons name="phone" size={14} color="#4CAF50" />
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${worker.phone}`)}>
                  <Text style={styles.phoneCompact}>{worker.phone}</Text>
                </TouchableOpacity>
                <MaterialIcons name="location-on" size={14} color="#757575" style={{ marginLeft: 12 }} />
                <Text style={styles.siteCompact}>{worker.site}</Text>
              </View>
            </View>
            <View style={styles.dailyRateBadge}>
              <Text style={styles.dailyRateValueCompact}>₹{worker.dailyRate}/day</Text>
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
                  const statusColor = getStatusColor(attendance?.status || 'absent', attendance?.timestamp);
                  
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
                  const statusColor = getStatusColor(attendance?.status || 'absent', attendance?.timestamp);
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
              <Text style={styles.viewAdvanceText}>View Advances</Text>
            </TouchableOpacity>
          </View>
          
          {/* Date Range Selector */}
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>From</Text>
              <TextInput
                style={styles.dateField}
                value={dateFrom}
                onChangeText={setDateFrom}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>To</Text>
              <TextInput
                style={styles.dateField}
                value={dateTo}
                onChangeText={setDateTo}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          {/* Salary Cards */}
          <View style={styles.salaryGrid}>
            <View style={[styles.salaryCard, { borderLeftColor: '#4CAF50' }]}>
              <Text style={styles.salaryLabel}>Daily Earnings</Text>
              <Text style={styles.salaryValue}>₹{salaryStats.dailyEarnings.toFixed(0)}</Text>
            </View>

            <View style={[styles.salaryCard, { borderLeftColor: '#F44336' }]}>
              <Text style={styles.salaryLabel}>Total Advance</Text>
              <Text style={[styles.salaryValue, { color: '#F44336' }]}>₹{salaryStats.totalAdvance}</Text>
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
          <Pressable style={styles.advanceModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.advanceModalTitle}>Advance Payments</Text>
            <Text style={styles.attendanceModalDate}>{workerData?.name}</Text>
            
            <ScrollView style={styles.advanceHistoryList}>
              {workerData && workerData.advances && workerData.advances.length > 0 ? (
                workerData.advances.map((advance, index) => (
                  <View key={index} style={styles.advanceHistoryItem}>
                    <View style={styles.advanceHistoryInfo}>
                      <MaterialIcons name="receipt" size={24} color="#FF9800" />
                      <View style={styles.advanceHistoryDetails}>
                        <Text style={styles.advanceHistoryAmount}>₹{advance.amount}</Text>
                        <Text style={styles.advanceHistoryDate}>
                          {new Date(advance.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerDetails: {
    flex: 1,
  },
  workerNameCompact: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 2,
  },
  workerRoleCompact: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneCompact: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  siteCompact: {
    fontSize: 12,
    color: '#757575',
  },
  dailyRateBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dailyRateValueCompact: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
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
});
