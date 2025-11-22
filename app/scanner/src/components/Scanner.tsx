/**
 * Scanner Component
 * Orchestrates the scanning process, validation, and submission
 */

import { useEffect, useState, useCallback } from 'react';
import { CameraView } from './CameraView';
import { useScannerStore } from '@/store/scannerStore';
import { validateFrameSequence, detectScreenshot, calculateQualityScore } from '@/utils/validation';
import type { FrameData, OfflineProof } from '@/types';
import './Scanner.css';

export function Scanner() {
  const {
    student,
    settings,
    scannerState,
    capturedFrames,
    setScannerState,
    addCapturedFrame,
    clearCapturedFrames,
    saveOfflineProof,
  } = useScannerStore();

  const [captureStartTime, setCaptureStartTime] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Handle frame captured from camera
   */
  const handleFrameCaptured = useCallback(
    (frame: FrameData) => {
      // Only capture frames when actively scanning
      if (scannerState.status !== 'capturing') return;

      // Check if this is the first frame
      if (capturedFrames.length === 0) {
        setCaptureStartTime(Date.now());
      }

      // Check capture timeout
      const elapsed = Date.now() - captureStartTime;
      if (elapsed > settings.maxCaptureTime) {
        setScannerState({
          status: 'error',
          errorMessage: 'Capture timeout - please try again',
        });
        setErrorMessage('Capture took too long. Please hold steady and try again.');
        return;
      }

      // Add frame to collection
      addCapturedFrame(frame);

      // Provide haptic feedback (if enabled)
      if (settings.vibrationFeedback && navigator.vibrate) {
        navigator.vibrate(10);
      }
    },
    [scannerState.status, capturedFrames.length, captureStartTime, settings, addCapturedFrame, setScannerState]
  );

  /**
   * Handle camera errors
   */
  const handleCameraError = useCallback((error: Error) => {
    console.error('Camera error:', error);
    setScannerState({
      status: 'error',
      errorMessage: error.message,
    });
    setErrorMessage(error.message);
  }, [setScannerState]);

  /**
   * Start scanning
   */
  const startScanning = useCallback(() => {
    if (!student) {
      setErrorMessage('Please set up your profile first');
      return;
    }

    clearCapturedFrames();
    setErrorMessage('');
    setCaptureStartTime(Date.now());
    setScannerState({
      status: 'capturing',
      framesCollected: 0,
      errorMessage: undefined,
    });
  }, [student, clearCapturedFrames, setScannerState]);

  /**
   * Cancel scanning
   */
  const cancelScanning = useCallback(() => {
    clearCapturedFrames();
    setScannerState({ status: 'idle' });
  }, [clearCapturedFrames, setScannerState]);

  /**
   * Validate and submit captured frames
   */
  const validateAndSubmit = useCallback(async () => {
    if (capturedFrames.length === 0) {
      setErrorMessage('No frames captured');
      return;
    }

    setScannerState({ status: 'validating' });

    // Check for screenshot
    if (detectScreenshot(capturedFrames)) {
      setScannerState({
        status: 'error',
        errorMessage: 'Screenshot detected!',
      });
      setErrorMessage('❌ Screenshot detected! You must scan the live QR code.');
      return;
    }

    // Validate frame sequence
    const validation = validateFrameSequence(capturedFrames);

    if (!validation.valid) {
      setScannerState({
        status: 'error',
        errorMessage: validation.errors.join(', '),
      });
      setErrorMessage(`❌ Validation failed: ${validation.errors[0]}`);
      return;
    }

    // Calculate quality score
    const quality = calculateQualityScore(capturedFrames);
    console.log('Capture quality:', quality);

    // Check if online or offline
    const isOnline = navigator.onLine;

    if (!isOnline && settings.offlineMode) {
      // Save offline proof
      const proof: OfflineProof = {
        id: `proof_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        sessionId: capturedFrames[0].session,
        studentId: student!.id,
        frames: capturedFrames,
        timestamp: Date.now(),
        synced: false,
      };

      await saveOfflineProof(proof);

      setScannerState({
        status: 'success',
        lastScanTime: Date.now(),
      });

      setErrorMessage('');

      // Provide success feedback
      if (settings.vibrationFeedback && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // Auto-reset after 3 seconds
      setTimeout(() => {
        clearCapturedFrames();
        setScannerState({ status: 'idle' });
      }, 3000);
    } else {
      // TODO: Submit to server
      // For now, simulate online submission
      console.log('Submitting to server:', {
        sessionId: capturedFrames[0].session,
        studentId: student!.id,
        frames: capturedFrames,
        quality,
      });

      setScannerState({
        status: 'success',
        lastScanTime: Date.now(),
      });

      setErrorMessage('');

      // Provide success feedback
      if (settings.vibrationFeedback && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // Auto-reset after 3 seconds
      setTimeout(() => {
        clearCapturedFrames();
        setScannerState({ status: 'idle' });
      }, 3000);
    }
  }, [capturedFrames, student, settings, setScannerState, saveOfflineProof, clearCapturedFrames]);

  /**
   * Effect: Auto-validate when enough frames collected
   */
  useEffect(() => {
    if (capturedFrames.length >= settings.targetFrames && scannerState.status === 'capturing') {
      validateAndSubmit();
    }
  }, [capturedFrames.length, settings.targetFrames, scannerState.status, validateAndSubmit]);

  return (
    <div className="scanner">
      {/* Camera View */}
      <CameraView
        onFrameCaptured={handleFrameCaptured}
        onError={handleCameraError}
        isScanning={scannerState.status === 'capturing'}
      />

      {/* Status Overlay */}
      <div className="scanner-overlay">
        {/* Frame Counter */}
        {scannerState.status === 'capturing' && (
          <div className="frame-counter">
            <div className="progress-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="8"
                  strokeDasharray={`${(capturedFrames.length / settings.targetFrames) * 283} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="counter-text">
                {capturedFrames.length}/{settings.targetFrames}
              </div>
            </div>
            <p>Capturing frames...</p>
          </div>
        )}

        {/* Validating */}
        {scannerState.status === 'validating' && (
          <div className="status-message">
            <div className="loader"></div>
            <p>Validating...</p>
          </div>
        )}

        {/* Success */}
        {scannerState.status === 'success' && (
          <div className="status-message success">
            <div className="success-icon">✓</div>
            <p>Attendance Recorded!</p>
            {!navigator.onLine && <small>(Saved offline - will sync later)</small>}
          </div>
        )}

        {/* Error */}
        {scannerState.status === 'error' && errorMessage && (
          <div className="status-message error">
            <div className="error-icon">✗</div>
            <p>{errorMessage}</p>
            <button onClick={cancelScanning} className="btn btn-secondary">
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="scanner-controls">
        {scannerState.status === 'idle' && (
          <button onClick={startScanning} className="btn btn-primary btn-large">
            📷 Scan QR Code
          </button>
        )}

        {scannerState.status === 'capturing' && (
          <button onClick={cancelScanning} className="btn btn-danger">
            Cancel
          </button>
        )}

        {(scannerState.status === 'error' || scannerState.status === 'success') && (
          <button onClick={() => setScannerState({ status: 'idle' })} className="btn btn-secondary">
            Scan Another
          </button>
        )}
      </div>
    </div>
  );
}
