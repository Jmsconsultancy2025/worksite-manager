import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Types
interface CashbookEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  paymentMode: 'cash' | 'upi' | 'bank';
  amount: number;
  linkedProject: string;
  hasGST: boolean;
  gstAmount?: number;
}

// Sample data
const sampleEntries: CashbookEntry[] = [
  {
    id: '1',
    date: '2025-05-01',
    description: 'Client Payment - Grace Resort',
    category: 'Booking Income',
    type: 'income',
    paymentMode: 'bank',
    amount: 120000,
    linkedProject: 'Zonuam Site',
    hasGST: false,
  },
  {
    id: '2',
    date: '2025-05-03',
    description: 'Worker Wages - Site A',
    category: 'Payroll',
    type: 'expense',
    paymentMode: 'cash',
    amount: 45000,
    linkedProject: 'Zonuam Site',
    hasGST: false,
  },
  {
    id: '3',
    date: '2025-05-05',
    description: 'Construction Materials',
    category: 'Materials',
    type: 'expense',
    paymentMode: 'bank',
    amount: 35000,
    linkedProject: 'Grace Resort',
    hasGST: true,
    gstAmount: 5250,
  },
  {
    id: '4',
    date: '2025-05-07',
    description: 'Advance from Client',
    category: 'Advance Payment',
    type: 'income',
    paymentMode: 'upi',
    amount: 25000,
    linkedProject: 'Chaltlang Site',
    hasGST: false,
  },
];

// Category colors mapping
const categoryColors: { [key: string]: { bg: string; text: string } } = {
  'Booking Income': { bg: '#D1FAE5', text: '#047857' },
  'Payroll': { bg: '#E9D5FF', text: '#7C3AED' },
  'Materials': { bg: '#FED7AA', text: '#C2410C' },
  'Equipment': { bg: '#DBEAFE', text: '#1E40AF' },
  'Transportation': { bg: '#CFFAFE', text: '#0E7490' },
  'Utilities': { bg: '#FEF3C7', text: '#A16207' },
  'Professional Services': { bg: '#FCE7F3', text: '#BE185D' },
  'Office Expenses': { bg: '#E0E7FF', text: '#4338CA' },
  'Marketing': { bg: '#FEE2E2', text: '#B91C1C' },
  'Client Payment': { bg: '#D1FAE5', text: '#059669' },
  'Advance Payment': { bg: '#CCFBF1', text: '#0F766E' },
  'Other': { bg: '#F3F4F6', text: '#374151' },
};

export default function CashbookPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<CashbookEntry[]>(sampleEntries);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashbookEntry | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // Form state
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formPaymentMode, setFormPaymentMode] = useState<'cash' | 'upi' | 'bank'>('cash');
  const [formAmount, setFormAmount] = useState('');
  const [formHasGST, setFormHasGST] = useState(false);
  const [formGSTAmount, setFormGSTAmount] = useState('');
  
  // Animated values
  const fabScale = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  
  // Load animations
  useEffect(() => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1,
        delay: 300,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(fabRotation, {
        toValue: 1,
        delay: 300,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fabRotate = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFromDate = !fromDate || entry.date >= fromDate;
    const matchesToDate = !toDate || entry.date <= toDate;
    return matchesSearch && matchesFromDate && matchesToDate;
  });

  // Calculate metrics
  const totalIncome = filteredEntries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalExpenses = filteredEntries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const cashFlow = totalIncome - totalExpenses;
  const balance = 230000; // Mock balance

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEntries(entries.filter(e => e.id !== id));
            Alert.alert('Success', '🗑️ Entry deleted successfully!');
          },
        },
      ]
    );
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    Alert.alert('Filters Cleared', 'Date filters cleared');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#1A237E" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>💰 Cashbook</Text>
              <Text style={styles.headerSubtitle}>Zonuam Site</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.dateFilters}>
            <TouchableOpacity style={styles.dateButton}>
              <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
              <Text style={styles.dateButtonText}>
                {fromDate || 'From Date'}
              </Text>
            </TouchableOpacity>
            
            <MaterialIcons name="arrow-forward" size={16} color="#9CA3AF" />
            
            <TouchableOpacity style={styles.dateButton}>
              <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
              <Text style={styles.dateButtonText}>
                {toDate || 'To Date'}
              </Text>
            </TouchableOpacity>

            {(fromDate || toDate) && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                <MaterialIcons name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          {/* Income Card */}
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="trending-up" size={16} color="#047857" />
              <Text style={styles.cardLabel}>Income</Text>
            </View>
            <Text style={[styles.cardValue, styles.incomeText]}>
              {formatAmount(totalIncome)}
            </Text>
            <View style={[styles.decorativeCircle, styles.greenCircle]} />
          </View>

          {/* Expenses Card */}
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="trending-down" size={16} color="#B91C1C" />
              <Text style={styles.cardLabel}>Expenses</Text>
            </View>
            <Text style={[styles.cardValue, styles.expenseText]}>
              {formatAmount(totalExpenses)}
            </Text>
            <View style={[styles.decorativeCircle, styles.redCircle]} />
          </View>

          {/* Cash Flow Card */}
          <View style={[styles.summaryCard, styles.cashFlowCard]}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="attach-money" size={16} color="#1E40AF" />
              <Text style={styles.cardLabel}>Cash Flow</Text>
            </View>
            <Text style={[styles.cardValue, cashFlow >= 0 ? styles.incomeText : styles.expenseText]}>
              {formatAmount(cashFlow)}
            </Text>
            <View style={[styles.decorativeCircle, styles.blueCircle]} />
          </View>

          {/* Balance Card */}
          <View style={[styles.summaryCard, styles.balanceCard]}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="account-balance-wallet" size={16} color="#7C3AED" />
              <Text style={styles.cardLabel}>Balance</Text>
            </View>
            <Text style={[styles.cardValue, styles.balanceText]}>
              {formatAmount(balance)}
            </Text>
            <View style={[styles.decorativeCircle, styles.purpleCircle]} />
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Text style={styles.entryCount}>{filteredEntries.length} entries</Text>
          </View>

          {filteredEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="search" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            filteredEntries.map((entry) => (
              <View key={entry.id} style={styles.transactionCard}>
                <View style={[styles.accentBar, entry.type === 'income' ? styles.greenAccent : styles.redAccent]} />
                
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateText}>
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <Text style={[styles.amount, entry.type === 'income' ? styles.amountIncome : styles.amountExpense]}>
                      {entry.type === 'income' ? '+' : '-'}{formatAmount(entry.amount)}
                    </Text>
                  </View>

                  <Text style={styles.description}>{entry.description}</Text>

                  <View style={styles.badges}>
                    <View style={[
                      styles.categoryBadge,
                      { backgroundColor: categoryColors[entry.category]?.bg || '#F3F4F6' }
                    ]}>
                      <Text style={[
                        styles.categoryText,
                        { color: categoryColors[entry.category]?.text || '#374151' }
                      ]}>
                        {entry.category}
                      </Text>
                    </View>

                    <View style={[
                      styles.paymentBadge,
                      entry.paymentMode === 'cash' && styles.cashBadge,
                      entry.paymentMode === 'upi' && styles.upiBadge,
                      entry.paymentMode === 'bank' && styles.bankBadge,
                    ]}>
                      <Text style={[
                        styles.paymentText,
                        entry.paymentMode === 'cash' && styles.cashText,
                        entry.paymentMode === 'upi' && styles.upiText,
                        entry.paymentMode === 'bank' && styles.bankText,
                      ]}>
                        {entry.paymentMode.toUpperCase()}
                      </Text>
                    </View>

                    {entry.hasGST && (
                      <View style={styles.gstBadge}>
                        <Text style={styles.gstText}>GST</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => {
                      setEditingEntry(entry);
                      setModalVisible(true);
                    }}
                  >
                    <MaterialIcons name="edit" size={16} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(entry.id)}
                  >
                    <MaterialIcons name="delete" size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* FAB */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [
              { scale: fabScale },
              { rotate: fabRotate },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => {
            setEditingEntry(null);
            setModalVisible(true);
          }}
        >
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <MaterialIcons name="home" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/workers')}>
          <MaterialIcons name="people" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Workers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="account-balance-wallet" size={24} color="#16A34A" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Cashbook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="note" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="bar-chart" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Reports</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  // Header
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  // Search and Filter
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  dateFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  clearButton: {
    padding: 8,
  },
  // Summary Cards
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  incomeCard: {
    backgroundColor: '#D1FAE5',
  },
  expenseCard: {
    backgroundColor: '#FEE2E2',
  },
  cashFlowCard: {
    backgroundColor: '#DBEAFE',
  },
  balanceCard: {
    backgroundColor: '#E9D5FF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#047857',
  },
  expenseText: {
    color: '#B91C1C',
  },
  balanceText: {
    color: '#7C3AED',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
  },
  greenCircle: {
    backgroundColor: '#10B981',
  },
  redCircle: {
    backgroundColor: '#EF4444',
  },
  blueCircle: {
    backgroundColor: '#3B82F6',
  },
  purpleCircle: {
    backgroundColor: '#9333EA',
  },
  // Transactions
  transactionsSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  entryCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // Transaction Card
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
    flexDirection: 'row',
    position: 'relative',
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
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  greenAccent: {
    backgroundColor: '#10B981',
  },
  redAccent: {
    backgroundColor: '#EF4444',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 20,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountIncome: {
    color: '#10B981',
  },
  amountExpense: {
    color: '#EF4444',
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  cashBadge: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  upiBadge: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
  bankBadge: {
    backgroundColor: '#E9D5FF',
    borderColor: '#D8B4FE',
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cashText: {
    color: '#047857',
  },
  upiText: {
    color: '#1E40AF',
  },
  bankText: {
    color: '#7C3AED',
  },
  gstBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gstText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A16207',
  },
  actions: {
    justifyContent: 'center',
    gap: 8,
    paddingRight: 12,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    width: 64,
    height: 64,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  // Bottom Nav
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
    color: '#16A34A',
    fontWeight: '600',
  },
});
