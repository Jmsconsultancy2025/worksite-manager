import React from 'react';
import { ArrowLeft, Download, Building, Users, TrendingUp, BarChart } from 'lucide-react';
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
    window.alert('Attendance Report\nGenerating attendance report...');
  };

  const handlePayrollReport = () => {
    console.log('Payroll Report button clicked');
    window.alert('Payroll Report\nGenerating payroll report...');
  };

  const handleFinancialReport = () => {
    console.log('Financial Report button clicked');
    window.alert('Financial Report\nGenerating financial report...');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </button>
          <div style={styles.titleContainer}>
            <h1 style={styles.headerTitle}>Reports</h1>
            <p style={styles.headerSubtitle}>Analytics and insights</p>
          </div>
        </div>
        <button style={styles.exportButton}>
          <Download size={16} color="#16A34A" />
          <span style={styles.exportButtonText}>Export</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIconContainer}>
            <Building size={20} color="#2563EB" />
          </div>
          <div style={styles.statTextContainer}>
            <span style={styles.statLabel}>Active Sites</span>
            <span style={styles.statValue}>3</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIconContainer, backgroundColor: '#D1FAE5'}}>
            <Users size={20} color="#16A34A" />
          </div>
          <div style={styles.statTextContainer}>
            <span style={styles.statLabel}>Total Workers</span>
            <span style={styles.statValue}>35</span>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div style={styles.reportsSection}>
        <h2 style={styles.sectionTitle}>Available Reports</h2>

        {/* Attendance Report Card */}
        <div style={{...styles.reportCard, borderLeftColor: '#16A34A'}}>
          <div style={styles.reportCardHeader}>
            <div style={styles.reportTitleContainer}>
              <TrendingUp size={16} color="#16A34A" />
              <span style={styles.reportTitle}>Attendance Report</span>
            </div>
            <p style={styles.reportDescription}>
              Worker attendance trends and statistics
            </p>
          </div>
          <button
            style={styles.generateButton}
            onClick={handleAttendanceReport}
          >
            <span style={styles.generateButtonText}>Generate Report</span>
          </button>
        </div>

        {/* Payroll Report Card */}
        <div style={{...styles.reportCard, borderLeftColor: '#3B82F6'}}>
          <div style={styles.reportCardHeader}>
            <div style={styles.reportTitleContainer}>
              <BarChart size={16} color="#3B82F6" />
              <span style={styles.reportTitle}>Payroll Report</span>
            </div>
            <p style={styles.reportDescription}>
              Salary summaries and payment history
            </p>
          </div>
          <button
            style={styles.generateButton}
            onClick={handlePayrollReport}
          >
            <span style={styles.generateButtonText}>Generate Report</span>
          </button>
        </div>

        {/* Financial Report Card */}
        <div style={{...styles.reportCard, borderLeftColor: '#F97316'}}>
          <div style={styles.reportCardHeader}>
            <div style={styles.reportTitleContainer}>
              <Building size={16} color="#F97316" />
              <span style={styles.reportTitle}>Financial Report</span>
            </div>
            <p style={styles.reportDescription}>
              Income, expenses, and cash flow analysis
            </p>
          </div>
          <button
            style={styles.generateButton}
            onClick={handleFinancialReport}
          >
            <span style={styles.generateButtonText}>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Bottom padding for navigation */}
      <div style={styles.bottomPadding} />
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflowY: 'auto',
  },
  // Header
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: '12px',
    padding: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '2px',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  exportButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '6px 12px',
    border: '1px solid #16A34A',
    borderRadius: '6px',
    background: 'none',
    cursor: 'pointer',
    gap: '6px',
  },
  exportButtonText: {
    fontSize: '12px',
    color: '#16A34A',
    fontWeight: '500',
  },
  // Quick Stats
  statsContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    padding: '16px',
  },
  statCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  statIconContainer: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE', // Blue background for Active Sites
  },
  statTextContainer: {
    marginLeft: '8px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6B7280',
    marginBottom: '2px',
    display: 'block',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    display: 'block',
  },
  // Reports Section
  reportsSection: {
    padding: '0 16px 16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '12px',
    margin: 0,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    borderLeft: '4px solid',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  reportCardHeader: {
    marginBottom: '12px',
  },
  reportTitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '4px',
  },
  reportTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    marginLeft: '6px',
  },
  reportDescription: {
    fontSize: '12px',
    color: '#6B7280',
    lineHeight: '16px',
    margin: 0,
  },
  generateButton: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
  },
  generateButtonText: {
    fontSize: '12px',
    color: '#374151',
    fontWeight: '500',
  },
  // Bottom padding
  bottomPadding: {
    height: '80px',
  },
};

export default ReportsPage;
