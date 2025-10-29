import React from 'react';
import { View, TouchableOpacity, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { ArrowLeft, Download, Building, Users, TrendingUp, BarChart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ReportsPageProps {
  onAttendanceReportClick?: () => void;
  onPayrollReportClick?: () => void;
  onFinancialReportClick?: () => void;
}

function ReportsPage({
  onAttendanceReportClick,
  onPayrollReportClick,
  onFinancialReportClick
}: ReportsPageProps) {
  const router = useRouter();

  const handleAttendanceReport = () => {
    console.log('Attendance Report button clicked');
    Alert.alert('Attendance Report', 'Generating attendance report...');
  };

  const handlePayrollReport = () => {
    console.log('Payroll Report button clicked');
    Alert.alert('Payroll Report', 'Generating payroll report...');
  };

  const handleFinancialReport = () => {
    console.log('Financial Report button clicked');
    Alert.alert('Financial Report', 'Generating financial report...');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Reports</Text>
            <Text style={styles.headerSubtitle}>Analytics and insights</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.exportButton}>
          <Download size={16} color="#16A34A" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Building size={20} color="#2563EB" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statLabel}>Active Sites</Text>
            <Text style={styles.statValue}>3</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#D1FAE5' }]}>
            <Users size={20} color="#16A34A" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statLabel}>Total Workers</Text>
            <Text style={styles.statValue}>35</Text>
          </View>
        </View>
      </View>

      {/* Available Reports */}
      <View style={styles.reportsSection}>
        <Text style={styles.sectionTitle}>Available Reports</Text>

        {/* Attendance Report Card */}
        <View style={[styles.reportCard, { borderLeftColor: '#16A34A' }]}>
          <View style={styles.reportCardHeader}>
            <View style={styles.reportTitleContainer}>
              <TrendingUp size={16} color="#16A34A" />
              <Text style={styles.reportTitle}>Attendance Report</Text>
            </View>
            <Text style={styles.reportDescription}>
              Worker attendance trends and statistics
            </Text>
          </View>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleAttendanceReport}
          >
            <Text style={styles.generateButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>

        {/* Payroll Report Card */}
        <View style={[styles.reportCard, { borderLeftColor: '#3B82F6' }]}>
          <View style={styles.reportCardHeader}>
            <View style={styles.reportTitleContainer}>
              <BarChart size={16} color="#3B82F6" />
              <Text style={styles.reportTitle}>Payroll Report</Text>
            </View>
            <Text style={styles.reportDescription}>
              Salary summaries and payment history
            </Text>
          </View>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handlePayrollReport}
          >
            <Text style={styles.generateButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>

        {/* Financial Report Card */}
        <View style={[styles.reportCard, { borderLeftColor: '#F97316' }]}>
          <View style={styles.reportCardHeader}>
            <View style={styles.reportTitleContainer}>
              <Building size={16} color="#F97316" />
              <Text style={styles.reportTitle}>Financial Report</Text>
            </View>
            <Text style={styles.reportDescription}>
              Income, expenses, and cash flow analysis
            </Text>
          </View>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleFinancialReport}
          >
            <Text style={styles.generateButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom padding for navigation */}
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
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
  // Quick Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE', // Blue background for Active Sites
  },
  statTextContainer: {
    marginLeft: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  // Reports Section
  reportsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportCardHeader: {
    marginBottom: 12,
  },
  reportTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 6,
  },
  reportDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  generateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  // Bottom padding
  bottomPadding: {
    height: 80,
  },
});

export default ReportsPage;
