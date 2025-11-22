/**
 * IndexedDB Storage Utilities
 * Handles offline proof storage and synchronization
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { OfflineProof, StudentProfile } from '@/types';

const DB_NAME = 'temporal-qr-scanner';
const DB_VERSION = 1;

// Store names
const STORES = {
  PROOFS: 'offline_proofs',
  STUDENT: 'student_profile',
  SETTINGS: 'settings',
} as const;

let dbInstance: IDBPDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Offline proofs store
      if (!db.objectStoreNames.contains(STORES.PROOFS)) {
        const proofStore = db.createObjectStore(STORES.PROOFS, {
          keyPath: 'id',
          autoIncrement: false,
        });
        proofStore.createIndex('sessionId', 'sessionId', { unique: false });
        proofStore.createIndex('synced', 'synced', { unique: false });
        proofStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Student profile store
      if (!db.objectStoreNames.contains(STORES.STUDENT)) {
        db.createObjectStore(STORES.STUDENT, {
          keyPath: 'id',
        });
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS);
      }
    },
  });

  return dbInstance;
}

/**
 * Save offline proof
 */
export async function saveOfflineProof(proof: OfflineProof): Promise<void> {
  const db = await initDB();
  await db.put(STORES.PROOFS, proof);
  console.log('Offline proof saved:', proof.id);
}

/**
 * Get all unsynced offline proofs
 */
export async function getUnsyncedProofs(): Promise<OfflineProof[]> {
  const db = await initDB();
  const index = db.transaction(STORES.PROOFS).store.index('synced');
  return await index.getAll(false);
}

/**
 * Get all offline proofs
 */
export async function getAllProofs(): Promise<OfflineProof[]> {
  const db = await initDB();
  return await db.getAll(STORES.PROOFS);
}

/**
 * Mark proof as synced
 */
export async function markProofSynced(proofId: string): Promise<void> {
  const db = await initDB();
  const proof = await db.get(STORES.PROOFS, proofId);

  if (proof) {
    proof.synced = true;
    await db.put(STORES.PROOFS, proof);
    console.log('Proof marked as synced:', proofId);
  }
}

/**
 * Delete synced proofs older than specified days
 */
export async function cleanupOldProofs(daysOld = 7): Promise<number> {
  const db = await initDB();
  const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

  const allProofs = await db.getAll(STORES.PROOFS);
  const toDelete = allProofs.filter(
    (p) => p.synced && p.timestamp < cutoffTime
  );

  const tx = db.transaction(STORES.PROOFS, 'readwrite');
  for (const proof of toDelete) {
    await tx.store.delete(proof.id);
  }
  await tx.done;

  console.log(`Cleaned up ${toDelete.length} old proofs`);
  return toDelete.length;
}

/**
 * Save student profile
 */
export async function saveStudentProfile(
  student: StudentProfile
): Promise<void> {
  const db = await initDB();
  await db.put(STORES.STUDENT, student);
  console.log('Student profile saved:', student.id);
}

/**
 * Get student profile
 */
export async function getStudentProfile(): Promise<StudentProfile | null> {
  const db = await initDB();
  const profiles = await db.getAll(STORES.STUDENT);
  return profiles.length > 0 ? profiles[0] : null;
}

/**
 * Delete student profile
 */
export async function deleteStudentProfile(): Promise<void> {
  const db = await initDB();
  const profiles = await db.getAll(STORES.STUDENT);
  const tx = db.transaction(STORES.STUDENT, 'readwrite');

  for (const profile of profiles) {
    await tx.store.delete(profile.id);
  }

  await tx.done;
  console.log('Student profile deleted');
}

/**
 * Save settings
 */
export async function saveSetting(key: string, value: unknown): Promise<void> {
  const db = await initDB();
  await db.put(STORES.SETTINGS, value, key);
}

/**
 * Get setting
 */
export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await initDB();
  return await db.get(STORES.SETTINGS, key);
}

/**
 * Clear all data (for testing/logout)
 */
export async function clearAllData(): Promise<void> {
  const db = await initDB();

  const tx = db.transaction(
    [STORES.PROOFS, STORES.STUDENT, STORES.SETTINGS],
    'readwrite'
  );

  await tx.objectStore(STORES.PROOFS).clear();
  await tx.objectStore(STORES.STUDENT).clear();
  await tx.objectStore(STORES.SETTINGS).clear();

  await tx.done;
  console.log('All data cleared');
}

/**
 * Get database statistics
 */
export async function getStorageStats() {
  const db = await initDB();

  const proofsCount = await db.count(STORES.PROOFS);
  const unsyncedCount = await db.countFromIndex(STORES.PROOFS, 'synced', false);

  return {
    totalProofs: proofsCount,
    unsyncedProofs: unsyncedCount,
    syncedProofs: proofsCount - unsyncedCount,
  };
}
