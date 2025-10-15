// Mock worker data
export interface AttendanceRecord {
  date: string;
  status: 'present' | 'half' | 'absent' | 'holiday';
  timestamp?: number; // Unix timestamp when attendance was marked
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  from: string;
  to: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  site: string;
  dailyRate: number;
  attendance: AttendanceRecord[];
  advances: { date: string; amount: number }[];
  overtime: number;
  otherAdjustments: number;
  payments: Payment[];
}

// Generate attendance data for the past 3 months
const generateAttendance = (): AttendanceRecord[] => {
  const attendance: AttendanceRecord[] = [];
  const today = new Date();
  
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Randomize attendance status
    const rand = Math.random();
    let status: 'present' | 'half' | 'absent' | 'holiday';
    
    if (date.getDay() === 0) { // Sunday
      status = 'holiday';
    } else if (rand > 0.8) {
      status = 'absent';
    } else if (rand > 0.7) {
      status = 'half';
    } else {
      status = 'present';
    }
    
    attendance.push({ date: dateStr, status });
  }
  
  return attendance;
};

export const workers: Worker[] = [
  {
    id: '1',
    name: 'Sanga',
    role: 'Mason',
    phone: '9876543210',
    site: 'Grace Resort',
    dailyRate: 500,
    attendance: generateAttendance(),
    advances: [
      { date: '2025-01-05', amount: 1000 },
      { date: '2025-01-15', amount: 500 },
    ],
    overtime: 200,
    otherAdjustments: -100,
    payments: [
      {
        id: 'p1',
        date: '2025-01-07',
        amount: 2000,
        from: '2025-01-01',
        to: '2025-01-07',
      },
    ],
  },
  {
    id: '2',
    name: 'Liana',
    role: 'Helper',
    phone: '9876543211',
    site: 'Zonuam Site',
    dailyRate: 350,
    attendance: generateAttendance(),
    advances: [
      { date: '2025-01-10', amount: 800 },
    ],
    overtime: 150,
    otherAdjustments: 0,
    payments: [],
  },
  {
    id: '3',
    name: 'Rema',
    role: 'Carpenter',
    phone: '9876543212',
    site: 'Zonuam Site',
    dailyRate: 600,
    attendance: generateAttendance(),
    advances: [
      { date: '2025-01-08', amount: 1200 },
    ],
    overtime: 300,
    otherAdjustments: 100,
    payments: [],
  },
  {
    id: '4',
    name: 'Joseph',
    role: 'Electrician',
    phone: '9876543213',
    site: 'Zonuam Site',
    dailyRate: 550,
    attendance: generateAttendance(),
    advances: [],
    overtime: 250,
    otherAdjustments: 0,
    payments: [],
  },
  {
    id: '5',
    name: 'Maria',
    role: 'Painter',
    phone: '9876543214',
    site: 'Zonuam Site',
    dailyRate: 450,
    attendance: generateAttendance(),
    advances: [
      { date: '2025-01-12', amount: 600 },
    ],
    overtime: 180,
    otherAdjustments: -50,
    payments: [],
  },
];

// Helper function to get worker by ID
export const getWorkerById = (id: string): Worker | undefined => {
  return workers.find(w => w.id === id);
};
