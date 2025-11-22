/**
 * Core Types for Temporal 3D QR Code System - Scanner Component
 */

// Frame data structure (matches display system)
export interface FrameData {
  session: string;           // Session ID
  t: number;                 // Timestamp (Unix ms)
  f: number;                 // Frame number
  c: string;                 // Current challenge (SHA-256 hash, 16 chars)
  p?: string;                // Previous challenge reference (8 chars)
  m: FrameModifier;         // Visual modifiers
}

// Visual modifiers
export interface FrameModifier {
  rotation: number;
  phase: number;
  brightness?: number;
}

// Captured frame sequence
export interface CapturedSequence {
  frames: FrameData[];
  captureStartTime: number;
  captureEndTime: number;
  totalFrames: number;
  sessionId: string;
}

// Scan result
export interface ScanResult {
  success: boolean;
  sessionId?: string;
  studentId?: string;
  timestamp: number;
  frameCount?: number;
  message: string;
  offline?: boolean;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  timingCoherent: boolean;
  cryptoCoherent: boolean;
  visualCoherent: boolean;
}

// Student profile
export interface StudentProfile {
  id: string;
  name: string;
  email?: string;
  rollNumber?: string;
}

// Scanner settings
export interface ScannerSettings {
  targetFrames: number;        // Number of frames to capture (5-10)
  maxCaptureTime: number;      // Max capture time in ms (500ms)
  autoSubmit: boolean;         // Auto-submit after capture
  offlineMode: boolean;        // Enable offline mode
  vibrationFeedback: boolean;  // Vibrate on successful scan
  soundFeedback: boolean;      // Play sound on successful scan
}

// Scanner state
export interface ScannerState {
  status: 'idle' | 'requesting_camera' | 'scanning' | 'capturing' | 'validating' | 'success' | 'error';
  currentSession?: string;
  framesCollected: number;
  errorMessage?: string;
  lastScanTime?: number;
}

// Offline proof (stored locally when offline)
export interface OfflineProof {
  id: string;
  sessionId: string;
  studentId: string;
  frames: FrameData[];
  timestamp: number;
  signature?: string;          // Hardware-backed signature (future)
  synced: boolean;
}

// Store state interface
export interface ScannerStore {
  // Student data
  student: StudentProfile | null;
  settings: ScannerSettings;
  scannerState: ScannerState;

  // Captured data
  capturedFrames: FrameData[];
  offlineProofs: OfflineProof[];

  // Actions
  setStudent: (student: StudentProfile) => void;
  updateSettings: (settings: Partial<ScannerSettings>) => void;
  setScannerState: (state: Partial<ScannerState>) => void;
  addCapturedFrame: (frame: FrameData) => void;
  clearCapturedFrames: () => void;
  saveOfflineProof: (proof: OfflineProof) => void;
  markProofSynced: (proofId: string) => void;
}

// Camera props
export interface CameraViewProps {
  onFrameCaptured: (frame: FrameData) => void;
  onError: (error: Error) => void;
  isScanning: boolean;
}

// Statistics
export interface ScanStats {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  offlineScans: number;
  averageCaptureTime: number; // ms
}

// API Types
export interface VerifyRequest {
  sessionId: string;
  studentId: string;
  frames: FrameData[];
  timestamp: number;
  offline?: boolean;
}

export interface VerifyResponse {
  valid: boolean;
  message: string;
  attendanceRecorded: boolean;
  timestamp: number;
}

export interface SyncRequest {
  proofs: OfflineProof[];
}

export interface SyncResponse {
  synced: number;
  failed: number;
  errors: string[];
}
