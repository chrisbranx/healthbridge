import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'healthbridge-chw';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<any>>;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('patients')) {
          db.createObjectStore('patients', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('escalations')) {
          db.createObjectStore('escalations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('adherence')) {
          db.createObjectStore('adherence', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('pending_adherence')) {
          db.createObjectStore('pending_adherence', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function cachePatients(patients: any[]) {
  const db = await getDB();
  const tx = db.transaction('patients', 'readwrite');
  for (const patient of patients) {
    await tx.store.put(patient);
  }
  await tx.done;
}

export async function getCachedPatients(): Promise<any[]> {
  const db = await getDB();
  return db.getAll('patients');
}

export async function cacheTasks(tasks: any[]) {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  for (const task of tasks) {
    await tx.store.put(task);
  }
  await tx.done;
}

export async function getCachedTasks(): Promise<any[]> {
  const db = await getDB();
  return db.getAll('tasks');
}

export async function addToSyncQueue(data: any) {
  const db = await getDB();
  return db.add('sync_queue', {
    ...data,
    created_at: new Date().toISOString(),
    synced: false,
  });
}

export async function getSyncQueue() {
  const db = await getDB();
  return db.getAll('sync_queue');
}

export async function markSynced(id: number) {
  const db = await getDB();
  return db.delete('sync_queue', id);
}

export async function cacheEscalations(escalations: any[]) {
  const db = await getDB();
  const tx = db.transaction('escalations', 'readwrite');
  for (const e of escalations) {
    await tx.store.put(e);
  }
  await tx.done;
}

export async function getCachedEscalations(): Promise<any[]> {
  const db = await getDB();
  return db.getAll('escalations');
}

export async function savePendingAdherence(data: any) {
  const db = await getDB();
  return db.add('pending_adherence', {
    ...data,
    created_at: new Date().toISOString(),
  });
}

export async function clearPendingAdherence() {
  const db = await getDB();
  const tx = db.transaction('pending_adherence', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

export async function getPendingAdherenceCount(): Promise<number> {
  const db = await getDB();
  const all = await db.getAll('pending_adherence');
  return all.length;
}
