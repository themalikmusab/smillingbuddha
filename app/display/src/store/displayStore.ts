/**
 * Zustand store for Display System state management
 */

import { create } from 'zustand';
import type { DisplayStore, SessionConfig, DisplaySettings, FrameData, SessionState } from '@/types';
import { generateSessionId } from '@/utils/format';

// Default settings
const defaultSettings: DisplaySettings = {
  fullscreen: false,
  brightness: 1.0,
  qrSize: 'large',
  showInfo: true,
  autoStart: false,
};

// Default session state
const defaultSessionState: SessionState = {
  status: 'idle',
  currentFrame: 0,
  studentsScanned: 0,
};

/**
 * Display Store
 * Manages session configuration, state, and frame data
 */
export const useDisplayStore = create<DisplayStore>((set, get) => ({
  // Initial state
  session: null,
  sessionState: defaultSessionState,
  settings: defaultSettings,
  currentFrameData: null,
  challengeChain: [],

  // Create new session
  createSession: (config) => {
    const sessionId = generateSessionId();
    const newSession: SessionConfig = {
      id: sessionId,
      ...config,
    };

    set({
      session: newSession,
      sessionState: defaultSessionState,
      challengeChain: [],
      currentFrameData: null,
    });
  },

  // Start session
  startSession: () => {
    const { session, sessionState } = get();

    if (!session) {
      console.error('Cannot start session: No session created');
      return;
    }

    if (sessionState.status === 'active') {
      console.warn('Session already active');
      return;
    }

    set({
      sessionState: {
        ...sessionState,
        status: 'active',
        startedAt: Date.now(),
        pausedAt: undefined,
      },
    });
  },

  // Pause session
  pauseSession: () => {
    const { sessionState } = get();

    if (sessionState.status !== 'active') {
      console.warn('Cannot pause: Session not active');
      return;
    }

    set({
      sessionState: {
        ...sessionState,
        status: 'paused',
        pausedAt: Date.now(),
      },
    });
  },

  // Resume session
  resumeSession: () => {
    const { sessionState } = get();

    if (sessionState.status !== 'paused') {
      console.warn('Cannot resume: Session not paused');
      return;
    }

    set({
      sessionState: {
        ...sessionState,
        status: 'active',
        pausedAt: undefined,
      },
    });
  },

  // End session
  endSession: () => {
    const { sessionState } = get();

    set({
      sessionState: {
        ...sessionState,
        status: 'completed',
      },
    });

    // Optional: Send final report to server
    console.log('Session ended:', {
      totalFrames: sessionState.currentFrame,
      studentsScanned: sessionState.studentsScanned,
    });
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

  // Set current frame data
  setCurrentFrame: (frame) => {
    const { sessionState, challengeChain } = get();

    // Update challenge chain (keep last 100)
    const newChain = [...challengeChain, frame.c];
    if (newChain.length > 100) {
      newChain.shift();
    }

    set({
      currentFrameData: frame,
      challengeChain: newChain,
      sessionState: {
        ...sessionState,
        currentFrame: frame.f,
      },
    });
  },

  // Increment student count
  incrementStudentCount: () => {
    const { sessionState } = get();

    set({
      sessionState: {
        ...sessionState,
        studentsScanned: sessionState.studentsScanned + 1,
      },
    });
  },
}));
