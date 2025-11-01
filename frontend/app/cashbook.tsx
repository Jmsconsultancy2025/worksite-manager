import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Types
interface CashbookEntry {
  id: string;
  date: string;
  time: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
}

// Sample data - grouped by date for demonstration
const sampleEntries: CashbookEntry[] = [
  {
    id: '1',
    date: '2025-09-20',
    time: '04:54 PM',
    description: 'Client Payment - Grace Resort',
    type: 'income',
    amount: 120000,
  },
  {
    id: '2',
    date: '2025-09-20',
    time: '02:30 PM',
    description: 'Worker Wages - Site A',
    type: 'expense',
    amount: 45000,
  },
  {
    id: '3',
    date: '2025-09-19',
    time: '11:15 AM',
    description: 'Construction Materials',
    type: 'expense',
    amount: 35000,
  },
  {
    id: '4',
    date: '2025-09-19',
    time: '09:45 AM',
    description: 'Advance from Client',
    type: 'income',
    amount: 25000,
  },
  {
    id: '5',
    date: '2025-09-18',
    time: '03:20 PM',
    description: 'Equipment Purchase',
    type: 'expense',
    amount: 75000,
  },
];

export default function CashbookPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<CashbookEntry[]>(sampleEntries);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Sep 2025');
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state for adding transactions
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');

  // Additional state variables for the extra modals
  const [editingEntry, setEditingEntry] = useState<CashbookEntry | null>(null);
  const [formDate, setFormDate] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPaymentMode, setFormPaymentMode] = useState<'cash' | 'upi' | 'bank'>('cash');
  const [formHasGST, setFormHasGST] = useState(false);
  const [formGSTAmount, setFormGSTAmount] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useState(new Animated.Value(0))[0];

  // Categories for the entry modal
  const categories = ['Labor', 'Materials', 'Equipment', 'Transport', 'Client Payment', 'Advance', 'Other'];

  // Filter entries by search and month
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch = entry.description.toLowerCase().includes(searchQuery.toLowerCase());
      const entryDate = new Date(entry.date);
      const entryMonthYear = entryDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const matchesMonth = entryMonthYear === selectedMonth;
      const matchesType = !transactionType || entry.type === transactionType;
      return matchesSearch && matchesMonth && matchesType;
    });
  }, [entries, searchQuery, selectedMonth, transactionType]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: { [date: string]: CashbookEntry[] } = {};
    filteredEntries.forEach(entry => {
      if (!groups[entry.date]) {
        groups[entry.date] = [];
      }
      groups[entry.date].push(entry);
    });

    // Sort dates in descending order
    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        entries: groups[date].sort((a, b) => b.time.localeCompare(a.time)) // Sort by time descending
      }));
  }, [filteredEntries]);

  // Calculate totals
  const totalIncome = useMemo(() => {
    return filteredEntries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [filteredEntries]);

  const totalExpense = useMemo(() => {
    return filteredEntries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [filteredEntries]);

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleAddTransaction = () => {
    if (!formDescription.trim() || !formAmount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const now = new Date();
    const newEntry: CashbookEntry = {
      id: Date.now().toString(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      description: formDescription.trim(),
      type: formType,
      amount: amount,
    };

    setEntries([newEntry, ...entries]);
    setFormDescription('');
    setFormAmount('');
    setModalVisible(false);
    Alert.alert('Success', `${formType === 'income' ? 'Income' : 'Expense'} entry added successfully!`);
  };

  const openTransactionModal = () => {
    setModalVisible(true);
  };

  // Additional functions for the extra modals
  const formatDDMMYYYY = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const openDatePicker = (type: 'entry') => {
    setDatePickerVisible(true);
  };

  const handleDateSelect = (date: string) => {
    setFormDate(date);
    setDatePickerVisible(false);
  };

  const handleSaveEntry = () => {
    // Placeholder for save logic
    setModalVisible(false);
    setEditingEntry(null);
    setShowToast(true);
    setToastMessage('Entry saved successfully!');
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 2000);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A237E" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Cash Book</Text>
          <Text style={styles.headerSubtitle}>Track Income & Expenses</Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Month Filter */}
        <View style={styles.monthFilter}>
          <TouchableOpacity style={styles.monthButton}>
            <MaterialIcons name="calendar-today" size={20} color="#4CAF50" />
            <Text style={styles.monthText}>{selectedMonth}</Text>
            <MaterialIcons name="arrow-drop-down" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#9E9E9E" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transaction name"
            placeholderTextColor="#BDBDBD"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>TOTAL INCOME</Text>
            <Text style={[styles.summaryAmount, styles.incomeAmount]}>
              {formatAmount(totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>TOTAL OUT</Text>
            <Text style={[styles.summaryAmount, styles.expenseAmount]}>
              {formatAmount(totalExpense)}
            </Text>
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          {groupedEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt" size={48} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptyText}>Add your first transaction to get started</Text>
            </View>
          ) : (
            groupedEntries.map(({ date, entries: dayEntries }) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{formatDate(date)}</Text>
                {dayEntries.map((entry) => (
                  <View key={entry.id} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionTime}>{entry.time}</Text>
                      <Text style={styles.transactionDesc}>{entry.description}</Text>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text style={[
                        styles.transactionAmount,
                        entry.type === 'income' ? styles.amountIncome : styles.amountExpense
                      ]}>
                        {entry.type === 'income' ? '+' : '-'}{formatAmount(entry.amount)}
                      </Text>
                      <Text style={styles.transactionType}>
                        {entry.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Add Transaction Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={openTransactionModal}
      >
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Cash Out</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <MaterialIcons name="home" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/workers')}>
          <MaterialIcons name="people" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Labor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="account-balance-wallet" size={24} color="#4CAF50" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/reports')}>
          <MaterialIcons name="bar-chart" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/plans')}>
          <MaterialIcons name="settings" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Add Transaction Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Add Transaction</Text>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, formType === 'income' && styles.typeButtonActive]}
                onPress={() => setFormType('income')}
              >
                <MaterialIcons name="trending-up" size={20} color={formType === 'income' ? '#FFFFFF' : '#4CAF50'} />
                <Text style={[styles.typeButtonText, formType === 'income' && styles.typeButtonTextActive]}>
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, formType === 'expense' && styles.typeButtonActive]}
                onPress={() => setFormType('expense')}
              >
                <MaterialIcons name="trending-down" size={20} color={formType === 'expense' ? '#FFFFFF' : '#DC2626'} />
                <Text style={[styles.typeButtonText, formType === 'expense' && styles.typeButtonTextActive]}>
                  Expense
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Transaction description"
              value={formDescription}
              onChangeText={setFormDescription}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Amount (₹)"
              value={formAmount}
              onChangeText={setFormAmount}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddTransaction}
              >
                <Text style={styles.saveButtonText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Entry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{editingEntry ? '✏️ Edit Entry' : '✨ Add New Entry'}</Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.formInput}
                  onPress={() => openDatePicker('entry')}
                >
                  <View style={styles.dateInputRow}>
                    <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
                    <Text style={styles.dateInputText}>
                      {formDate ? formatDDMMYYYY(formDate) : 'DD-MM-YYYY'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description *</Text>
                <TextInput
                  style={[styles.formInput, { minHeight: 80 }]}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Enter description"
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, formCategory === cat && styles.categoryChipActive]}
                      onPress={() => setFormCategory(cat)}
                    >
                      <Text style={[styles.categoryChipText, formCategory === cat && styles.categoryChipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Type *</Text>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[styles.typeButton, formType === 'expense' && styles.typeButtonExpense]}
                    onPress={() => setFormType('expense')}
                  >
                    <Text style={[styles.typeButtonText, formType === 'expense' && styles.typeButtonTextActive]}>
                      💸 Expense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, formType === 'income' && styles.typeButtonIncome]}
                    onPress={() => setFormType('income')}
                  >
                    <Text style={[styles.typeButtonText, formType === 'income' && styles.typeButtonTextActive]}>
                      💰 Income
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Payment Mode *</Text>
                <View style={styles.paymentModeButtons}>
                  {(['cash', 'upi', 'bank'] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.paymentModeButton, formPaymentMode === mode && styles.paymentModeButtonActive]}
                      onPress={() => setFormPaymentMode(mode)}
                    >
                      <Text style={[styles.paymentModeText, formPaymentMode === mode && styles.paymentModeTextActive]}>
                        {mode.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount (₹) *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formAmount}
                  onChangeText={setFormAmount}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.gstToggleRow}>
                  <Text style={styles.formLabel}>GST Applicable</Text>
                  <TouchableOpacity
                    style={[styles.gstToggle, formHasGST && styles.gstToggleActive]}
                    onPress={() => setFormHasGST(!formHasGST)}
                  >
                    <View style={[styles.gstToggleThumb, formHasGST && styles.gstToggleThumbActive]} />
                  </TouchableOpacity>
                </View>
                {formHasGST && (
                  <TextInput
                    style={[styles.formInput, { marginTop: 8 }]}
                    value={formGSTAmount}
                    onChangeText={setFormGSTAmount}
                    placeholder="GST Amount"
                    keyboardType="numeric"
                  />
                )}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
                  <Text style={styles.saveButtonText}>{editingEntry ? 'Update' : 'Add Entry'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
        <Pressable style={styles.modalOverlay} onPress={() => setDatePickerVisible(false)}>
          <Pressable style={styles.datePickerModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.datePickerTitle}>Select Date</Text>
            <Text style={styles.datePickerSubtitle}>Quick pick: Yesterday · Today · Custom</Text>

            {/* Quick Date Buttons - Reordered: Yesterday | Today | Custom */}
            <View style={styles.quickDateButtons}>
              <TouchableOpacity
                style={styles.quickDateButton}
                accessibilityLabel="Select yesterday"
                onPress={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  handleDateSelect(yesterday.toISOString().split('T')[0]);
                }}
              >
                <Text style={styles.quickDateText}>Yesterday</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickDateButton}
                accessibilityLabel="Select today"
                onPress={() => {
                  const today = new Date();
                  handleDateSelect(today.toISOString().split('T')[0]);
                }}
              >
                <Text style={styles.quickDateText}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickDateButton, styles.customButton]}
                accessibilityLabel="Select custom date"
                onPress={() => {
                  // Show custom date input
                  setDatePickerVisible(false);
                  // Re-open with custom input focus
                  setTimeout(() => setDatePickerVisible(true), 100);
                }}
              >
                <Text style={[styles.quickDateText, styles.customButtonText]}>Custom</Text>
              </TouchableOpacity>
            </View>

            {/* Custom Date Input */}
            <View style={styles.dateInputContainer}>
              <Text style={styles.customInputLabel}>Or enter custom date:</Text>
              <TextInput
                style={styles.datePickerInput}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="#9CA3AF"
                onChangeText={(text) => {
                  // Parse DD-MM-YYYY format and convert to ISO
                  if (text.length === 10 && text.includes('-')) {
                    const parts = text.split('-');
                    if (parts.length === 3) {
                      const [dd, mm, yyyy] = parts;
                      const isoDate = `${yyyy}-${mm}-${dd}`;
                      // Validate date
                      const date = new Date(isoDate);
                      if (!isNaN(date.getTime())) {
                        handleDateSelect(isoDate);
                      }
                    }
                  }
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.datePickerClose}
              onPress={() => setDatePickerVisible(false)}
            >
              <Text style={styles.datePickerCloseText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Toast */}
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
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
    backgroundColor: '#F5F5F5',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  // Month Filter
  monthFilter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginHorizontal: 8,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#F44336',
  },
  // Transactions
  transactionsContainer: {
    paddingHorizontal: 16,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionTime: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  transactionDesc: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  amountIncome: {
    color: '#4CAF50',
  },
  amountExpense: {
    color: '#F44336',
  },
  transactionType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#757575',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
  },
  // Add Button
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Bottom Navigation
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  typeButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#333333',
  },
  modalButtons: {
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
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Additional styles for the extra modals
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  typeButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  typeButtonExpense: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
  },
  typeButtonIncome: {
    backgroundColor: '#DCFCE7',
    borderColor: '#4ADE80',
  },
  paymentModeButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  paymentModeButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  paymentModeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  paymentModeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  paymentModeTextActive: {
    color: '#FFFFFF',
  },
  gstToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gstToggle: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  gstToggleActive: {
    backgroundColor: '#4CAF50',
  },
  gstToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 0 }],
  },
  gstToggleThumbActive: {
    transform: [{ translateX: 26 }],
  },
  datePickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 8,
  },
  datePickerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  quickDateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  customButton: {
    backgroundColor: '#4CAF50',
  },
  quickDateText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  customButtonText: {
    color: '#FFFFFF',
  },
  dateInputContainer: {
    marginBottom: 24,
  },
  customInputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  datePickerInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  datePickerClose: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerCloseText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
});
