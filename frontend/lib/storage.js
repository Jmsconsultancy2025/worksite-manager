// AsyncStorage helper functions for worker data and user subscription
import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKERS_KEY = 'worksite_workers';
const USER_SUBSCRIPTION_KEY = 'user_subscription';

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

export async function updateWorkerHiddenStatus(workerId, hidden) {
  const workers = await loadWorkers();

  if (!workers[workerId]) {
    workers[workerId] = {};
  }

  workers[workerId].hidden = hidden;
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

// User subscription functions
export async function getUserSubscription() {
  try {
    const data = await AsyncStorage.getItem(USER_SUBSCRIPTION_KEY);
    return data ? JSON.parse(data) : { plan: 'basic', status: 'active' };
  } catch (error) {
    console.error('Error loading user subscription:', error);
    return { plan: 'basic', status: 'active' };
  }
}

export async function setUserSubscription(subscription) {
  try {
    await AsyncStorage.setItem(USER_SUBSCRIPTION_KEY, JSON.stringify(subscription));
    return true;
  } catch (error) {
    console.error('Error saving user subscription:', error);
    return false;
  }
}

// Plan limits and features
export const PLAN_LIMITS = {
  basic: {
    maxWorkers: 10,
    maxSites: 1,
    features: ['basic_attendance', 'basic_reports']
  },
  standard: {
    maxWorkers: 50,
    maxSites: 5,
    features: ['advanced_attendance', 'salary_management', 'basic_reports', 'export', 'notifications']
  },
  pro: {
    maxWorkers: -1, // unlimited
    maxSites: -1, // unlimited
    features: ['all_standard', 'advanced_reports', 'custom_fields', 'api_access', 'priority_support']
  }
};

export function getCurrentPlanLimits() {
  return PLAN_LIMITS;
}

export async function checkFeatureAccess(feature) {
  const subscription = await getUserSubscription();
  const planLimits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.basic;
  return planLimits.features.includes(feature) || planLimits.features.includes('all_standard');
}

export async function checkWorkerLimit(currentWorkerCount) {
  const subscription = await getUserSubscription();
  const planLimits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.basic;
  if (planLimits.maxWorkers === -1) return true; // unlimited
  return currentWorkerCount < planLimits.maxWorkers;
}

export async function checkSiteLimit(currentSiteCount) {
  const subscription = await getUserSubscription();
  const planLimits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.basic;
  if (planLimits.maxSites === -1) return true; // unlimited
  return currentSiteCount < planLimits.maxSites;
}
