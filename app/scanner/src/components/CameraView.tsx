/**
 * Camera View Component
 * Captures video stream and decodes QR codes using jsQR
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import type { CameraViewProps, FrameData } from '@/types';
import './CameraView.css';

export function CameraView({ onFrameCaptured, onError, isScanning }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [fps, setFps] = useState(0);
  const lastFrameTimeRef = useRef<number>(0);

  /**
   * Initialize camera
   */
  const initializeCamera = useCallback(async () => {
    try {
      // Request camera access with optimal settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60, min: 30 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        setCameraReady(true);
      }
    } catch (error) {
      console.error('Camera initialization error:', error);
      onError(
        error instanceof Error
          ? error
          : new Error('Failed to access camera')
      );
    }
  }, [onError]);

  /**
   * Scan frame for QR code
   */
  const scanFrame = useCallback(() => {
    if (!isScanning || !cameraReady || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationIdRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Set canvas size to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR decoding
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Decode QR code
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (qrCode) {
      try {
        // Parse QR data as JSON
        const frameData: FrameData = JSON.parse(qrCode.data);

        // Validate frame data structure
        if (
          frameData.session &&
          typeof frameData.t === 'number' &&
          typeof frameData.f === 'number' &&
          frameData.c &&
          frameData.m
        ) {
          // Valid frame detected
          onFrameCaptured(frameData);

          // Visual feedback (draw green box around QR)
          const { location } = qrCode;
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
          ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
          ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
          ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
          ctx.closePath();
          ctx.stroke();
        }
      } catch (error) {
        // Invalid QR data (not JSON or wrong format)
        console.debug('Invalid QR data:', qrCode.data);
      }
    }

    // Calculate FPS
    const currentTime = performance.now();
    if (lastFrameTimeRef.current > 0) {
      const elapsed = currentTime - lastFrameTimeRef.current;
      const currentFps = 1000 / elapsed;
      setFps(currentFps);
    }
    lastFrameTimeRef.current = currentTime;

    // Continue scanning
    animationIdRef.current = requestAnimationFrame(scanFrame);
  }, [isScanning, cameraReady, onFrameCaptured]);

  /**
   * Stop camera
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    setCameraReady(false);
  }, []);

  /**
   * Effect: Initialize camera on mount
   */
  useEffect(() => {
    initializeCamera();

    return () => {
      stopCamera();
    };
  }, [initializeCamera, stopCamera]);

  /**
   * Effect: Start/stop scanning based on isScanning prop
   */
  useEffect(() => {
    if (isScanning && cameraReady) {
      animationIdRef.current = requestAnimationFrame(scanFrame);
    } else if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isScanning, cameraReady, scanFrame]);

  return (
    <div className="camera-view">
      <div className="camera-container">
        <video
          ref={videoRef}
          className="camera-video"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="camera-canvas"
        />

        {/* Scanning overlay */}
        {isScanning && (
          <div className="scan-overlay">
            <div className="scan-frame">
              <div className="scan-corner scan-corner-tl"></div>
              <div className="scan-corner scan-corner-tr"></div>
              <div className="scan-corner scan-corner-bl"></div>
              <div className="scan-corner scan-corner-br"></div>
            </div>
            <div className="scan-line"></div>
          </div>
        )}

        {/* FPS Counter (debug) */}
        {cameraReady && (
          <div className="camera-info">
            <span>📹 {fps.toFixed(0)} FPS</span>
          </div>
        )}
      </div>

      {!cameraReady && (
        <div className="camera-loading">
          <div className="loader"></div>
          <p>Initializing camera...</p>
        </div>
      )}
    </div>
  );
}
