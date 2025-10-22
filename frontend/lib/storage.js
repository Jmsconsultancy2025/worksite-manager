// AsyncStorage helper functions for worker data
import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKERS_KEY = 'worksite_workers';

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
