import React from 'react';
import { Home, People, AccountBalanceWallet, Note, BarChart } from 'lucide-react';
import { useRouter } from 'react-router-dom';
import ReportsPage from '../components/ReportsPage';

export default function Reports() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <ReportsPage />
      {/* Bottom Navigation Bar */}
      <div style={styles.bottomNav}>
        <button style={styles.navItem} onClick={() => router.push('/')}>
          <Home size={24} color="#9E9E9E" />
          <span style={styles.navLabel}>Home</span>
        </button>
        <button style={styles.navItem} onClick={() => router.push('/workers')}>
          <People size={24} color="#9E9E9E" />
          <span style={styles.navLabel}>Workers</span>
        </button>
        <button style={styles.navItem} onClick={() => router.push('/cashbook')}>
          <AccountBalanceWallet size={24} color="#9E9E9E" />
          <span style={styles.navLabel}>Cashbook</span>
        </button>
        <button style={styles.navItem} onClick={() => router.push('/notes')}>
          <Note size={24} color="#9E9E9E" />
          <span style={styles.navLabel}>Notes</span>
        </button>
        <button style={styles.navItem} onClick={() => router.push('/reports')}>
          <BarChart size={24} color="#4CAF50" />
          <span style={{...styles.navLabel, ...styles.navLabelActive}}>Reports</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  // Bottom Navigation Bar
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E0E0E0',
    padding: '8px 0',
    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  navLabel: {
    fontSize: '11px',
    color: '#757575',
    marginTop: '4px',
  },
  navLabelActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
};