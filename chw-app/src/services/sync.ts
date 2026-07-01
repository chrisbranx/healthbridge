import { getSyncQueue, markSynced, getCachedPatients, getCachedTasks, cachePatients, cacheTasks, savePendingAdherence, clearPendingAdherence, getCachedEscalations, cacheEscalations } from './db';
import { chwApi } from './api';

let isSyncing = false;

export async function syncData() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const queue = await getSyncQueue();
    for (const item of queue) {
      try {
        await chwApi.logAdherence(item.data);
        await markSynced(item.id);
      } catch (err) {
        console.warn('Sync failed for item:', item.id, err);
      }
    }

    try {
      const [patients, tasks, escalations] = await Promise.all([
        chwApi.patients(),
        chwApi.tasks(),
        chwApi.escalations(),
      ]);

      await cachePatients(patients.data || []);
      await cacheTasks(tasks.data || []);
      await cacheEscalations(escalations.data || []);
    } catch (err) {
      console.warn('Cache refresh failed (offline):', err);
    }
  } finally {
    isSyncing = false;
  }
}

export function setupPeriodicSync() {
  syncData();

  window.addEventListener('online', () => {
    console.log('Back online — syncing data...');
    syncData();
  });

  setInterval(() => {
    if (navigator.onLine) {
      syncData();
    }
  }, 5 * 60 * 1000);
}
