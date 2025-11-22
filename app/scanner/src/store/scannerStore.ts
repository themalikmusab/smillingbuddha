/**
 * Zustand store for Scanner App state management
 */

import { create } from 'zustand';
import type { ScannerStore, StudentProfile, ScannerSettings, FrameData, OfflineProof } from '@/types';
import {
  saveStudentProfile as saveStudentToDB,
  getStudentProfile as getStudentFromDB,
  saveOfflineProof as saveProofToDB,
  markProofSynced as markProofSyncedInDB,
} from '@/utils/storage';

// Default settings
const defaultSettings: ScannerSettings = {
  targetFrames: 8,           // Capture 8 frames (optimal for 200ms @ 60fps)
  maxCaptureTime: 500,       // Maximum 500ms capture time
  autoSubmit: true,          // Auto-submit after successful capture
  offlineMode: true,         // Enable offline mode by default
  vibrationFeedback: true,   // Vibrate on success
  soundFeedback: false,      // No sound (can be annoying in classroom)
};

// Default scanner state
const defaultScannerState = {
  status: 'idle' as const,
  framesCollected: 0,
};

/**
 * Scanner Store
 * Manages student profile, settings, and scan state
 */
export const useScannerStore = create<ScannerStore>((set, get) => ({
  // Initial state
  student: null,
  settings: defaultSettings,
  scannerState: defaultScannerState,
  capturedFrames: [],
  offlineProofs: [],

  // Set student profile
  setStudent: async (student) => {
    set({ student });
    // Save to IndexedDB
    await saveStudentToDB(student);
  },

  // Update settings
  updateSettings: (newSettings) => {
    const { settings } = get();
    set({
      settings: {
        ...settings,
        ...newSettings,
      },
    });
  },

  // Set scanner state
  setScannerState: (newState) => {
    const { scannerState } = get();
    set({
      scannerState: {
        ...scannerState,
        ...newState,
      },
    });
  },

  // Add captured frame
  addCapturedFrame: (frame) => {
    const { capturedFrames, settings, scannerState } = get();
    const newFrames = [...capturedFrames, frame];

    set({
      capturedFrames: newFrames,
      scannerState: {
        ...scannerState,
        framesCollected: newFrames.length,
      },
    });

    // Check if we've collected enough frames
    if (newFrames.length >= settings.targetFrames) {
      set({
        scannerState: {
          ...scannerState,
          status: 'validating',
          framesCollected: newFrames.length,
        },
      });
    }
  },

  // Clear captured frames
  clearCapturedFrames: () => {
    set({
      capturedFrames: [],
      scannerState: {
        ...get().scannerState,
        framesCollected: 0,
      },
    });
  },

  // Save offline proof
  saveOfflineProof: async (proof) => {
    const { offlineProofs } = get();

    // Add to store
    set({
      offlineProofs: [...offlineProofs, proof],
    });

    // Save to IndexedDB
    await saveProofToDB(proof);
  },

  // Mark proof as synced
  markProofSynced: async (proofId) => {
    const { offlineProofs } = get();

    // Update in store
    set({
      offlineProofs: offlineProofs.map((p) =>
        p.id === proofId ? { ...p, synced: true } : p
      ),
    });

    // Mark in IndexedDB
    await markProofSyncedInDB(proofId);
  },
}));

/**
 * Initialize store from IndexedDB
 */
export async function initializeStore() {
  const student = await getStudentFromDB();
  if (student) {
    useScannerStore.setState({ student });
  }
}
