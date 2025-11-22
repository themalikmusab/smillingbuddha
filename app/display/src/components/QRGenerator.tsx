/**
 * QR Generator Component
 * Generates animated temporal QR codes at 60 FPS with cryptographic chaining
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import type { QRGeneratorProps, FrameData } from '@/types';
import { generateFrameData } from '@/utils/crypto';
import { useDisplayStore } from '@/store/displayStore';

export function QRGenerator({ sessionId, frameRate = 60, onFrameGenerated, onError }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameNumberRef = useRef(0);
  const previousChallengeRef = useRef<string | undefined>(undefined);
  const animationIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  const [fps, setFps] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const { sessionState, setCurrentFrame } = useDisplayStore();

  // Calculate frame interval in milliseconds
  const frameInterval = 1000 / frameRate;

  /**
   * Generate and render a single frame
   */
  const renderFrame = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      // Generate frame data with cryptographic challenge
      const frameData: FrameData = generateFrameData(
        sessionId,
        frameNumberRef.current,
        previousChallengeRef.current
      );

      // Store current challenge for next frame
      previousChallengeRef.current = frameData.c;

      // Convert frame data to JSON string for QR encoding
      const qrContent = JSON.stringify(frameData);

      // Generate QR code with high error correction
      await QRCode.toCanvas(canvasRef.current, qrContent, {
        errorCorrectionLevel: 'H',
        width: canvasRef.current.width,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Apply visual modifiers (rotation)
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && frameData.m.rotation !== 0) {
        // Subtle rotation effect (disabled by default for better scanning)
        // Uncomment to enable rotation:
        // ctx.translate(canvasRef.current.width / 2, canvasRef.current.height / 2);
        // ctx.rotate((frameData.m.rotation * Math.PI) / 180);
        // ctx.translate(-canvasRef.current.width / 2, -canvasRef.current.height / 2);
      }

      // Update store
      setCurrentFrame(frameData);

      // Callback
      if (onFrameGenerated) {
        onFrameGenerated(frameData);
      }

      // Increment frame counter
      frameNumberRef.current++;
    } catch (error) {
      console.error('Frame generation error:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [sessionId, onFrameGenerated, onError, setCurrentFrame]);

  /**
   * Animation loop with precise timing
   */
  const animate = useCallback((currentTime: number) => {
    if (!isRunning) return;

    // Calculate time since last frame
    const elapsed = currentTime - lastFrameTimeRef.current;

    // Render frame if enough time has passed
    if (elapsed >= frameInterval) {
      // Calculate actual FPS
      const actualFPS = 1000 / elapsed;
      setFps(actualFPS);

      // Render the frame
      renderFrame();

      // Update last frame time
      lastFrameTimeRef.current = currentTime;
    }

    // Request next frame
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isRunning, frameInterval, renderFrame]);

  /**
   * Start animation
   */
  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    lastFrameTimeRef.current = performance.now();
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isRunning, animate]);

  /**
   * Stop animation
   */
  const stop = useCallback(() => {
    setIsRunning(false);
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, []);

  /**
   * Reset animation
   */
  const reset = useCallback(() => {
    stop();
    frameNumberRef.current = 0;
    previousChallengeRef.current = undefined;
    setFps(0);
  }, [stop]);

  /**
   * Effect: Start/stop based on session state
   */
  useEffect(() => {
    if (sessionState.status === 'active') {
      start();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [sessionState.status, start, stop]);

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <div className="qr-generator">
      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        className="qr-canvas"
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          imageRendering: 'pixelated',
        }}
      />

      {/* FPS Counter */}
      <div className="qr-info" style={{
        marginTop: '1rem',
        textAlign: 'center',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        color: '#666',
      }}>
        <div>Frame: {frameNumberRef.current}</div>
        <div>FPS: {fps.toFixed(1)}</div>
        <div>Status: {isRunning ? '🟢 Running' : '🔴 Stopped'}</div>
      </div>
    </div>
  );
}
