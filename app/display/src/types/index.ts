/**
 * Core Types for Temporal 3D QR Code System - Display Component
 */

// Frame data structure that gets encoded in QR
export interface FrameData {
  session: string;           // Session ID
  t: number;                 // Timestamp (Unix ms)
  f: number;                 // Frame number
  c: string;                 // Current challenge (SHA-256 hash, 16 chars)
  p?: string;                // Previous challenge reference (8 chars)
  m: FrameModifier;         // Visual modifiers for temporal coherence
}

// Visual modifiers for anti-screenshot
export interface FrameModifier {
  rotation: number;          // Rotation angle (0-360)
  phase: number;            // Phase shift (0-1)
  brightness?: number;       // Optional brightness (0.8-1.2)
}

// Session configuration
export interface SessionConfig {
  id: string;
  name: string;
  location: string;
  startTime: number;
  duration: number;          // Duration in minutes
  frameRate: number;         // Target FPS (default 60)
  offlineMode: boolean;
}

// Display settings
export interface DisplaySettings {
  fullscreen: boolean;
  brightness: number;
  qrSize: 'small' | 'medium' | 'large';
  showInfo: boolean;
  autoStart: boolean;
}

// Session state
export interface SessionState {
  status: 'idle' | 'active' | 'paused' | 'completed';
  currentFrame: number;
  studentsScanned: number;
  startedAt?: number;
  pausedAt?: number;
}

// Challenge generation params
export interface ChallengeParams {
  sessionId: string;
  timestamp: number;
  frameNumber: number;
  previousChallenge?: string;
}

// Store state interface
export interface DisplayStore {
  // Session data
  session: SessionConfig | null;
  sessionState: SessionState;
  settings: DisplaySettings;

  // Frame data
  currentFrameData: FrameData | null;
  challengeChain: string[];  // Store last 100 challenges for validation

  // Actions
  createSession: (config: Omit<SessionConfig, 'id'>) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  updateSettings: (settings: Partial<DisplaySettings>) => void;
  setCurrentFrame: (frame: FrameData) => void;
  incrementStudentCount: () => void;
}

// QR Generator Props
export interface QRGeneratorProps {
  sessionId: string;
  frameRate: number;
  onFrameGenerated?: (frame: FrameData) => void;
  onError?: (error: Error) => void;
}

// Statistics for display
export interface SessionStats {
  totalFrames: number;
  averageFPS: number;
  studentsScanned: number;
  uptime: number;            // Seconds
  estimatedRemaining: number; // Seconds
}
