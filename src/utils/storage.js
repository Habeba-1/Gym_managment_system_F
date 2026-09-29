const OFFLINE_QUEUE_KEY = 'fitpulse_offline_attendance_queue';

export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addToOfflineQueue = (attendanceRecord) => {
  const queue = getOfflineQueue();
  // Ensure record has a unique local_id to guarantee idempotency
  const recordWithLocalId = {
    ...attendanceRecord,
    local_id: attendanceRecord.local_id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  
  queue.push(recordWithLocalId);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return recordWithLocalId;
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};

export const removeOfflineItem = (localId) => {
  const queue = getOfflineQueue().filter((item) => item.local_id !== localId);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};
