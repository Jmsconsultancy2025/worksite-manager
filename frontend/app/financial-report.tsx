import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import {
  ArrowLeft,
  Download,
  Search,
  CalendarDays,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Plus,
  Minus,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Mock data - replace with actual data from your backend
const mockSites = [
  { id: 'all', name: 'All Sites' },
  { id: 'site1', name: 'Construction Site A' },
  { id: 'site2', name: 'Building Site B' },
  { id: 'site3', name: 'Infrastructure Project C' },
];

const mockCategories = [
  { id: 'labor', name: 'Labor', color: '#3B82F6' },
  { id: 'materials', name: 'Materials', color: '#10B981' },
  { id: 'equipment', name: 'Equipment', color: '#F59E0B' },
  { id: 'transport', name: 'Transport', color: '#EF4444' },
  { id: 'other', name: 'Other', color: '#8B5CF6' },
];

const mockTransactions = [
  {
    id: '1',
    date: '2024-11-01',
    category: 'Labor',
    amount: 25000,
    type: 'expense' as const,
    description: 'Weekly labor payments',
  },
  {
    id: '2',
    date: '2024-11-02',
    category: 'Materials',
    amount: 15000,
    type: 'expense' as const,
    description: 'Cement and steel purchase',
  },
  {
    id: '3',
    date: '2024-11-03',
    category: 'Equipment',
    amount: 8000,
    type: 'expense' as const,
    description: 'Equipment rental',
  },
  {
    id: '4',
    date: '2024-11-04',
    category: 'Project Payment',
    amount: 50000,
    type: 'income' as const,
    description: 'Client milestone payment',
  },
  {
    id: '5',
    date: '2024-11-05',
    category: 'Transport',
    amount: 3000,
    type: 'expense' as const,
    description: 'Material transportation',
  },
  {
    id: '6',
    date: '2024-11-06',
    category: 'Other',
    amount: 2000,
    type: 'expense' as const,
    description: 'Site maintenance',
  },
  {
    id: '7',
    date: '2024-11-07',
    category: 'Labor',
    amount: 22000,
    type: 'expense' as const,
    description: 'Weekly labor payments',
  },
];

type SortField = 'date' | 'category' | 'amount' | 'type';
type SortDirection = 'asc' | 'desc';

export default function FinancialReportPage() {
  const router = useRouter();
  const [selectedSite, setSelectedSite] = useState('all');
  const [dateRangePreset, setDateRangePreset] = useState('monthly');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showCharts, setShowCharts] = useState(true);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let filtered = mockTransactions;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [selectedCategory, searchQuery, sortField, sortDirection]);

  // Calculate financial summary
  const financialSummary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netCashFlow = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
    };
  }, [filteredTransactions]);

  // Category breakdown for pie chart
  const categoryBreakdown = useMemo(() => {
    const breakdown: { [key: string]: number } = {};

    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        breakdown[transaction.category] = (breakdown[transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(breakdown).map(([category, amount]) => ({
      name: category,
      value: amount,
      color: mockCategories.find(c => c.name === category)?.color || '#6B7280',
    }));
  }, [filteredTransactions]);

  // Daily cash flow data for bar chart (last 7 days)
  const dailyCashFlow = useMemo(() => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTransactions = filteredTransactions.filter(t => t.date === dateStr);
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      last7Days.push({
        date: dateStr,
        income,
        expenses,
        net: income - expenses,
      });
    }

    return last7Days;
  }, [filteredTransactions]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to desc for date
    }
  };

  const handleExportCSV = () => {
    // Mock CSV export - in real app, generate and download CSV
    Alert.alert('Export CSV', 'CSV export functionality would be implemented here');
  };

  const handleExportPDF = () => {
    // Mock PDF export - in real app, generate and download PDF
    Alert.alert('Export PDF', 'PDF export functionality would be implemented here');
  };

  const renderTransactionRow = ({ item }: { item: typeof mockTransactions[0] }) => (
    <View style={styles.transactionRow}>
      <View style={styles.transactionCell}>
        <Text style={styles.transactionDate}>{item.date}</Text>
        <Text style={styles.transactionDescription}>{item.description}</Text>
      </View>
      <View style={styles.categoryCell}>
        <View style={[styles.categoryBadge, { backgroundColor: mockCategories.find(c => c.name === item.category)?.color + '20' || '#F3F4F6' }]}>
          <Text style={[styles.categoryText, { color: mockCategories.find(c => c.name === item.category)?.color || '#374151' }]}>
            {item.category}
          </Text>
        </View>
      </View>
      <View style={styles.amountCell}>
        <Text style={[styles.amountText, item.type === 'income' ? styles.incomeText : styles.expenseText]}>
          {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderPieChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Expense Breakdown</Text>
      <View style={styles.pieChartPlaceholder}>
        <PieChart size={80} color="#6B7280" />
        <Text style={styles.chartPlaceholderText}>Pie Chart</Text>
        <Text style={styles.chartNote}>Interactive chart would be implemented here</Text>
      </View>
      <View style={styles.legendContainer}>
        {categoryBreakdown.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.name}</Text>
            <Text style={styles.legendValue}>₹{item.value.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderBarChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Daily Cash Flow (Last 7 Days)</Text>
      <View style={styles.barChartPlaceholder}>
        <BarChart3 size={80} color="#6B7280" />
        <Text style={styles.chartPlaceholderText}>Bar Chart</Text>
        <Text style={styles.chartNote}>Interactive chart would be implemented here</Text>
      </View>
      <View style={styles.barDataContainer}>
        {dailyCashFlow.map((day, index) => (
          <View key={index} style={styles.barDataItem}>
            <Text style={styles.barDataDate}>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            <View style={styles.barDataValues}>
              <Text style={styles.barDataIncome}>+₹{day.income.toLocaleString()}</Text>
              <Text style={styles.barDataExpense}>-₹{day.expenses.toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Financial Report</Text>
            <Text style={styles.headerSubtitle}>Income, expenses, and cash flow analysis</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.exportButton}>
          <Download size={16} color="#16A34A" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      <View style={styles.filtersSection}>
        {/* Date Range Tabs */}
        <View style={styles.dateTabs}>
          <TouchableOpacity
            style={[styles.dateTab, dateRangePreset === 'daily' && styles.dateTabActive]}
            onPress={() => setDateRangePreset('daily')}
          >
            <Text style={[styles.dateTabText, dateRangePreset === 'daily' && styles.dateTabTextActive]}>
              Daily
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateTab, dateRangePreset === 'weekly' && styles.dateTabActive]}
            onPress={() => setDateRangePreset('weekly')}
          >
            <Text style={[styles.dateTabText, dateRangePreset === 'weekly' && styles.dateTabTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateTab, dateRangePreset === 'monthly' && styles.dateTabActive]}
            onPress={() => setDateRangePreset('monthly')}
          >
            <Text style={[styles.dateTabText, dateRangePreset === 'monthly' && styles.dateTabTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateTab, dateRangePreset === 'custom' && styles.dateTabActive]}
            onPress={() => setDateRangePreset('custom')}
          >
            <Text style={[styles.dateTabText, dateRangePreset === 'custom' && styles.dateTabTextActive]}>
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {/* Site, Category & Search */}
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Site</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectText}>
                {mockSites.find(site => site.id === selectedSite)?.name || 'All Sites'}
              </Text>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Category</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectText}>
                {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
              </Text>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={16} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Custom Date Range - shown when custom selected */}
        {dateRangePreset === 'custom' && (
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>From</Text>
              <TouchableOpacity style={styles.dateButton}>
                <CalendarDays size={16} color="#6B7280" />
                <Text style={styles.dateText}>{customDateFrom || 'Pick date'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>To</Text>
              <TouchableOpacity style={styles.dateButton}>
                <CalendarDays size={16} color="#6B7280" />
                <Text style={styles.dateText}>{customDateTo || 'Pick date'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Financial Summary */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <View style={[styles.cardIcon, { backgroundColor: '#D1FAE5' }]}>
            <Plus size={16} color="#10B981" />
          </View>
          <View>
            <Text style={styles.cardLabel}>Total Income</Text>
            <Text style={styles.cardValue}>₹{financialSummary.totalIncome.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.cardIcon, { backgroundColor: '#FEE2E2' }]}>
            <Minus size={16} color="#EF4444" />
          </View>
          <View>
            <Text style={styles.cardLabel}>Total Expenses</Text>
            <Text style={styles.cardValue}>₹{financialSummary.totalExpenses.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.cardIcon, {
            backgroundColor: financialSummary.netCashFlow >= 0 ? '#D1FAE5' : '#FEE2E2'
          }]}>
            {financialSummary.netCashFlow >= 0 ? (
              <TrendingUp size={16} color="#10B981" />
            ) : (
              <TrendingDown size={16} color="#EF4444" />
            )}
          </View>
          <View>
            <Text style={styles.cardLabel}>Net Cash Flow</Text>
            <Text style={[styles.cardValue, {
              color: financialSummary.netCashFlow >= 0 ? '#10B981' : '#EF4444'
            }]}>
              {financialSummary.netCashFlow >= 0 ? '+' : ''}₹{financialSummary.netCashFlow.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Charts Section */}
      {showCharts && (
        <View style={styles.chartsSection}>
          <View style={styles.chartToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, showCharts && styles.toggleActive]}
              onPress={() => setShowCharts(!showCharts)}
            >
              <Text style={[styles.toggleText, showCharts && styles.toggleTextActive]}>
                {showCharts ? 'Hide Charts' : 'Show Charts'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartsContainer}>
            {renderPieChart()}
            {renderBarChart()}
          </View>
        </View>
      )}

      {/* Transaction List */}
      <View style={styles.tableSection}>
        <View style={styles.tableHeader}>
          <DollarSign size={16} color="#7C3AED" />
          <Text style={styles.tableTitle}>Transaction List</Text>
        </View>
        <Text style={styles.tableSubtitle}>
          All financial transactions ({filteredTransactions.length} transactions shown)
        </Text>

        {/* Table Header */}
        <View style={styles.tableRow}>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('date')}>
            <Text style={styles.tableHeaderText}>Date</Text>
            {sortField === 'date' && (
              sortDirection === 'asc' ?
                <ChevronDown size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('category')}>
            <Text style={styles.tableHeaderText}>Category</Text>
            {sortField === 'category' && (
              sortDirection === 'asc' ?
                <ChevronDown size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('amount')}>
            <Text style={styles.tableHeaderText}>Amount</Text>
            {sortField === 'amount' && (
              sortDirection === 'asc' ?
                <ChevronDown size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        {/* Table Body */}
        {filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransactionRow}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <DollarSign size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search or filters' : 'No financial data available for the selected period'}
            </Text>
          </View>
        )}
      </View>

      {/* Export Section */}
      <View style={styles.exportSection}>
        <View style={styles.exportHeader}>
          <Download size={16} color="#374151" />
          <Text style={styles.exportTitle}>Export Report</Text>
        </View>
        <Text style={styles.exportSubtitle}>
          Download financial data in your preferred format
        </Text>
        <View style={styles.exportButtons}>
          <TouchableOpacity style={styles.exportButtonSecondary} onPress={handleExportPDF}>
            <Text style={styles.exportButtonTextSecondary}>Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButtonPrimary} onPress={handleExportCSV}>
            <Text style={styles.exportButtonTextPrimary}>Export CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#16A34A',
    borderRadius: 6,
    gap: 6,
  },
  exportButtonText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
  },
  // Filters Section
  filtersSection: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateTabs: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  dateTabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  dateTabText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  dateTabTextActive: {
    color: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  selectText: {
    fontSize: 14,
    color: '#111827',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  // Summary Cards
  summaryCards: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
    marginRight: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  // Charts Section
  chartsSection: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartToggle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  toggleActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  toggleText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  chartsContainer: {
    gap: 16,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 16,
  },
  pieChartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 16,
  },
  chartPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 8,
  },
  chartNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  legendContainer: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  barChartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 16,
  },
  barDataContainer: {
    gap: 8,
  },
  barDataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  barDataDate: {
    width: 60,
    fontSize: 12,
    color: '#6B7280',
  },
  barDataValues: {
    flexDirection: 'row',
    gap: 16,
  },
  barDataIncome: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  barDataExpense: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  // Table Section
  tableSection: {
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  tableSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginRight: 4,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionCell: {
    flex: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginTop: 2,
  },
  categoryCell: {
    flex: 1.5,
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountCell: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  incomeText: {
    color: '#10B981',
  },
  expenseText: {
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Export Section
  exportSection: {
    padding: 16,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  exportSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButtonSecondary: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  exportButtonTextSecondary: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  exportButtonPrimary: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#16A34A',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#16A34A',
  },
  exportButtonTextPrimary: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  // Bottom padding
  bottomPadding: {
    height: 80,
  },
});