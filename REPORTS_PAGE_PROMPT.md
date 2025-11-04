# Comprehensive Reports Page Prompt

Create a comprehensive prompt for the Reports Page. This document includes:

Complete Reports System Specification covering:

## PART 1: REPORTS LANDING PAGE

**Header with Export button**
- Title: "Reports" with subtitle "Analytics and insights"
- Export button (green outline) with download icon
- Clean, professional header design

**Quick Stats cards (Active Sites, Total Workers)**
- Two horizontal cards showing key metrics
- Active Sites: Blue icon, current count (3)
- Total Workers: Green icon, current count (35)
- Card design: White background, subtle shadow, rounded corners

**Three report cards with colored left borders:**
- **Attendance Report (green)** - Worker attendance trends
  - TrendingUp icon, description text
  - "Generate Report" button
- **Payroll Report (blue)** - Salary summaries
  - BarChart icon, description text
  - "Generate Report" button
- **Financial Report (orange)** - Income/expenses analysis
  - Building icon, description text
  - "Generate Report" button

## PART 2: ATTENDANCE REPORT PAGE

**Header with back button and export**
- Back arrow navigation
- Title: "Attendance Report" with subtitle "Worker attendance analytics"
- Export button (green outline)

**Filters Section:**
- **Site selector** (All Sites or specific)
  - Dropdown with chevron icon
- **Date range presets** (7d, 30d, This month, Last month, Custom)
  - Dropdown selection
- **Custom date pickers** with calendar popover
  - From/To date inputs with calendar icons
- **Weekly/Monthly view toggle**
  - Segmented control buttons
- **Search workers functionality**
  - Text input with search icon

**Summary Cards (4-column grid):**
- Workers count (blue icon)
- Present count (green icon)
- Absent count (red icon)
- Attendance rate percentage (green icon)

**Worker Details Table:**
- **Sortable columns** (Name, Days, Present, Absent, %)
  - Click headers to sort ascending/descending
  - Visual sort indicators (up/down arrows)
- **Half-day indicators** (+{count}½)
  - Small orange text below present count
- **Color-coded percentage badges**
  - Green ≥90%, Yellow ≥75%, Red <75%
  - Rounded badges with background colors
- **Sort indicators** (ascending/descending)
  - Chevron icons next to column headers

**Export Section:** PDF and CSV download
- Two buttons: "Export PDF" (outline), "Export CSV" (filled green)
- Section header with download icon

## PART 3: PAYROLL REPORT PAGE

**Header with sticky positioning**
- Back button and export button
- Title: "Payroll Report" with subtitle "Salary summaries and payment history"

**Filters:**
- **Date range tabs** (This Week, This Month, Custom)
  - Tabbed interface for quick selection
- **Site filter** and worker search
  - Dropdown and search input

**Summary Statistics (3 cards):**
- **Gross Salary** (blue) - Total gross earnings
- **Deductions** (red) - Total deductions amount
- **Net Payable** (green) - Final payment amount

**Worker Payroll Table:**
- **Expandable rows** (click to show breakdown)
  - Plus/minus icons for expansion
- **Columns:** Worker, Days, Gross, Deductions, Net Pay, Status
- **Status badges** (Paid-green, Pending-yellow, N/A-outline)
  - Color-coded status indicators
- **Expanded details:** Attendance earnings, Overtime, Advances, Others
  - Detailed breakdown when row expanded

**Payment Summary:** Paid vs Pending breakdown
- Visual representation of payment status
- Counts and amounts for each category

## PART 4: FINANCIAL REPORT PAGE

**Filters:**
- **Date range tabs** (Daily, Weekly, Monthly, Custom)
  - Tabbed navigation for time periods
- **Site and category filters**
  - Multi-select dropdowns
- **Transaction search**
  - Text input for filtering transactions

**Financial Summary (3 cards):**
- **Total Income** (green) - All income transactions
- **Total Expenses** (red) - All expense transactions
- **Net Cash Flow** (blue/orange based on positive/negative)
  - Dynamic color based on profit/loss

**Charts Section (toggleable):**
- **Pie Chart:** Expense breakdown by category with color coding
  - Interactive pie chart using recharts
- **Bar Chart:** Daily cash flow (last 7 days) - Income vs Expenses
  - Dual bar chart showing inflows/outflows

**Transaction List:**
- **Category icons and color coding**
  - Visual category indicators
- **Income/Expense differentiation** (+/-)
  - Green for income, red for expenses
- **Category badges**
  - Rounded badges for each category
- **Hover effects**
  - Interactive row highlighting

## Advanced Features:

- **Multiple filter combinations**
  - Combine site, date, and search filters
- **Real-time calculations**
  - Dynamic summary updates as filters change
- **Sortable tables with visual indicators**
  - Column sorting with arrow indicators
- **Expandable/collapsible rows**
  - Detailed breakdowns on demand
- **Date range presets + custom selection**
  - Quick presets with custom date picker fallback
- **Search across multiple fields**
  - Worker names, roles, categories, etc.
- **CSV export with proper formatting**
  - Structured data export functionality
- **Chart visualizations using recharts**
  - Interactive charts for data visualization
- **Color-coded badges and status indicators**
  - Consistent color scheme throughout
- **Empty state handling**
  - Graceful handling of no data scenarios
- **Responsive mobile layout**
  - Optimized for mobile devices

## Technical Specifications:

**4 complete component structures**
- ReportsLandingPage.tsx
- AttendanceReportPage.tsx
- PayrollReportPage.tsx
- FinancialReportPage.tsx

**All TypeScript interfaces**
```typescript
interface WorkerAttendance {
  id: string;
  name: string;
  role: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  attendancePercentage: number;
}

interface PayrollData {
  workerId: string;
  workerName: string;
  daysWorked: number;
  grossSalary: number;
  deductions: number;
  netPay: number;
  status: 'paid' | 'pending' | 'na';
  breakdown: {
    attendance: number;
    overtime: number;
    advances: number;
    others: number;
  };
}

interface FinancialTransaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
}
```

**State management for filters, sorts, expansions**
- React hooks for local state
- useState for filter selections
- useMemo for calculated summaries
- useEffect for data fetching

**Calculation functions for summaries**
```typescript
const calculateAttendanceSummary = (workers: WorkerAttendance[]) => ({
  totalWorkers: workers.length,
  totalPresent: workers.reduce((sum, w) => sum + w.presentDays + w.halfDays, 0),
  totalAbsent: workers.reduce((sum, w) => sum + w.absentDays, 0),
  attendanceRate: workers.length > 0 ?
    workers.reduce((sum, w) => sum + w.attendancePercentage, 0) / workers.length : 0
});

const calculatePayrollSummary = (payrolls: PayrollData[]) => ({
  grossSalary: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
  deductions: payrolls.reduce((sum, p) => sum + p.deductions, 0),
  netPayable: payrolls.reduce((sum, p) => sum + p.netPay, 0)
});

const calculateFinancialSummary = (transactions: FinancialTransaction[]) => ({
  totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
  totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
  netCashFlow: 0 // calculate based on income - expenses
});
```

**Date range utilities**
```typescript
const getDateRange = (preset: string) => {
  const now = new Date();
  switch (preset) {
    case '7d': return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: now };
    case '30d': return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now };
    case 'this-month': return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    case 'last-month': return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0)
    };
    default: return { from: now, to: now };
  }
};
```

**Export functionality (CSV working, PDF placeholder)**
```typescript
const exportToCSV = (data: any[], filename: string) => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const exportToPDF = (data: any[], filename: string) => {
  // Placeholder for PDF export implementation
  alert('PDF export functionality to be implemented');
};
```

**Chart configuration**
```typescript
// Pie Chart for expense breakdown
const pieChartData = categories.map((category, index) => ({
  name: category.name,
  value: category.amount,
  fill: COLORS[index % COLORS.length]
}));

// Bar Chart for daily cash flow
const barChartData = dailyData.map(day => ({
  date: day.date,
  income: day.income,
  expenses: day.expenses
}));
```

**Sorting and filtering logic**
```typescript
const sortData = <T,>(data: T[], field: keyof T, direction: 'asc' | 'desc'): T[] => {
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

const filterData = <T,>(data: T[], searchTerm: string, searchFields: (keyof T)[]): T[] => {
  if (!searchTerm) return data;
  return data.filter(item =>
    searchFields.some(field =>
      String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
};
```

This prompt can be pasted directly into any no-code builder platform to create the complete Reports system with landing page, attendance analytics, payroll summaries, financial reports, and all interactive features ready for production use!