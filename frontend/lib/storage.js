// localStorage helper functions for worker data
// Note: Using localStorage for web compatibility

import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKERS_KEY = 'worksite_workers';
const SUBSCRIPTION_KEY = '@currentSubscription';

export async function loadWorkers() {
  try {
    const data = await AsyncStorage.getItem(WORKERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading workers:', error);
    return {};
  }
}

export async function saveWorkers(workers) {
  try {
    await AsyncStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
    return true;
  } catch (error) {
    console.error('Error saving workers:', error);
    return false;
  }
}

export async function updateAttendance(workerId, dateISO, status) {
  const workers = await loadWorkers();

  if (!workers[workerId]) {
    workers[workerId] = { attendance: [] };
  }

  if (!workers[workerId].attendance) {
    workers[workerId].attendance = [];
  }

  // Find existing or create new
  const existingIndex = workers[workerId].attendance.findIndex(a => a.date === dateISO);

  const record = {
    date: dateISO,
    status: status,
    markedAt: Date.now()
  };

  if (existingIndex >= 0) {
    workers[workerId].attendance[existingIndex] = record;
  } else {
    workers[workerId].attendance.push(record);
  }

  await saveWorkers(workers);
  return workers[workerId];
}

export async function updateSalary(workerId, dateISO, amount) {
  const workers = await loadWorkers();

  if (!workers[workerId]) {
    workers[workerId] = { salary: [] };
  }

  if (!workers[workerId].salary) {
    workers[workerId].salary = [];
  }

  // Find existing or create new
  const existingIndex = workers[workerId].salary.findIndex(s => s.date === dateISO);

  const record = {
    date: dateISO,
    amount: amount,
    recordedAt: Date.now()
  };

  if (existingIndex >= 0) {
    workers[workerId].salary[existingIndex] = record;
  } else {
    workers[workerId].salary.push(record);
  }

  await saveWorkers(workers);
  return workers[workerId];
}

export function isExpired(markedAt) {
  if (!markedAt) return false;
  const now = Date.now();
  const elapsed = now - markedAt;
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return elapsed > twentyFourHours;
}

export async function getUserSubscription() {
  try {
    const raw = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    return raw ? JSON.parse(raw) : { plan: 'basic', status: 'active' };
  } catch(e) {
    return { plan: 'basic', status: 'active' };
  }
}

export async function setUserSubscription(subscription) {
  try {
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    return true;
  } catch(e) {
    console.error('Error saving subscription:', e);
    return false;
  }
}

export const PLAN_LIMITS = {
  basic: {
    workers: 5,
    sites: 3,
    reports: 10,
    features: ['basic_attendance']
  },
  premium: {
    workers: 50,
    sites: 20,
    reports: 100,
    features: ['advanced_attendance', 'salary_management', 'detailed_reports']
  },
  enterprise: {
    workers: 200,
    sites: 100,
    reports: 1000,
    features: ['all_features']
  }
};