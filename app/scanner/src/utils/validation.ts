/**
 * Frame Validation Utilities
 * Validates captured frames for temporal coherence
 */

import type { FrameData, ValidationResult } from '@/types';

/**
 * Validate timing coherence of captured frames
 * Ensures frames are captured in correct temporal sequence
 *
 * @param frames - Array of captured frames
 * @param expectedFPS - Expected frames per second (default 60)
 * @param tolerance - Tolerance factor (0.3 = ±30%)
 * @returns true if timing is coherent
 */
export function validateTimingCoherence(
  frames: FrameData[],
  expectedFPS = 60,
  tolerance = 0.3
): boolean {
  if (frames.length < 2) return false;

  const expectedInterval = 1000 / expectedFPS; // ms between frames
  const minInterval = expectedInterval * (1 - tolerance);
  const maxInterval = expectedInterval * (1 + tolerance);

  for (let i = 1; i < frames.length; i++) {
    const interval = frames[i].t - frames[i - 1].t;

    // Check if interval is within acceptable range
    if (interval < minInterval || interval > maxInterval) {
      console.warn(`Timing coherence failed: interval ${interval}ms not in range [${minInterval}, ${maxInterval}]`);
      return false;
    }

    // Check frame numbers are sequential
    if (frames[i].f !== frames[i - 1].f + 1) {
      console.warn(`Frame sequence broken: ${frames[i - 1].f} -> ${frames[i].f}`);
      return false;
    }

    // Check timestamps are increasing
    if (frames[i].t <= frames[i - 1].t) {
      console.warn('Timestamps not increasing');
      return false;
    }
  }

  return true;
}

/**
 * Validate cryptographic coherence
 * Ensures challenges reference previous frame correctly
 *
 * @param frames - Array of captured frames
 * @returns true if crypto chain is valid
 */
export function validateCryptoCoherence(frames: FrameData[]): boolean {
  if (frames.length < 2) return true; // Single frame can't be validated

  for (let i = 1; i < frames.length; i++) {
    // Check if current frame references previous challenge
    if (frames[i].p) {
      const expectedRef = frames[i - 1].c.substring(0, 8);
      if (frames[i].p !== expectedRef) {
        console.warn(`Crypto coherence failed: expected ${expectedRef}, got ${frames[i].p}`);
        return false;
      }
    }

    // Check challenges are unique
    if (frames[i].c === frames[i - 1].c) {
      console.warn('Duplicate challenges detected');
      return false;
    }
  }

  return true;
}

/**
 * Validate visual coherence
 * Ensures visual modifiers progress smoothly
 *
 * @param frames - Array of captured frames
 * @returns true if visual modifiers are coherent
 */
export function validateVisualCoherence(frames: FrameData[]): boolean {
  if (frames.length < 2) return true;

  for (let i = 1; i < frames.length; i++) {
    const rotationDiff = Math.abs(frames[i].m.rotation - frames[i - 1].m.rotation);
    const phaseDiff = Math.abs(frames[i].m.phase - frames[i - 1].m.phase);

    // Rotation shouldn't change by more than 10 degrees between frames
    if (rotationDiff > 10 && rotationDiff < 350) {
      console.warn(`Visual coherence failed: rotation jump ${rotationDiff}°`);
      return false;
    }

    // Phase shouldn't jump dramatically (allow wrapping 0-1)
    if (phaseDiff > 0.2 && phaseDiff < 0.8) {
      console.warn(`Visual coherence failed: phase jump ${phaseDiff}`);
      return false;
    }
  }

  return true;
}

/**
 * Validate entire frame sequence
 * Combines all validation checks
 *
 * @param frames - Array of captured frames
 * @returns Validation result with detailed errors
 */
export function validateFrameSequence(frames: FrameData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Minimum frame count
  if (frames.length < 5) {
    errors.push(`Insufficient frames: ${frames.length}/5 minimum`);
  }

  // Maximum frame count (prevent DOS)
  if (frames.length > 20) {
    warnings.push(`Excessive frames: ${frames.length}/20 maximum`);
  }

  // Session ID consistency
  const sessionIds = new Set(frames.map((f) => f.session));
  if (sessionIds.size > 1) {
    errors.push('Multiple session IDs detected');
  }

  // Timing coherence
  const timingCoherent = validateTimingCoherence(frames);
  if (!timingCoherent) {
    errors.push('Timing coherence validation failed');
  }

  // Cryptographic coherence
  const cryptoCoherent = validateCryptoCoherence(frames);
  if (!cryptoCoherent) {
    errors.push('Cryptographic coherence validation failed');
  }

  // Visual coherence
  const visualCoherent = validateVisualCoherence(frames);
  if (!visualCoherent) {
    warnings.push('Visual coherence check failed (not critical)');
  }

  // Check for duplicate frames
  const timestamps = frames.map((f) => f.t);
  const uniqueTimestamps = new Set(timestamps);
  if (timestamps.length !== uniqueTimestamps.size) {
    errors.push('Duplicate timestamps detected');
  }

  // Overall validity
  const valid = errors.length === 0 && timingCoherent && cryptoCoherent;

  return {
    valid,
    errors,
    warnings,
    timingCoherent,
    cryptoCoherent,
    visualCoherent,
  };
}

/**
 * Calculate capture quality score (0-100)
 *
 * @param frames - Array of captured frames
 * @returns Quality score
 */
export function calculateQualityScore(frames: FrameData[]): number {
  if (frames.length === 0) return 0;

  let score = 0;

  // Frame count score (0-40 points)
  const frameCountScore = Math.min(40, (frames.length / 10) * 40);
  score += frameCountScore;

  // Timing coherence score (0-30 points)
  if (validateTimingCoherence(frames)) {
    score += 30;
  }

  // Crypto coherence score (0-20 points)
  if (validateCryptoCoherence(frames)) {
    score += 20;
  }

  // Visual coherence score (0-10 points)
  if (validateVisualCoherence(frames)) {
    score += 10;
  }

  return Math.round(score);
}

/**
 * Check if frames are likely from a screenshot
 * (All timestamps identical = screenshot)
 *
 * @param frames - Array of captured frames
 * @returns true if screenshot detected
 */
export function detectScreenshot(frames: FrameData[]): boolean {
  if (frames.length < 2) return false;

  // If all timestamps are identical, it's a screenshot
  const firstTimestamp = frames[0].t;
  const allSameTimestamp = frames.every((f) => f.t === firstTimestamp);

  if (allSameTimestamp) {
    console.warn('Screenshot detected: all timestamps identical');
    return true;
  }

  // If all frame numbers are identical, it's a screenshot
  const firstFrameNum = frames[0].f;
  const allSameFrame = frames.every((f) => f.f === firstFrameNum);

  if (allSameFrame) {
    console.warn('Screenshot detected: all frame numbers identical');
    return true;
  }

  return false;
}
