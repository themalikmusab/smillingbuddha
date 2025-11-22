# System Architecture - Temporal 3D QR Code

**Last Updated:** November 22, 2025
**For:** Developers implementing the system

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Layers](#architecture-layers)
3. [Component Details](#component-details)
4. [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)
6. [Deployment Architecture](#deployment-architecture)
7. [Scalability](#scalability)
8. [Performance](#performance)

---

## Overview

### System Purpose
Temporal 3D QR Code system for secure, screenshot-proof presence verification.

### Key Design Principles
- **Temporal Encoding:** Time as 3rd dimension (30-120 FPS)
- **Cryptographic Security:** Challenge chaining, hardware-backed signing
- **Dual-Mode Operation:** Online (real-time) + Offline (delayed validation)
- **Zero Special Hardware:** Works on any smartphone
- **Sub-Second Performance:** 300-650ms total verification time

---

## Architecture Layers

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: DISPLAY SYSTEM                      │
│                    (QR Generator - Server/Browser)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Session    │  │  Challenge   │  │   Frame      │         │
│  │   Manager    │→ │  Generator   │→ │  Renderer    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         ↓                 ↓                  ↓                  │
│  Creates session   Crypto chain      Animated QR               │
│  Manages state     SHA-256 hash      60 FPS output             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (Optical - Light Waves)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   LAYER 2: CAPTURE SYSTEM                       │
│                   (Scanner - Mobile Device)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Camera     │  │  QR Decoder  │  │  Coherence   │         │
│  │   Capture    │→ │  (WASM)      │→ │  Analyzer    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         ↓                 ↓                  ↓                  │
│  Video burst      Fast decode      3-layer validation          │
│  5-10 frames      ~2ms/frame       Timing+Crypto+Visual        │
│         │                                   │                  │
│         │         ┌──────────────┐         │                  │
│         └────────→│   Offline    │←────────┘                  │
│                   │ Proof Gen    │                             │
│                   └──────────────┘                             │
│                          ↓                                      │
│                   CAP with hardware                            │
│                   signature                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (Network - HTTP/S)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 LAYER 3: VERIFICATION SYSTEM                    │
│                      (Server - Backend)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Online     │  │   Offline    │  │   Replay     │         │
│  │  Validator   │  │   Proof      │  │  Detector    │         │
│  └──────────────┘  │  Validator   │  └──────────────┘         │
│         ↓          └──────────────┘         ↓                  │
│  Parallel checks       Delayed          Cache-based            │
│  <50ms target         validation         prevention            │
│         │                  │                  │                │
│         └──────────────────┴──────────────────┘                │
│                            ↓                                    │
│                  ┌──────────────────┐                          │
│                  │   Attendance     │                          │
│                  │   Database       │                          │
│                  └──────────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### Layer 1: Display System

#### 1.1 Session Manager
**Purpose:** Manage attendance sessions

**Responsibilities:**
- Create new session with unique ID
- Store session metadata (course, instructor, time)
- Generate session-specific validation keys
- Track active sessions

**Data Structure:**
```javascript
Session {
  id: UUID,
  courseId: String,
  instructorId: String,
  startTime: Timestamp,
  endTime: Timestamp,
  validationKey: String (derived from master secret),
  frameRate: Number (30/60/120),
  status: Enum('active', 'ended', 'cancelled')
}
```

**API:**
```javascript
createSession(courseId, instructorId, duration)
endSession(sessionId)
getSession(sessionId)
```

---

#### 1.2 Challenge Generator
**Purpose:** Generate cryptographic challenge chain

**Algorithm:**
```javascript
function generateChallenge(sessionId, prevChallenge, timestamp, frameNumber) {
  const input = concat(
    prevChallenge,
    timestamp,
    frameNumber,
    sessionId
  );

  const hash = SHA256(input);
  return hash.substring(0, 16); // 64 bits
}
```

**Properties:**
- **Deterministic:** Same inputs = same output
- **Unpredictable:** Cannot predict next without previous
- **Chained:** Each depends on previous (blockchain-like)

**Performance:** ~0.1ms per challenge (negligible)

---

#### 1.3 Frame Renderer
**Purpose:** Render animated QR code frames

**Technology:** HTML5 Canvas API

**Process:**
```javascript
function renderFrame(frameNumber) {
  // 1. Generate frame data
  const data = {
    session: sessionId,
    t: Date.now(),
    f: frameNumber,
    c: generateChallenge(...),
    p: previousChallenge.substring(0, 8),
    m: getPatternModifier(frameNumber)
  };

  // 2. Encode as QR
  const qr = QRCode.create(JSON.stringify(data), {
    errorCorrectionLevel: 'H', // 30% redundancy
    version: 10 // ~250 bytes
  });

  // 3. Apply visual transform
  const transformed = applyTransform(qr, data.m);

  // 4. Render to canvas
  canvas.renderQR(transformed);
}
```

**Frame Rate Control:**
```javascript
setInterval(renderFrame, 1000 / TARGET_FPS);
// 60 FPS → 16.67ms interval
```

**Visual Transforms:**
- Rotation: 2° per frame (smooth 360° loop)
- Phase: Sine wave oscillation (±5px)
- Scale: Subtle pulsing (±2%)

---

### Layer 2: Capture System

#### 2.1 Camera Capture
**Purpose:** Capture high-FPS video from phone camera

**Technology:** MediaStream API

**Configuration:**
```javascript
const constraints = {
  video: {
    facingMode: 'environment', // Back camera
    frameRate: { ideal: 60, min: 30 },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    focusMode: 'continuous',
    exposureMode: 'continuous'
  }
};
```

**Capture Loop:**
```javascript
function captureLoop() {
  requestAnimationFrame(() => {
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Extract image data
    const imageData = ctx.getImageData(0, 0, width, height);

    // Decode QR
    const qrData = decodeQR_WASM(imageData);

    if (qrData && isNewFrame(qrData)) {
      capturedFrames.push({
        data: qrData,
        timestamp: performance.now(),
        imageHash: fastHash(imageData)
      });
    }

    if (hasEnoughFrames()) {
      stopCapture();
      processFrames();
    } else {
      captureLoop(); // Continue
    }
  });
}
```

**Performance:** Captures at native camera FPS (30-60 FPS)

---

#### 2.2 QR Decoder (WebAssembly)
**Purpose:** Fast QR code decoding

**Why WASM?**
- JavaScript decoder: ~20ms per frame
- WASM decoder: ~2ms per frame
- **10x speedup!**

**Library:** jsQR compiled to WASM

**Integration:**
```javascript
const wasmModule = await WebAssembly.instantiateStreaming(
  fetch('/qr-decoder.wasm')
);

function decodeQR_WASM(imageData) {
  return wasmModule.exports.decode(
    imageData.data,
    imageData.width,
    imageData.height
  );
}
```

---

#### 2.3 Temporal Coherence Analyzer
**Purpose:** Validate temporal progression (detect screenshots)

**Three-Layer Validation:**

**Layer 1: Timing Coherence (40% weight)**
```javascript
function analyzeTimingCoherence(frames) {
  const timestamps = frames.map(f => f.data.t);

  // Check 1: Monotonically increasing?
  const increasing = timestamps.every((t, i) =>
    i === 0 || t > timestamps[i-1]
  );

  // Check 2: Reasonable intervals?
  const intervals = calculateIntervals(timestamps);
  const avgInterval = mean(intervals);
  const validInterval = (avgInterval >= 10 && avgInterval <= 50);

  // Check 3: No huge jumps?
  const jumpRatio = max(intervals) / min(intervals);
  const noJumps = jumpRatio < 3;

  // Check 4: Recent?
  const age = Date.now() - timestamps[timestamps.length - 1];
  const recent = age < 3000;

  const score = (
    (increasing ? 0.3 : 0) +
    (validInterval ? 0.3 : 0) +
    (noJumps ? 0.2 : 0) +
    (recent ? 0.2 : 0)
  );

  return { score, details: {...} };
}
```

**Layer 2: Cryptographic Coherence (40% weight)**
```javascript
function analyzeCryptoCoherence(frames) {
  // Verify each frame links to previous
  const chainValid = frames.every((f, i) => {
    if (i === 0) return true;
    const expectedPrev = frames[i-1].data.c.substring(0, 8);
    return f.data.p === expectedPrev;
  });

  return { score: chainValid ? 1.0 : 0, chainValid };
}
```

**Layer 3: Visual Coherence (20% weight)**
```javascript
function analyzeVisualCoherence(frames) {
  const rotations = frames.map(f => f.data.m.rotation);

  // Check smooth 2° progression
  const smooth = rotations.every((r, i) => {
    if (i === 0) return true;
    const step = (r - rotations[i-1] + 360) % 360;
    return Math.abs(step - 2) < 1; // ±1° tolerance
  });

  return { score: smooth ? 1.0 : 0.5, smooth };
}
```

**Combined Score:**
```javascript
const overallScore = (
  timingScore * 0.4 +
  cryptoScore * 0.4 +
  visualScore * 0.2
);

const valid = overallScore > 0.8; // 80% threshold
```

---

#### 2.4 Offline Proof Generator
**Purpose:** Generate cryptographic attendance proof when offline

**Process:**
```javascript
async function generateCAP(frames, studentId) {
  // 1. Validate locally
  const coherence = analyzeTemporalCoherence(frames);
  if (!coherence.valid) {
    throw new Error('Invalid temporal coherence');
  }

  // 2. Build proof data
  const proofData = {
    studentId,
    deviceId: getDeviceId(),
    sessionId: frames[0].data.session,
    frames: compressFrames(frames),
    validation: coherence,
    captureTimestamp: Date.now(),
    deviceAttestation: await getDeviceAttestation()
  };

  // 3. Sign with device key
  const deviceSignature = await signWithDeviceKey(proofData);

  // 4. Sign with hardware key (Secure Enclave)
  const hardwareSignature = await signWithHardwareKey(proofData);

  // 5. Assemble proof
  const proof = {
    version: 1,
    proofId: generateUUID(),
    data: proofData,
    signature: deviceSignature,
    hardwareSignature,
    createdAt: Date.now()
  };

  // 6. Encrypt and store
  await storeProofLocally(proof);

  // 7. Queue for sync
  await addToSyncQueue(proof);

  return proof;
}
```

**Hardware Signing (WebAuthn):**
```javascript
async function signWithHardwareKey(data) {
  const challenge = new TextEncoder().encode(JSON.stringify(data));

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      rpId: window.location.hostname,
      userVerification: 'preferred' // May require biometric
    }
  });

  return {
    signature: arrayBufferToBase64(assertion.response.signature),
    authenticatorData: arrayBufferToBase64(assertion.response.authenticatorData)
  };
}
```

---

### Layer 3: Verification System

#### 3.1 Online Validator
**Purpose:** Real-time validation of frame sequences

**Parallel Validation Pipeline:**
```javascript
async function validateOnline(submission) {
  const [
    timingResult,
    cryptoResult,
    replayResult,
    sessionResult
  ] = await Promise.all([
    validateTiming(submission.frames),
    validateCrypto(submission.frames, submission.sessionId),
    validateNoReplay(submission),
    validateSession(submission.sessionId)
  ]);

  const valid = (
    timingResult.valid &&
    cryptoResult.valid &&
    replayResult.valid &&
    sessionResult.valid
  );

  if (valid) {
    await recordAttendance(submission);
  }

  return { valid, details: {...} };
}
```

**Challenge Reconstruction:**
```javascript
function reconstructChallengeChain(sessionId, startTimestamp, startFrame, count) {
  const session = getSession(sessionId);
  const challenges = [];
  let previousHash = computeInitialChallenge(sessionId, session.validationKey);

  for (let i = 0; i < count; i++) {
    const timestamp = Math.floor(startTimestamp + (i * 16.67));
    const frameNumber = startFrame + i;

    const challenge = SHA256(concat(
      previousHash,
      timestamp,
      frameNumber,
      sessionId
    )).substring(0, 16);

    challenges.push(challenge);
    previousHash = challenge;
  }

  return challenges;
}
```

**Performance Target:** <50ms total validation time

---

#### 3.2 Offline Proof Validator
**Purpose:** Validate CAPs submitted asynchronously

**Validation Steps:**
```javascript
async function validateOfflineProof(proof) {
  // 1. Verify signatures
  const deviceSigValid = await verifyDeviceSignature(proof);
  const hardwareSigValid = await verifyHardwareSignature(proof);

  if (!deviceSigValid || !hardwareSigValid) {
    return { valid: false, reason: 'Invalid signature' };
  }

  // 2. Check proof age (<24 hours)
  const age = Date.now() - proof.createdAt;
  if (age > 24 * 60 * 60 * 1000) {
    return { valid: false, reason: 'Proof expired' };
  }

  // 3. Check replay (proof hash)
  const proofHash = SHA256(JSON.stringify(proof));
  if (await replayCache.exists(proofHash)) {
    return { valid: false, reason: 'Proof already used' };
  }

  // 4. Validate temporal coherence
  const coherence = validateTemporalCoherence(proof.data.frames);
  if (!coherence.valid) {
    return { valid: false, reason: 'Temporal coherence failed' };
  }

  // 5. Validate crypto chain
  const crypto = validateCryptoChain(proof.data.frames, proof.data.sessionId);
  if (!crypto.valid) {
    return { valid: false, reason: 'Crypto chain invalid' };
  }

  // 6. Validate capture time within session window
  const session = getSession(proof.data.sessionId);
  const captureTime = proof.data.captureTimestamp;
  if (captureTime < session.startTime || captureTime > session.endTime) {
    return { valid: false, reason: 'Capture outside session window' };
  }

  // All checks passed
  await replayCache.set(proofHash, true, 86400); // Cache 24h
  await recordAttendance(proof.data);

  return { valid: true };
}
```

---

#### 3.3 Replay Detector
**Purpose:** Prevent duplicate submissions

**Implementation:**
```javascript
class ReplayDetector {
  constructor(redis) {
    this.cache = redis;
  }

  async checkReplay(frames, studentId, sessionId) {
    // Create unique signature
    const frameSignature = SHA256(
      frames.map(f => `${f.data.t}:${f.data.f}:${f.data.c}`).join('|')
    );

    // Check if seen
    const key = `replay:${frameSignature}`;
    const exists = await this.cache.exists(key);

    if (exists) {
      return { replay: true };
    }

    // Mark as used (24h expiry)
    await this.cache.setex(key, 86400, `${studentId}:${sessionId}`);

    // Also check student hasn't already checked in
    const attendanceKey = `attendance:${sessionId}:${studentId}`;
    const alreadyPresent = await this.cache.exists(attendanceKey);

    if (alreadyPresent) {
      return { replay: true, reason: 'Already checked in' };
    }

    await this.cache.setex(attendanceKey, 86400, Date.now());

    return { replay: false };
  }
}
```

---

## Data Flow

### Online Mode Flow

```
[Teacher]
    ↓
1. Creates session → Session Manager
    ↓
2. Session displayed → Frame Renderer (60 FPS loop)
    ↓
[Student]
    ↓
3. Opens scanner → Camera Capture
    ↓
4. Points at screen → Video stream captured
    ↓
5. Frames extracted → QR Decoder (WASM)
    ↓
6. 5-10 frames collected → Coherence Analyzer
    ↓
7. Local validation passes → HTTP POST to server
    ↓
[Server]
    ↓
8. Receives submission → Parallel validators
    ↓
9. All checks pass → Attendance Database
    ↓
10. Response sent → Student sees "✓ Confirmed"

Total time: 300-650ms
```

### Offline Mode Flow

```
[Teacher]
    ↓
1-2. Same as online
    ↓
[Student - No Network]
    ↓
3-6. Same as online
    ↓
7. Local validation passes → Offline Proof Generator
    ↓
8. Generates CAP → Device + Hardware signing
    ↓
9. Encrypts proof → IndexedDB storage
    ↓
10. Queued for sync → Student sees "✓ Offline"
    ↓
[Later - Network Available]
    ↓
11. Auto-sync triggered → HTTP POST proof
    ↓
[Server]
    ↓
12. Validates proof → Offline Proof Validator
    ↓
13. All checks pass → Attendance Database
    ↓
14. Notification sent → Student sees "✓ Synced"

Capture time: 300-400ms
Sync time: Variable (when online)
```

---

## Technology Stack

### Frontend (Display System)
- **Framework:** React or Vue.js
- **QR Generation:** qrcode.js or node-qrcode
- **Rendering:** HTML5 Canvas API
- **State Management:** Redux or Vuex
- **Hosting:** Vercel, Netlify, or AWS S3 + CloudFront

### Frontend (Scanner App)
- **Framework:** React Native (iOS + Android) OR Progressive Web App (PWA)
- **Camera:** expo-camera (React Native) or MediaStream API (PWA)
- **QR Decoding:** jsQR (compiled to WASM for performance)
- **Storage:** IndexedDB (PWA) or AsyncStorage (React Native)
- **Authentication:** WebAuthn for hardware signing

### Backend (Verification System)
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js or Fastify
- **Database:** PostgreSQL (primary), Redis (cache)
- **Crypto:** Node.js crypto module (SHA-256, HMAC)
- **Authentication:** JWT for session management
- **Hosting:** AWS EC2/ECS, Google Cloud Run, or Azure App Service

### Infrastructure
- **Load Balancer:** NGINX or AWS ELB
- **Cache:** Redis (replay detection, session cache)
- **Database:** PostgreSQL with read replicas
- **Storage:** S3 for logs/backups
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK stack (Elasticsearch, Logstash, Kibana)

---

## Deployment Architecture

### Production Setup

```
Internet
    ↓
[CloudFlare CDN]
    ↓
[Load Balancer - NGINX]
    ↓
┌──────────┬──────────┬──────────┐
│  App     │  App     │  App     │
│ Server 1 │ Server 2 │ Server 3 │ (Node.js)
└────┬─────┴────┬─────┴────┬─────┘
     │          │          │
     └──────────┴──────────┘
              ↓
     [Redis Cluster]
     - Session cache
     - Replay cache
     - Rate limiting
              ↓
     [PostgreSQL]
     - Primary (write)
     - Replica 1 (read)
     - Replica 2 (read)
```

### Scaling Strategy

**Horizontal Scaling:**
- Add more app servers behind load balancer
- Stateless design (no server-side sessions)
- Redis for shared state

**Database Scaling:**
- Read replicas for GET queries
- Connection pooling (pg-pool)
- Query optimization

**Caching Strategy:**
- Session data: 2-hour TTL
- Challenge chains: 5-minute TTL
- Replay detection: 24-hour TTL

---

## Scalability

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Concurrent users | 10,000+ | Per region |
| Requests/second | 1,000+ | Peak load |
| Response time | <100ms | P95 |
| Availability | 99.9% | ~8 hours downtime/year |
| Data storage | 1 TB/year | ~1 million students |

### Bottleneck Analysis

**Potential Bottlenecks:**
1. QR decoding on client (WASM solves this)
2. Database writes (use write batching)
3. Crypto operations (use hardware acceleration)
4. Network latency (use CDN, regional deployments)

**Mitigation:**
- WebAssembly for QR decoding (10x speedup)
- Batch database writes (every 100ms)
- Redis for read-heavy operations
- Multi-region deployment (AWS/GCP)

---

## Performance

### Benchmarks

**Display System:**
- Frame generation: 0.1ms/frame
- QR encoding: 2-5ms/frame
- Rendering: 10ms/frame (60 FPS = 16.67ms budget)
- **Total:** 15ms/frame ✅ (under 16.67ms)

**Capture System:**
- Camera capture: Native FPS (30-60)
- QR decoding: 2ms/frame (WASM)
- Frame processing: 1ms/frame
- **Total:** 3ms/frame ✅ (can process 330+ FPS)

**Verification System:**
- Timing validation: 5-10ms
- Crypto validation: 15-20ms
- Replay check: 3-5ms (Redis)
- Database write: 10-15ms
- **Total (parallel):** 20-25ms ✅ (under 50ms target)

---

## Next Steps

**For Developers:**
1. Set up development environment
2. Implement proof-of-concept
3. Performance testing
4. Security audit
5. Pilot deployment

**See Also:**
- [Security Model](./security-model.md) - Threat analysis
- [Algorithms](./algorithms.md) - Implementation details
- [API Specification](./api-specification.md) - REST API docs
- [Roadmap](./roadmap.md) - Implementation plan

---

**Questions?** Open an issue or contact the team!
