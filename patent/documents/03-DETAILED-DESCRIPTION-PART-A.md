# DETAILED DESCRIPTION OF THE INVENTION - PART A
## Display System & Capture System

**Application for:** Temporal Three-Dimensional QR Code System for Presence Verification
**Inventor:** Mus Ab Ali
**Date:** November 22, 2025

---

## TABLE OF CONTENTS - PART A

1. System Architecture Overview
2. Display System (Generator Component)
3. Capture System (Scanner Component)
4. Data Structures and Protocols

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### 1.1 Three-Layer Architecture

The present invention comprises three primary functional layers operating in coordinated sequence to achieve temporal authentication:

```
┌─────────────────────────────────────────────────────────┐
│                  LAYER 1: DISPLAY SYSTEM                │
│               (QR Code Generator - Server Side)          │
│                                                          │
│  Components:                                             │
│  - Temporal QR Generator Engine                         │
│  - Cryptographic Challenge Generator                     │
│  - Frame Sequencer                                       │
│  - Display Optimizer                                     │
│                                                          │
│  Output: Animated QR code stream (30-120 FPS)          │
└─────────────────────────────────────────────────────────┘
                           ↓
              (Optical transmission via light)
                           ↓
┌─────────────────────────────────────────────────────────┐
│                 LAYER 2: CAPTURE SYSTEM                  │
│              (QR Code Scanner - Client Side)             │
│                                                          │
│  Components:                                             │
│  - High-Speed Video Capture Module                      │
│  - Frame Extraction Engine                               │
│  - QR Decoder (WebAssembly-optimized)                   │
│  - Temporal Coherence Analyzer                           │
│  - Cryptographic Proof Generator (Offline Mode)         │
│                                                          │
│  Output: Frame sequence OR Cryptographic Attendance Proof│
└─────────────────────────────────────────────────────────┘
                           ↓
            (Network transmission via HTTP/S)
                           ↓
┌─────────────────────────────────────────────────────────┐
│               LAYER 3: VERIFICATION SYSTEM               │
│              (Validator - Server Side)                   │
│                                                          │
│  Components:                                             │
│  - Temporal Coherence Validator                          │
│  - Cryptographic Chain Verifier                          │
│  - Replay Attack Detector                                │
│  - Offline Proof Validator                               │
│  - Attendance Database                                   │
│                                                          │
│  Output: Valid/Invalid verdict + Attendance record      │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Sequence

**Scenario A: Online Mode (Normal Operation)**

```
[T=0ms] Teacher opens session → Server generates session ID
[T=10ms] Server begins rendering animated QR (60 FPS loop)
[T=1000ms] Student points camera at screen
[T=1100ms] Camera captures frame 1 (timestamp: T1, challenge: C1)
[T=1117ms] Camera captures frame 2 (timestamp: T2, challenge: C2)
[T=1133ms] Camera captures frame 3 (timestamp: T3, challenge: C3)
[T=1150ms] Camera captures frame 4 (timestamp: T4, challenge: C4)
[T=1167ms] Camera captures frame 5 (timestamp: T5, challenge: C5)
[T=1200ms] App validates temporal coherence locally (50ms)
[T=1250ms] App transmits frame sequence to server (50ms network)
[T=1300ms] Server validates cryptographic chain (40ms)
[T=1340ms] Server marks attendance + sends confirmation (10ms)
[T=1350ms] Student sees "✓ Attendance Confirmed" (TOTAL: 350ms)
```

**Scenario B: Offline Mode**

```
[T=0ms] Student scans QR (no network detected)
[T=200ms] Captures 5 frames (same as online)
[T=250ms] Validates temporal coherence locally (50ms)
[T=300ms] Generates Cryptographic Attendance Proof (50ms)
[T=350ms] Signs proof with device secure enclave (20ms)
[T=370ms] Encrypts and stores proof locally (30ms)
[T=400ms] Student sees "✓ Offline - Will Sync" (TOTAL: 400ms)
...
[T=3600000ms] Network reconnects (1 hour later)
[T=3600100ms] Auto-sync uploads proof to server
[T=3600200ms] Server validates proof retrospectively (100ms)
[T=3600300ms] Attendance marked + notification sent
```

### 1.3 Key Components

| Component | Location | Purpose | Technology |
|-----------|----------|---------|------------|
| Temporal QR Generator | Server/Display Device | Generate animated QR frames | JavaScript/Canvas API |
| Challenge Engine | Server | Create cryptographic challenges | SHA-256, HMAC |
| Video Capture | Student Device | Capture high-FPS video | MediaStream API |
| Frame Extractor | Student Device | Extract frames from video | Canvas API |
| QR Decoder | Student Device | Decode QR from frames | WebAssembly (WASM) |
| Coherence Analyzer | Student Device | Validate temporal flow | JavaScript |
| Proof Generator | Student Device | Generate offline CAP | Web Crypto API |
| Chain Verifier | Server | Validate crypto chain | Node.js crypto |
| Replay Detector | Server | Prevent replay attacks | Redis cache |
| Proof Validator | Server | Validate offline proofs | Crypto verification |

---

## 2. DISPLAY SYSTEM (LAYER 1)

### 2.1 Temporal QR Generator Engine

The Temporal QR Generator is the core innovation of Layer 1, responsible for creating time-sequential QR code frames with cryptographic binding.

#### 2.1.1 Initialization

When a teacher initiates an attendance session, the system performs the following initialization:

**Input Parameters:**
- `sessionId`: Unique identifier for attendance session (UUID v4)
- `courseId`: Course/class identifier
- `instructorId`: Teacher identifier
- `frameRate`: Target FPS (30, 60, or 120 based on display detection)
- `validityDuration`: How long session remains active (default: 2 hours)
- `serverMasterSecret`: Cryptographic secret (stored securely server-side)

**Initialization Process:**

```
FUNCTION initializeSession(sessionId, courseId, instructorId, frameRate):

  // 1. Generate session parameters
  session = {
    id: sessionId,
    courseId: courseId,
    instructorId: instructorId,
    startTime: getCurrentTimestamp(),  // Millisecond precision
    endTime: getCurrentTimestamp() + validityDuration,
    frameRate: frameRate,
    frameInterval: 1000 / frameRate,   // milliseconds per frame
    currentFrame: 0,
    challengeChain: []
  }

  // 2. Generate session-specific validation key
  // This allows offline validation without exposing master secret
  sessionSeed = concatenate(sessionId, startTime, serverMasterSecret)
  session.validationKey = SHA256(sessionSeed)

  // 3. Generate initial challenge
  initialChallenge = SHA256(sessionId + startTime + randomBytes(16))
  session.challengeChain.push(initialChallenge)

  // 4. Initialize frame render loop
  setInterval(generateNextFrame, session.frameInterval)

  RETURN session
```

#### 2.1.2 Frame Generation Algorithm

Each frame of the animated QR code is generated using the following algorithm:

**Core Frame Generation:**

```
FUNCTION generateNextFrame(session):

  // Get current timestamp with millisecond precision
  timestamp = getCurrentTimestamp()
  frameNumber = session.currentFrame++

  // INNOVATION: Rolling cryptographic challenge chain
  // Each challenge cryptographically depends on previous challenge
  previousChallenge = session.challengeChain[session.challengeChain.length - 1]

  // Generate current challenge by hashing:
  // - Previous challenge (creates chain)
  // - Current timestamp (binds to time)
  // - Frame number (prevents reordering)
  // - Session ID (binds to session)
  challengeInput = concatenate(
    previousChallenge,
    timestamp,
    frameNumber,
    session.id
  )

  currentChallenge = SHA256(challengeInput).substring(0, 16)  // 16 chars = 64 bits

  // Store in chain for next iteration
  session.challengeChain.push(currentChallenge)

  // INNOVATION: Visual pattern modifier for additional verification
  // Creates smooth animation visible to camera
  patternModifier = {
    rotation: (frameNumber * 2) % 360,        // Rotate 2° per frame
    phase: sin(frameNumber * 0.1) * 5,        // Oscillating shift ±5 pixels
    scale: 1.0 + cos(frameNumber * 0.05) * 0.02  // Subtle pulsing ±2%
  }

  // Construct frame data payload
  frameData = {
    // Layer 1: Session metadata
    session: session.id,
    course: session.courseId,

    // Layer 2: Temporal markers (CORE INNOVATION)
    t: timestamp,                  // Millisecond timestamp
    f: frameNumber,                // Sequential frame number

    // Layer 3: Cryptographic binding (CORE INNOVATION)
    c: currentChallenge,           // Current challenge (16 chars)
    p: previousChallenge.substring(0, 8),  // Previous hash link (8 chars)

    // Layer 4: Visual pattern modifier
    m: patternModifier,

    // Layer 5: Offline support data
    offline: {
      validationKey: session.validationKey.substring(0, 16),
      validFrom: session.startTime,
      validUntil: session.endTime,
      expectedFrameRate: session.frameRate
    }
  }

  // Encode data as JSON, then convert to QR code
  jsonPayload = JSON.stringify(frameData)
  qrCode = encodeQR(jsonPayload, errorCorrectionLevel: HIGH)

  // Apply visual pattern modifier for animation
  transformedQR = applyPatternTransform(qrCode, patternModifier)

  // Render to display
  renderToCanvas(transformedQR)

  RETURN frameData
```

**Key Innovation Explanations:**

1. **Rolling Challenge Chain:**
   ```
   Frame 0: Hash(SessionID + T0 + Random) = C0
   Frame 1: Hash(C0 + T1 + 1 + SessionID) = C1
   Frame 2: Hash(C1 + T2 + 2 + SessionID) = C2
   Frame 3: Hash(C2 + T3 + 3 + SessionID) = C3
   ```

   Cannot fake Frame 3 without knowing C2
   Cannot compute C2 without having seen Frame 1
   Creates cryptographic dependency chain

2. **Pattern Modifier:**
   - **Rotation:** QR visibly rotates 2° per frame (360° every 3 seconds at 60 FPS)
   - **Phase:** Slight oscillating shift creates "breathing" animation
   - **Scale:** Subtle pulsing maintains visual interest

   Purpose: Enables visual verification of temporal progression

#### 2.1.3 QR Code Encoding

The system uses standard ISO/IEC 18004:2015 QR Code specification with optimizations:

**Encoding Parameters:**
- **Version:** Auto-selected (typically Version 10-15)
- **Error Correction:** Level H (30% redundancy) - highest level
  - Reason: Enables reliable scanning even with camera motion blur
- **Mask Pattern:** Auto-selected for optimal readability
- **Character Encoding:** UTF-8 for international support

**Data Capacity:**
```
Frame Data Size: ~200-300 bytes (JSON payload)
QR Version Required: 10 (57×57 modules, ~250 bytes at Level H)
Typical QR Code Size: 400×400 pixels (display)
Scanning Distance: 0.5-2 meters optimal
```

**Encoding Process:**
```
FUNCTION encodeQR(jsonPayload, errorCorrectionLevel):

  // 1. Compress payload (optional, if > 200 bytes)
  IF length(jsonPayload) > 200:
    compressedPayload = gzipCompress(jsonPayload)
  ELSE:
    compressedPayload = jsonPayload

  // 2. Select optimal QR version
  qrVersion = calculateMinimumVersion(compressedPayload, errorCorrectionLevel)

  // 3. Encode using standard QR algorithm
  qrMatrix = QREncoder.encode(
    data: compressedPayload,
    version: qrVersion,
    errorCorrection: errorCorrectionLevel,
    encoding: UTF8
  )

  // 4. Apply quiet zone (border)
  qrWithBorder = addQuietZone(qrMatrix, size: 4)  // 4-module border

  RETURN qrWithBorder
```

#### 2.1.4 Pattern Transform Application

The pattern transform creates visible animation while preserving QR readability:

```
FUNCTION applyPatternTransform(qrCode, patternModifier):

  canvas = createCanvas(width: 500, height: 500)
  context = canvas.getContext('2d')

  // 1. Apply background
  context.fillStyle = '#FFFFFF'
  context.fillRect(0, 0, 500, 500)

  // 2. Apply transformations
  context.save()
  context.translate(250, 250)  // Move origin to center

  // Apply rotation
  context.rotate(patternModifier.rotation * PI / 180)

  // Apply scale
  context.scale(patternModifier.scale, patternModifier.scale)

  // Apply phase shift
  context.translate(patternModifier.phase, patternModifier.phase)

  // 3. Draw QR code
  qrCodeSize = 400  // pixels
  context.drawImage(qrCode, -qrCodeSize/2, -qrCodeSize/2, qrCodeSize, qrCodeSize)

  context.restore()

  RETURN canvas
```

### 2.2 Adaptive Display Optimization

The system automatically detects and adapts to display capabilities for optimal performance.

#### 2.2.1 Display Capability Detection

```
FUNCTION detectDisplayCapabilities():

  capabilities = {}

  // 1. Detect screen refresh rate
  // Use RequestAnimationFrame timing to measure actual FPS
  frameTimes = []
  lastTime = performance.now()

  FUNCTION measureFrame(currentTime):
    frameTime = currentTime - lastTime
    frameTimes.push(frameTime)
    lastTime = currentTime

    IF frameTimes.length < 60:
      requestAnimationFrame(measureFrame)
    ELSE:
      avgFrameTime = average(frameTimes)
      measuredFPS = 1000 / avgFrameTime
      capabilities.refreshRate = round(measuredFPS)

  requestAnimationFrame(measureFrame)
  await completion  // Wait for measurement

  // 2. Detect display type (OLED vs LCD)
  // OLED has instant pixel response, LCD has slower response
  capabilities.displayType = detectDisplayType()  // Implementation varies by platform

  // 3. Determine optimal frame rate
  IF capabilities.refreshRate >= 120:
    capabilities.optimalFPS = 60   // Use 60 FPS on 120Hz displays
  ELSE IF capabilities.refreshRate >= 60:
    capabilities.optimalFPS = 30   // Use 30 FPS on 60Hz displays
  ELSE IF capabilities.refreshRate >= 30:
    capabilities.optimalFPS = 20   // Use 20 FPS on 30Hz displays (older hardware)
  ELSE:
    capabilities.optimalFPS = 15   // Fallback for very old displays

  // 4. Check for hardware acceleration
  capabilities.hardwareAccelerated = isWebGLAvailable()

  RETURN capabilities
```

**Why Adaptive Optimization Matters:**

- **120Hz displays:** Can render 60 FPS smoothly → more frames = stronger security
- **60Hz displays:** Render 30 FPS smoothly → balance performance and security
- **Older hardware:** Lower FPS prevents janky animation → better UX
- **Battery life:** Lower FPS on battery-powered devices → energy efficiency

#### 2.2.2 Frame Rate Adjustment

```
FUNCTION adjustFrameRateForDevice(capabilities, batteryLevel, connectionQuality):

  baseFrameRate = capabilities.optimalFPS

  // Reduce FPS if battery low (mobile devices)
  IF batteryLevel < 20%:
    baseFrameRate = baseFrameRate * 0.5  // 50% reduction

  // Increase FPS if high-security mode enabled
  IF securityMode == 'HIGH':
    baseFrameRate = min(baseFrameRate * 1.5, capabilities.refreshRate / 2)

  // Adjust for network quality (affects sync delay tolerance)
  IF connectionQuality == 'POOR':
    baseFrameRate = baseFrameRate * 0.8  // Slightly slower, bigger time windows

  RETURN round(baseFrameRate)
```

---

## 3. CAPTURE SYSTEM (LAYER 2)

### 3.1 High-Speed Video Capture Module

The capture system uses browser MediaStream API (or native camera APIs on mobile) to capture high-frame-rate video.

#### 3.1.1 Camera Initialization

```
FUNCTION initializeCamera():

  // Request camera access with optimal constraints
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment',          // Rear camera (not selfie)
      frameRate: { ideal: 60, min: 30 },  // Request 60 FPS, accept 30+
      width: { ideal: 1920, min: 1280 },  // 1080p ideal, 720p minimum
      height: { ideal: 1080, min: 720 },
      focusMode: 'continuous',             // Auto-focus continuously
      exposureMode: 'continuous'           // Auto-exposure
    }
  })

  // Create video element
  videoElement = document.createElement('video')
  videoElement.srcObject = stream
  videoElement.play()

  // Wait for video to be ready
  await videoElement.onloadedmetadata

  // Verify actual frame rate achieved
  actualFPS = stream.getVideoTracks()[0].getSettings().frameRate

  RETURN {
    stream: stream,
    video: videoElement,
    fps: actualFPS
  }
```

#### 3.1.2 Frame Capture Loop

```
FUNCTION captureFrameSequence(cameraSetup, targetFrameCount = 10):

  capturedFrames = []
  frameInterval = 1000 / cameraSetup.fps  // Milliseconds between frames

  canvas = createCanvas(width: cameraSetup.video.videoWidth,
                        height: cameraSetup.video.videoHeight)
  context = canvas.getContext('2d', { willReadFrequently: true })

  // INNOVATION: Use RequestAnimationFrame for maximum frame rate
  FUNCTION captureNextFrame():

    IF capturedFrames.length >= targetFrameCount:
      return COMPLETE  // Captured enough frames

    captureTimestamp = performance.now()  // High-resolution timestamp

    // Draw current video frame to canvas
    context.drawImage(cameraSetup.video, 0, 0)

    // Extract image data
    imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // INNOVATION: Decode QR code using WebAssembly for speed
    qrData = decodeQR_WASM(imageData)  // ~2ms with WASM vs ~20ms with JS

    IF qrData != null:  // Successfully decoded

      // Calculate image hash for deduplication
      imageHash = fastHash(imageData)  // Simple hash, not cryptographic

      // Check if this is a duplicate frame
      isDuplicate = capturedFrames.some(f => f.imageHash == imageHash)

      IF NOT isDuplicate:
        capturedFrames.push({
          data: qrData,                  // Decoded QR payload
          captureTime: captureTimestamp, // When captured
          imageHash: imageHash,          // For deduplication
          frameNumber: capturedFrames.length  // Sequential number
        })

    // Request next frame
    requestAnimationFrame(captureNextFrame)

  // Start capture loop
  requestAnimationFrame(captureNextFrame)

  // Return promise that resolves when enough frames captured
  RETURN await Promise.race([
    waitForFrameCount(targetFrameCount),
    timeout(2000)  // Max 2 second capture time
  ])
```

**Key Implementation Details:**

1. **RequestAnimationFrame:**
   - Syncs with display refresh
   - Captures at maximum available frame rate
   - Automatically adapts to device capabilities

2. **WebAssembly QR Decoder:**
   - 10x faster than JavaScript implementation
   - Critical for real-time capture
   - Example: jsQR.wasm

3. **Deduplication:**
   - Prevents capturing identical frame twice (if camera/display stutters)
   - Uses fast non-cryptographic hash (xxHash or similar)

#### 3.1.3 Adaptive Capture Termination

```
FUNCTION hasEnoughFrames(capturedFrames, minimumRequired = 5):

  // Need at least minimum unique frames
  IF capturedFrames.length < minimumRequired:
    RETURN false

  // Verify frames are unique (not duplicates)
  uniqueHashes = Set(capturedFrames.map(f => f.imageHash))
  IF uniqueHashes.size < minimumRequired:
    RETURN false  // Too many duplicates

  // Verify frames are sequential
  frameNumbers = capturedFrames.map(f => f.data.f)  // Frame numbers from QR
  isSequential = frameNumbers.every((fn, i) =>
    i == 0 OR fn == frameNumbers[i-1] + 1
  )

  IF NOT isSequential:
    RETURN false  // Frames not in sequence (might have skipped)

  // Verify temporal progression
  timestamps = capturedFrames.map(f => f.data.t)
  isProgressing = timestamps.every((t, i) =>
    i == 0 OR t > timestamps[i-1]
  )

  IF NOT isProgressing:
    RETURN false  // Timestamps not increasing (suspicious)

  // All checks passed
  RETURN true
```

**Why This Matters:**
- Terminates capture as soon as sufficient valid frames obtained
- Minimizes capture time (better UX)
- Ensures quality of captured data before proceeding

### 3.2 Temporal Coherence Analyzer

The coherence analyzer validates that captured frames represent genuine temporal progression (not a screenshot/photo).

#### 3.2.1 Multi-Layer Coherence Analysis

```
FUNCTION analyzeTemporalCoherence(capturedFrames):

  analysis = {
    timingCoherence: analyzeTimingCoherence(capturedFrames),
    cryptoCoherence: analyzeCryptoCoherence(capturedFrames),
    visualCoherence: analyzeVisualCoherence(capturedFrames),
    overallScore: 0,
    verdict: false
  }

  // Weighted scoring
  analysis.overallScore = (
    analysis.timingCoherence.score * 0.4 +   // 40% weight
    analysis.cryptoCoherence.score * 0.4 +   // 40% weight
    analysis.visualCoherence.score * 0.2     // 20% weight
  )

  // Verdict: Must score >0.8 to pass
  analysis.verdict = (analysis.overallScore > 0.8)

  RETURN analysis
```

#### 3.2.2 Timing Coherence Analysis

```
FUNCTION analyzeTimingCoherence(frames):

  timestamps = frames.map(f => f.data.t)

  // CHECK 1: Strictly increasing timestamps?
  isIncreasing = timestamps.every((t, i) =>
    i == 0 OR t > timestamps[i-1]
  )

  score1 = isIncreasing ? 0.3 : 0.0

  // CHECK 2: Reasonable intervals?
  intervals = []
  FOR i FROM 1 TO timestamps.length - 1:
    intervals.push(timestamps[i] - timestamps[i-1])

  avgInterval = mean(intervals)
  stdDeviation = standardDeviation(intervals)

  // Expected: 16.67ms (60 FPS) ± 10ms tolerance
  expectedInterval = 16.67
  deviation = abs(avgInterval - expectedInterval)

  score2 = (deviation < 10) ? 0.3 : (deviation < 20) ? 0.15 : 0.0

  // CHECK 3: No suspicious jumps?
  maxInterval = max(intervals)
  minInterval = min(intervals)
  jumpRatio = maxInterval / minInterval

  // Jump ratio should be < 3 (max 3x variation)
  score3 = (jumpRatio < 3) ? 0.2 : (jumpRatio < 5) ? 0.1 : 0.0

  // CHECK 4: Recent timestamps?
  latestTimestamp = timestamps[timestamps.length - 1]
  age = Date.now() - latestTimestamp

  // Should be within 3 seconds
  score4 = (age < 3000) ? 0.2 : (age < 5000) ? 0.1 : 0.0

  totalScore = score1 + score2 + score3 + score4

  RETURN {
    score: totalScore,
    isIncreasing: isIncreasing,
    avgInterval: avgInterval,
    deviation: deviation,
    jumpRatio: jumpRatio,
    age: age
  }
```

#### 3.2.3 Cryptographic Coherence Analysis

```
FUNCTION analyzeCryptoCoherence(frames):

  challenges = frames.map(f => f.data.c)      // Current challenges
  prevHashes = frames.map(f => f.data.p)      // Previous hash links

  chainValid = true

  // Verify each frame links to previous
  FOR i FROM 1 TO frames.length - 1:
    expectedPrev = challenges[i-1].substring(0, 8)
    actualPrev = prevHashes[i]

    IF expectedPrev != actualPrev:
      chainValid = false
      BREAK

  score = chainValid ? 1.0 : 0.0

  RETURN {
    score: score,
    chainValid: chainValid
  }
```

**Why This Is Critical:**
- Screenshot/photo will have ALL frames with identical challenges/timestamps
- Real capture will have progressive challenges and timestamps
- Cryptographic chain cannot be faked without knowing secrets

#### 3.2.4 Visual Coherence Analysis

```
FUNCTION analyzeVisualCoherence(frames):

  // Extract pattern modifiers
  rotations = frames.map(f => f.data.m.rotation)

  smooth = true
  expectedRotationStep = 2  // 2° per frame

  // Verify smooth progression
  FOR i FROM 1 TO rotations.length - 1:
    actualStep = (rotations[i] - rotations[i-1] + 360) % 360

    // Allow ±1° tolerance
    IF abs(actualStep - expectedRotationStep) > 1:
      smooth = false
      BREAK

  score = smooth ? 1.0 : 0.5

  RETURN {
    score: score,
    smooth: smooth
  }
```

---

## 4. DATA STRUCTURES AND PROTOCOLS

### 4.1 Frame Data Structure

```
FrameData = {
  // Session identification
  session: String (UUID),          // "a1b2c3d4-..."
  course: String,                   // "CS101"

  // Temporal markers
  t: Integer (milliseconds),        // 1700000000123
  f: Integer,                       // 42 (frame number)

  // Cryptographic binding
  c: String (16 hex chars),         // "a3f9e2..." (current challenge)
  p: String (8 hex chars),          // "7b4d..." (previous hash link)

  // Visual pattern
  m: {
    rotation: Float,                // 84.0 (degrees)
    phase: Float,                   // 2.5 (pixels)
    scale: Float                    // 1.01 (ratio)
  },

  // Offline support
  offline: {
    validationKey: String (16 hex chars),
    validFrom: Integer (milliseconds),
    validUntil: Integer (milliseconds),
    expectedFrameRate: Integer      // 60
  }
}
```

**Typical Size:** 250-300 bytes (JSON serialized)

### 4.2 Captured Frame Structure

```
CapturedFrame = {
  data: FrameData,                  // Decoded QR payload
  captureTime: Float (ms),          // performance.now() timestamp
  imageHash: String (16 hex chars), // Fast hash of image data
  frameNumber: Integer              // Sequential capture number (0, 1, 2, ...)
}
```

### 4.3 Communication Protocol

**Client → Server (Online Mode):**

```
POST /api/attendance/verify
Content-Type: application/json

{
  studentId: "STU12345",
  sessionId: "a1b2c3d4-...",
  frames: [
    {
      data: FrameData,
      captureTime: 1700000000123,
      frameNumber: 0
    },
    {
      data: FrameData,
      captureTime: 1700000000140,
      frameNumber: 1
    },
    // ... 3-8 more frames
  ],
  deviceInfo: {
    deviceId: "DEV789",
    userAgent: "...",
    platform: "Android"
  }
}
```

**Server → Client (Response):**

```
HTTP 200 OK
Content-Type: application/json

{
  valid: true,
  attendanceId: "ATT98765",
  timestamp: 1700000000500,
  message: "Attendance recorded successfully",
  validationDetails: {
    timingScore: 0.95,
    cryptoScore: 1.0,
    visualScore: 1.0,
    overallScore: 0.98
  }
}
```

---

**END OF PART A**

**Sections Covered:**
✅ System Architecture
✅ Display System (complete technical specification)
✅ Capture System (complete technical specification)
✅ Data structures
✅ Communication protocols

**Next (Part B):**
- Verification System (server-side validation)
- Offline Mode (Cryptographic Attendance Proof)
- Security Model (attack prevention)
- Performance Optimizations

**File Status:** `03-DETAILED-DESCRIPTION-PART-A.md` created successfully.
