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
  ChevronUp,
  DollarSign,
  Minus,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Mock data - replace with actual data from your backend
const mockSites = [
  { id: 'all', name: 'All Sites' },
  { id: 'site1', name: 'Construction Site A' },
  { id: 'site2', name: 'Building Site B' },
  { id: 'site3', name: 'Infrastructure Project C' },
];

const mockPayrollData = [
  {
    workerId: '1',
    workerName: 'Rajesh Kumar',
    daysWorked: 22,
    grossSalary: 22000,
    deductions: 2000,
    netPay: 20000,
    status: 'paid' as const,
    breakdown: {
      attendance: 18000,
      overtime: 4000,
      advances: 0,
      others: 0,
    },
  },
  {
    workerId: '2',
    workerName: 'Amit Singh',
    daysWorked: 20,
    grossSalary: 20000,
    deductions: 1500,
    netPay: 18500,
    status: 'paid' as const,
    breakdown: {
      attendance: 16000,
      overtime: 4000,
      advances: 0,
      others: 0,
    },
  },
  {
    workerId: '3',
    workerName: 'Suresh Patel',
    daysWorked: 18,
    grossSalary: 18000,
    deductions: 1800,
    netPay: 16200,
    status: 'pending' as const,
    breakdown: {
      attendance: 14400,
      overtime: 3600,
      advances: 0,
      others: 0,
    },
  },
  {
    workerId: '4',
    workerName: 'Vikram Rao',
    daysWorked: 22,
    grossSalary: 26400,
    deductions: 2400,
    netPay: 24000,
    status: 'paid' as const,
    breakdown: {
      attendance: 22000,
      overtime: 4400,
      advances: 0,
      others: 0,
    },
  },
  {
    workerId: '5',
    workerName: 'Kiran Desai',
    daysWorked: 21,
    grossSalary: 23100,
    deductions: 2100,
    netPay: 21000,
    status: 'na' as const,
    breakdown: {
      attendance: 18900,
      overtime: 4200,
      advances: 0,
      others: 0,
    },
  },
];

type SortField = 'workerName' | 'daysWorked' | 'grossSalary' | 'deductions' | 'netPay' | 'status';
type SortDirection = 'asc' | 'desc';

export default function PayrollReportPage() {
  const router = useRouter();
  const [selectedSite, setSelectedSite] = useState('all');
  const [dateRangePreset, setDateRangePreset] = useState('this-month');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('workerName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filtered and sorted payroll data
  const filteredPayrollData = useMemo(() => {
    let filtered = mockPayrollData;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(payroll =>
        payroll.workerName.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [searchQuery, sortField, sortDirection]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const grossSalary = filteredPayrollData.reduce((sum, p) => sum + p.grossSalary, 0);
    const deductions = filteredPayrollData.reduce((sum, p) => sum + p.deductions, 0);
    const netPayable = filteredPayrollData.reduce((sum, p) => sum + p.netPay, 0);

    return {
      grossSalary,
      deductions,
      netPayable,
    };
  }, [filteredPayrollData]);

  // Payment summary
  const paymentSummary = useMemo(() => {
    const paid = filteredPayrollData.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.netPay, 0);
    const pending = filteredPayrollData.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netPay, 0);
    const na = filteredPayrollData.filter(p => p.status === 'na').reduce((sum, p) => sum + p.netPay, 0);

    return { paid, pending, na };
  }, [filteredPayrollData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRowExpansion = (workerId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(workerId)) {
      newExpanded.delete(workerId);
    } else {
      newExpanded.add(workerId);
    }
    setExpandedRows(newExpanded);
  };

  const handleExportCSV = () => {
    // Mock CSV export - in real app, generate and download CSV
    Alert.alert('Export CSV', 'CSV export functionality would be implemented here');
  };

  const handleExportPDF = () => {
    // Mock PDF export - in real app, generate and download PDF
    Alert.alert('Export PDF', 'PDF export functionality would be implemented here');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'na': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={12} color="#10B981" />;
      case 'pending': return <Clock size={12} color="#F59E0B" />;
      case 'na': return <XCircle size={12} color="#6B7280" />;
      default: return <XCircle size={12} color="#6B7280" />;
    }
  };

  const renderPayrollRow = ({ item }: { item: typeof mockPayrollData[0] }) => {
    const isExpanded = expandedRows.has(item.workerId);

    return (
      <View>
        <TouchableOpacity
          style={styles.payrollRow}
          onPress={() => toggleRowExpansion(item.workerId)}
        >
          <View style={styles.workerCell}>
            <View style={styles.expandIcon}>
              {isExpanded ? <ChevronUp size={14} color="#6B7280" /> : <ChevronDown size={14} color="#6B7280" />}
            </View>
            <Text style={styles.workerName}>{item.workerName}</Text>
          </View>
          <Text style={styles.cellText}>{item.daysWorked}</Text>
          <Text style={styles.cellText}>₹{item.grossSalary.toLocaleString()}</Text>
          <Text style={styles.cellText}>₹{item.deductions.toLocaleString()}</Text>
          <Text style={styles.cellText}>₹{item.netPay.toLocaleString()}</Text>
          <View style={styles.statusCell}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedRow}>
            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownTitle}>Earnings Breakdown</Text>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Attendance Earnings</Text>
                <Text style={styles.breakdownValue}>₹{item.breakdown.attendance.toLocaleString()}</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Overtime</Text>
                <Text style={styles.breakdownValue}>₹{item.breakdown.overtime.toLocaleString()}</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Advances</Text>
                <Text style={styles.breakdownValue}>₹{item.breakdown.advances.toLocaleString()}</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Others</Text>
                <Text style={styles.breakdownValue}>₹{item.breakdown.others.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Payroll Report</Text>
            <Text style={styles.headerSubtitle}>Salary summaries and payment history</Text>
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
            style={[styles.dateTab, dateRangePreset === 'this-week' && styles.dateTabActive]}
            onPress={() => setDateRangePreset('this-week')}
          >
            <Text style={[styles.dateTabText, dateRangePreset === 'this-week' && styles.dateTabTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateTab, dateRangePreset === 'this-month' && styles.dateTabActive]}
            onPress={() => setDateRangePreset('this-month')}
          >
            <Text style={[styles.dateTabText, dateRangePreset === 'this-month' && styles.dateTabTextActive]}>
              This Month
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

        {/* Site Filter & Search */}
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
          <View style={styles.searchContainer}>
            <Search size={16} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search workers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
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

      {/* Summary Statistics */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <View style={styles.cardIcon}>
            <DollarSign size={16} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.cardLabel}>Gross Salary</Text>
            <Text style={styles.cardValue}>₹{summaryStats.grossSalary.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.cardIcon, { backgroundColor: '#FEE2E2' }]}>
            <Minus size={16} color="#EF4444" />
          </View>
          <View>
            <Text style={styles.cardLabel}>Deductions</Text>
            <Text style={styles.cardValue}>₹{summaryStats.deductions.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.cardIcon, { backgroundColor: '#D1FAE5' }]}>
            <Plus size={16} color="#10B981" />
          </View>
          <View>
            <Text style={styles.cardLabel}>Net Payable</Text>
            <Text style={styles.cardValue}>₹{summaryStats.netPayable.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Worker Payroll Table */}
      <View style={styles.tableSection}>
        <View style={styles.tableHeader}>
          <DollarSign size={16} color="#7C3AED" />
          <Text style={styles.tableTitle}>Worker Payroll</Text>
        </View>
        <Text style={styles.tableSubtitle}>
          Individual worker salary details ({filteredPayrollData.length} workers shown)
        </Text>

        {/* Table Header */}
        <View style={styles.tableRow}>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('workerName')}>
            <Text style={styles.tableHeaderText}>Worker</Text>
            {sortField === 'workerName' && (
              sortDirection === 'asc' ?
                <ChevronUp size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('daysWorked')}>
            <Text style={styles.tableHeaderText}>Days</Text>
            {sortField === 'daysWorked' && (
              sortDirection === 'asc' ?
                <ChevronUp size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('grossSalary')}>
            <Text style={styles.tableHeaderText}>Gross</Text>
            {sortField === 'grossSalary' && (
              sortDirection === 'asc' ?
                <ChevronUp size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('deductions')}>
            <Text style={styles.tableHeaderText}>Deduct.</Text>
            {sortField === 'deductions' && (
              sortDirection === 'asc' ?
                <ChevronUp size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('netPay')}>
            <Text style={styles.tableHeaderText}>Net Pay</Text>
            {sortField === 'netPay' && (
              sortDirection === 'asc' ?
                <ChevronUp size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('status')}>
            <Text style={styles.tableHeaderText}>Status</Text>
            {sortField === 'status' && (
              sortDirection === 'asc' ?
                <ChevronUp size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        {/* Table Body */}
        {filteredPayrollData.length > 0 ? (
          <FlatList
            data={filteredPayrollData}
            renderItem={renderPayrollRow}
            keyExtractor={(item) => item.workerId}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <DollarSign size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No payroll data found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search or filters' : 'No payroll data available for the selected period'}
            </Text>
          </View>
        )}
      </View>

      {/* Payment Summary */}
      <View style={styles.paymentSummary}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        <View style={styles.summaryBreakdown}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={styles.summaryValue}>₹{paymentSummary.paid.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryValue}>₹{paymentSummary.pending.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#6B7280' }]} />
            <Text style={styles.summaryLabel}>N/A</Text>
            <Text style={styles.summaryValue}>₹{paymentSummary.na.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Export Section */}
      <View style={styles.exportSection}>
        <View style={styles.exportHeader}>
          <Download size={16} color="#374151" />
          <Text style={styles.exportTitle}>Export Report</Text>
        </View>
        <Text style={styles.exportSubtitle}>
          Download payroll data in your preferred format
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
    flex: 1,
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
  payrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  workerCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    marginRight: 8,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  cellText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#111827',
  },
  statusCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  expandedRow: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  breakdownSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
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
  // Payment Summary
  paymentSummary: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  summaryBreakdown: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
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