// localStorage helper functions for worker data

const WORKERS_KEY = 'worksite_workers';

export function loadWorkers() {
  try {
    const data = localStorage.getItem(WORKERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading workers:', error);
    return {};
  }
}

export function saveWorkers(workers) {
  try {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
    return true;
  } catch (error) {
    console.error('Error saving workers:', error);
    return false;
  }
}

export function updateAttendance(workerId, dateISO, status) {
  const workers = loadWorkers();
  
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
  
  saveWorkers(workers);
  return workers[workerId];
}

export function isExpired(markedAt) {
  if (!markedAt) return false;
  const now = Date.now();
  const elapsed = now - markedAt;
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return elapsed > twentyFourHours;
}
