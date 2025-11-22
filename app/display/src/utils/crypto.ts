/**
 * Cryptographic utilities for Temporal 3D QR Code System
 * Implements SHA-256 based challenge generation and chaining
 */

import CryptoJS from 'crypto-js';
import type { ChallengeParams, FrameData, FrameModifier } from '@/types';

/**
 * Generate cryptographic challenge for a frame
 * Uses SHA-256 with session ID, timestamp, frame number, and previous challenge
 *
 * @param params - Challenge generation parameters
 * @returns 16-character hex string (64 bits of entropy)
 */
export function generateChallenge(params: ChallengeParams): string {
  const { sessionId, timestamp, frameNumber, previousChallenge = '' } = params;

  // Concatenate inputs for hashing
  const input = `${previousChallenge}${timestamp}${frameNumber}${sessionId}`;

  // Generate SHA-256 hash
  const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);

  // Return first 16 characters (64 bits)
  return hash.substring(0, 16);
}

/**
 * Generate frame modifier for visual temporal coherence
 * Creates deterministic but unpredictable visual variations
 *
 * @param frameNumber - Current frame number
 * @param challenge - Current challenge string
 * @returns Frame modifier with rotation and phase
 */
export function generateFrameModifier(
  frameNumber: number,
  challenge: string
): FrameModifier {
  // Use challenge to generate deterministic but unpredictable values
  const hash = parseInt(challenge.substring(0, 8), 16);

  // Rotation: 0-360 degrees (changes every frame)
  const rotation = (frameNumber * 2 + (hash % 360)) % 360;

  // Phase: 0-1 (sine wave with challenge-based frequency)
  const frequency = (hash % 10) + 1;
  const phase = (Math.sin(frameNumber / frequency) + 1) / 2;

  // Optional brightness variation (subtle, 0.9-1.1)
  const brightness = 0.9 + ((hash % 20) / 100);

  return {
    rotation,
    phase,
    brightness,
  };
}

/**
 * Validate challenge chain coherence
 * Ensures each challenge is correctly derived from previous
 *
 * @param challenges - Array of challenges to validate
 * @param sessionId - Session ID
 * @param startTimestamp - Starting timestamp
 * @returns true if chain is valid
 */
export function validateChallengeChain(
  challenges: string[],
  sessionId: string,
  startTimestamp: number
): boolean {
  if (challenges.length === 0) return false;

  for (let i = 1; i < challenges.length; i++) {
    const expectedChallenge = generateChallenge({
      sessionId,
      timestamp: startTimestamp + (i * 16.67), // Assume 60 FPS
      frameNumber: i,
      previousChallenge: challenges[i - 1],
    });

    if (challenges[i] !== expectedChallenge) {
      return false;
    }
  }

  return true;
}

/**
 * Generate complete frame data with challenge and modifiers
 *
 * @param sessionId - Session ID
 * @param frameNumber - Frame number
 * @param previousChallenge - Previous frame's challenge (optional)
 * @returns Complete frame data ready for QR encoding
 */
export function generateFrameData(
  sessionId: string,
  frameNumber: number,
  previousChallenge?: string
): FrameData {
  const timestamp = Date.now();

  // Generate challenge
  const challenge = generateChallenge({
    sessionId,
    timestamp,
    frameNumber,
    previousChallenge,
  });

  // Generate modifiers
  const modifier = generateFrameModifier(frameNumber, challenge);

  // Build frame data
  const frameData: FrameData = {
    session: sessionId,
    t: timestamp,
    f: frameNumber,
    c: challenge,
    m: modifier,
  };

  // Include previous challenge reference if available
  if (previousChallenge) {
    frameData.p = previousChallenge.substring(0, 8);
  }

  return frameData;
}

/**
 * Calculate expected frame count for a time duration
 *
 * @param durationMs - Duration in milliseconds
 * @param fps - Frames per second (default 60)
 * @returns Expected number of frames
 */
export function calculateExpectedFrames(durationMs: number, fps = 60): number {
  return Math.floor((durationMs / 1000) * fps);
}

/**
 * Verify timing coherence of captured frames
 *
 * @param frames - Array of frame data
 * @param expectedFPS - Expected frames per second
 * @param tolerance - Tolerance factor (0.2 = ±20%)
 * @returns true if timing is coherent
 */
export function verifyTimingCoherence(
  frames: FrameData[],
  expectedFPS = 60,
  tolerance = 0.2
): boolean {
  if (frames.length < 2) return false;

  const expectedInterval = 1000 / expectedFPS; // ms between frames
  const minInterval = expectedInterval * (1 - tolerance);
  const maxInterval = expectedInterval * (1 + tolerance);

  for (let i = 1; i < frames.length; i++) {
    const interval = frames[i].t - frames[i - 1].t;

    // Check if interval is within acceptable range
    if (interval < minInterval || interval > maxInterval) {
      return false;
    }

    // Check frame numbers are sequential
    if (frames[i].f !== frames[i - 1].f + 1) {
      return false;
    }
  }

  return true;
}
