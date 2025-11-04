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
  Users,
  TrendingUp,
  BarChart3,
  User,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Mock data - replace with actual data from your backend
const mockSites = [
  { id: 'all', name: 'All Sites' },
  { id: 'site1', name: 'Construction Site A' },
  { id: 'site2', name: 'Building Site B' },
  { id: 'site3', name: 'Infrastructure Project C' },
];

const mockWorkerStats = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    role: 'Mason',
    totalDays: 22,
    presentDays: 18,
    absentDays: 3,
    halfDays: 1,
    attendancePercentage: 86.36,
  },
  {
    id: '2',
    name: 'Amit Singh',
    role: 'Laborer',
    totalDays: 22,
    presentDays: 20,
    absentDays: 2,
    halfDays: 0,
    attendancePercentage: 90.91,
  },
  {
    id: '3',
    name: 'Suresh Patel',
    role: 'Electrician',
    totalDays: 22,
    presentDays: 15,
    absentDays: 5,
    halfDays: 2,
    attendancePercentage: 77.27,
  },
  {
    id: '4',
    name: 'Vikram Rao',
    role: 'Plumber',
    totalDays: 22,
    presentDays: 22,
    absentDays: 0,
    halfDays: 0,
    attendancePercentage: 100,
  },
  {
    id: '5',
    name: 'Kiran Desai',
    role: 'Carpenter',
    totalDays: 22,
    presentDays: 19,
    absentDays: 2,
    halfDays: 1,
    attendancePercentage: 90.91,
  },
];

type SortField = 'name' | 'totalDays' | 'presentDays' | 'absentDays' | 'attendancePercentage';
type SortDirection = 'asc' | 'desc';

export default function AttendanceReportPage() {
  const router = useRouter();
  const [selectedSite, setSelectedSite] = useState('all');
  const [dateRangePreset, setDateRangePreset] = useState('30d');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [reportView, setReportView] = useState<'weekly' | 'monthly'>('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filtered and sorted worker stats
  const filteredWorkerStats = useMemo(() => {
    let filtered = mockWorkerStats;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(worker =>
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.role.toLowerCase().includes(searchQuery.toLowerCase())
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
    const totalWorkers = filteredWorkerStats.length;
    const totalPresent = filteredWorkerStats.reduce((sum, worker) => sum + worker.presentDays + worker.halfDays, 0);
    const totalAbsent = filteredWorkerStats.reduce((sum, worker) => sum + worker.absentDays, 0);
    const totalPossibleDays = filteredWorkerStats.reduce((sum, worker) => sum + worker.totalDays, 0);
    const attendanceRate = totalPossibleDays > 0 ? ((totalPresent / totalPossibleDays) * 100) : 0;

    return {
      totalWorkers,
      totalPresent,
      totalAbsent,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    };
  }, [filteredWorkerStats]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return '#10B981'; // green
    if (percentage >= 75) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const renderWorkerRow = ({ item }: { item: typeof mockWorkerStats[0] }) => (
    <View style={styles.workerRow}>
      <View style={styles.workerCell}>
        <Text style={styles.workerName}>{item.name}</Text>
        <Text style={styles.workerRole}>{item.role}</Text>
      </View>
      <Text style={styles.cellText}>{item.totalDays}</Text>
      <View style={styles.presentCell}>
        <Text style={styles.cellText}>{item.presentDays}</Text>
        {item.halfDays > 0 && (
          <Text style={styles.halfDayText}>+{item.halfDays}½</Text>
        )}
      </View>
      <Text style={styles.cellText}>{item.absentDays}</Text>
      <View style={styles.percentageCell}>
        <View style={[styles.percentageBadge, { backgroundColor: getAttendanceColor(item.attendancePercentage) + '20' }]}>
          <Text style={[styles.percentageText, { color: getAttendanceColor(item.attendancePercentage) }]}>
            {item.attendancePercentage}%
          </Text>
        </View>
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
            <Text style={styles.headerTitle}>Attendance Report</Text>
            <Text style={styles.headerSubtitle}>Worker attendance analytics</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.exportButton}>
          <Download size={16} color="#16A34A" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      <View style={styles.filtersSection}>
        {/* Site & Date Range */}
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
            <Text style={styles.filterLabel}>Date Range</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectText}>
                {dateRangePreset === '7d' ? 'Last 7 days' :
                 dateRangePreset === '30d' ? 'Last 30 days' :
                 dateRangePreset === 'this-month' ? 'This month' :
                 dateRangePreset === 'last-month' ? 'Last month' : 'Custom Range'}
              </Text>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
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

        {/* View Toggle & Search */}
        <View style={styles.viewToggleRow}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, reportView === 'weekly' && styles.toggleActive]}
              onPress={() => setReportView('weekly')}
            >
              <Text style={[styles.toggleText, reportView === 'weekly' && styles.toggleTextActive]}>
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, reportView === 'monthly' && styles.toggleActive]}
              onPress={() => setReportView('monthly')}
            >
              <Text style={[styles.toggleText, reportView === 'monthly' && styles.toggleTextActive]}>
                Monthly
              </Text>
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
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <View style={styles.cardIcon}>
            <Users size={16} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.cardLabel}>Workers</Text>
            <Text style={styles.cardValue}>{summaryStats.totalWorkers}</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.cardIcon, { backgroundColor: '#D1FAE5' }]}>
            <TrendingUp size={16} color="#10B981" />
          </View>
          <View>
            <Text style={styles.cardLabel}>Present</Text>
            <Text style={styles.cardValue}>{summaryStats.totalPresent}</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.cardIcon, { backgroundColor: '#FEE2E2' }]}>
            <Users size={16} color="#EF4444" />
          </View>
          <View>
            <Text style={styles.cardLabel}>Absent</Text>
            <Text style={styles.cardValue}>{summaryStats.totalAbsent}</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.cardIcon, { backgroundColor: '#DCFCE7' }]}>
            <BarChart3 size={16} color="#059669" />
          </View>
          <View>
            <Text style={styles.cardLabel}>Rate</Text>
            <Text style={styles.cardValue}>{summaryStats.attendanceRate}%</Text>
          </View>
        </View>
      </View>

      {/* Worker Details Table */}
      <View style={styles.tableSection}>
        <View style={styles.tableHeader}>
          <User size={16} color="#7C3AED" />
          <Text style={styles.tableTitle}>Worker Details</Text>
        </View>
        <Text style={styles.tableSubtitle}>
          Individual worker attendance statistics ({filteredWorkerStats.length} workers shown)
        </Text>

        {/* Table Header */}
        <View style={styles.tableRow}>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('name')}>
            <Text style={styles.tableHeaderText}>Worker</Text>
            {sortField === 'name' && (
              sortDirection === 'asc' ?
                <ChevronUp size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('totalDays')}>
            <Text style={styles.tableHeaderText}>Days</Text>
            {sortField === 'totalDays' && (
              sortDirection === 'asc' ?
                <ChevronUp size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('presentDays')}>
            <Text style={styles.tableHeaderText}>Present</Text>
            {sortField === 'presentDays' && (
              sortDirection === 'asc' ?
                <ChevronUp size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('absentDays')}>
            <Text style={styles.tableHeaderText}>Absent</Text>
            {sortField === 'absentDays' && (
              sortDirection === 'asc' ?
                <ChevronUp size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('attendancePercentage')}>
            <Text style={styles.tableHeaderText}>%</Text>
            {sortField === 'attendancePercentage' && (
              sortDirection === 'asc' ?
                <ChevronUp size={14} color="#6B7280" /> :
                <ChevronDown size={14} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        {/* Table Body */}
        {filteredWorkerStats.length > 0 ? (
          <FlatList
            data={filteredWorkerStats}
            renderItem={renderWorkerRow}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Users size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No workers found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search or filters' : 'No attendance data available'}
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
          Download attendance data in your preferred format
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
  viewToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    padding: 2,
    flex: 1,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#2E7D32',
  },
  toggleText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
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
    flexWrap: 'wrap',
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
    minWidth: '45%',
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
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  workerCell: {
    flex: 2,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  workerRole: {
    fontSize: 12,
    color: '#6B7280',
  },
  cellText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#111827',
  },
  presentCell: {
    flex: 1,
    alignItems: 'center',
  },
  halfDayText: {
    fontSize: 10,
    color: '#F59E0B',
    marginTop: 2,
  },
  percentageCell: {
    flex: 1,
    alignItems: 'center',
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '500',
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