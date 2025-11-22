# TECHNICAL DIAGRAMS FOR PATENT APPLICATION

**Application for:** Temporal Three-Dimensional QR Code System for Presence Verification
**Inventor:** Mus Ab Ali
**Date:** November 22, 2025

---

## IMPORTANT NOTE

This file contains detailed descriptions of all technical diagrams required for the patent application. These descriptions can be used by a technical illustrator or patent agent to create formal diagrams.

**For provisional patent filing:** Descriptions are sufficient (formal drawings not required).

**For complete patent filing:** Professional diagrams should be created based on these descriptions.

---

## FIGURE 1: System Architecture Overview

**Title:** Three-Layer Architecture for Temporal QR Code Authentication System

**Description:**
This diagram shows the complete system architecture with three main layers:

**Layer 1 - Display System (Top):**
- Rectangle labeled "Display Device (Teacher's Screen/Projector)"
- Inside: "Temporal QR Generator" component
- Shows animated QR code (3-4 frames in sequence)
- Arrow indicating "60 FPS" frame rate
- Labels showing: "Frame 0 (t=0ms)", "Frame 1 (t=16ms)", "Frame 2 (t=33ms)"

**Layer 2 - Capture System (Middle):**
- Rectangle labeled "Mobile Device (Student's Smartphone)"
- Shows phone icon with camera
- Components inside:
  - "Video Capture Module"
  - "QR Decoder"
  - "Temporal Coherence Analyzer"
  - "Offline Mode: Proof Generator"
- Two paths indicated:
  - Path A: "Online" → network arrow
  - Path B: "Offline" → local storage icon

**Layer 3 - Verification System (Bottom):**
- Rectangle labeled "Validation Server"
- Components inside:
  - "Online Validator" (left side)
  - "Offline Proof Validator" (right side)
  - "Attendance Database" (bottom)
- Shows "✓ Valid" or "✗ Invalid" output

**Arrows:**
- Optical transmission (light waves) from Layer 1 to Layer 2
- Network transmission (HTTP) from Layer 2 to Layer 3
- Dashed line for offline sync path

**Legend:**
- Solid arrows = Online mode
- Dashed arrows = Offline mode
- Light waves = Optical capture
- Network waves = Data transmission

---

## FIGURE 2: Temporal Frame Sequence

**Title:** Sequential QR Code Frames with Cryptographic Chaining

**Description:**
Shows 5 QR code frames in sequence (left to right) with time progression:

**Frame 0 (t=0ms):**
- QR code image
- Data box below showing:
  ```
  Frame: 0
  Time: 1700000000000
  Challenge: a3f9e287bc4d15ea
  Prev: 0 (initial)
  ```

**Frame 1 (t=17ms):**
- QR code image (slightly rotated)
- Data box below showing:
  ```
  Frame: 1
  Time: 1700000000017
  Challenge: 7b3d82f1a9c5e046
  Prev: a3f9e287 ← links to Frame 0
  ```

**Frame 2 (t=33ms):**
- QR code image (more rotated)
- Data box below showing:
  ```
  Frame: 2
  Time: 1700000000033
  Challenge: 2c8f91d3b7e4a625
  Prev: 7b3d82f1 ← links to Frame 1
  ```

**Frame 3 (t=50ms):**
- QR code image
- Data box

**Frame 4 (t=67ms):**
- QR code image
- Data box

**Visual Elements:**
- Arrows connecting "Prev" of each frame to "Challenge" of previous frame
- Large arrow at bottom showing "TIME →"
- Label: "Cryptographic Chain: Each frame links to previous"
- Note: "Screenshot captures only ONE frame → chain broken → INVALID"

---

## FIGURE 3: Cryptographic Challenge Chain

**Title:** Rolling Hash Chain Mechanism

**Description:**
Flowchart showing challenge generation:

**Top (Initial State):**
```
[Session ID] + [Start Time] + [Random]
         ↓
    SHA-256 Hash
         ↓
  [Challenge 0: C0]
```

**Repeating Section (for each frame):**
```
[Previous Challenge: C(n-1)] + [Timestamp] + [Frame #] + [Session ID]
         ↓
    SHA-256 Hash
         ↓
  [Current Challenge: Cn]
         ↓
  Store in QR Frame n
         ↓
  Becomes "Previous" for Frame n+1
```

**Bottom:**
Shows chain: C0 → C1 → C2 → C3 → C4 → ...

**Annotations:**
- "Cannot predict Cn without knowing C(n-1)"
- "Cannot forge chain without server secret"
- "Break anywhere = detectable"

---

## FIGURE 4: Online Verification Flow

**Title:** Real-Time Attendance Verification Process

**Description:**
Swimlane diagram with 3 columns (Student, Network, Server):

**Student Lane:**
1. "Open attendance app"
2. "Point camera at screen"
3. "Capture 5-10 frames" (200-300ms)
4. "Local validation"
5. "Send to server"
6. Wait...
7. "✓ Attendance confirmed!"

**Network Lane:**
- Arrow from Student to Server: "HTTP POST /api/verify"
- Shows data: "frames[], studentId, deviceInfo"
- Arrow back: "HTTP 200 OK"
- Shows response: "{valid: true}"

**Server Lane:**
1. "Receive submission"
2. "Parallel validation:" (shows 5 parallel boxes)
   - "Timing ✓"
   - "Crypto ✓"
   - "Replay ✓"
   - "Session ✓"
   - "Student ✓"
3. "All checks pass?"
4. "Record attendance"
5. "Send confirmation"

**Timeline:**
Shows timing annotations:
- Capture: 200-300ms
- Network: 50-150ms
- Validation: 20-50ms
- Total: 350-650ms

---

## FIGURE 5: Offline Capture Flow

**Title:** Offline Mode with Cryptographic Attendance Proof Generation

**Description:**
Flowchart showing offline process:

**Start:**
```
[Student opens app]
      ↓
[Check network?]
   ↙ No      ↘ Yes
Offline    Online (see Fig 4)
   ↓
[Capture frames]
   ↓
[Validate locally]
   ↓
[Generate CAP]
```

**CAP Generation (expanded):**
```
┌────────────────────────────────┐
│ Cryptographic Attendance Proof │
├────────────────────────────────┤
│ • Student ID                   │
│ • Device ID                    │
│ • Session ID                   │
│ • Captured frames (compressed) │
│ • Local validation results     │
│ • Timestamp                    │
│ • Device attestation           │
├────────────────────────────────┤
│ Sign with device key ────→ Signature 1 │
│ Sign with hardware key ──→ Signature 2 │
└────────────────────────────────┘
      ↓
[Encrypt with device key]
      ↓
[Store locally in IndexedDB]
      ↓
[Add to sync queue]
      ↓
[Show "✓ Offline - Will sync"]
```

**Later (when online):**
```
[Network detected]
      ↓
[Auto-sync from queue]
      ↓
[Upload CAP to server]
      ↓
[Server validates CAP]
      ↓
[Attendance recorded]
      ↓
[Notification sent]
```

---

## FIGURE 6: Cryptographic Attendance Proof Structure

**Title:** CAP Data Structure and Signing

**Description:**
Nested box diagram showing proof structure:

**Outer Box: "Encrypted CAP"**
```
┌─────────────────────────────────────────┐
│         AES-256-GCM Encrypted           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     Cryptographic Attendance      │ │
│  │          Proof (CAP)              │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │     Proof Data              │ │ │
│  │  │  • Student ID               │ │ │
│  │  │  • Device ID                │ │ │
│  │  │  • Session ID               │ │ │
│  │  │  • Frames[] (compressed)    │ │ │
│  │  │  • Validation results       │ │ │
│  │  │  • Timestamps               │ │ │
│  │  │  • Device attestation       │ │ │
│  │  └─────────────────────────────┘ │ │
│  │           ↓                       │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │  Device Signature (HMAC)    │ │ │
│  │  │  SHA-256 of Proof Data      │ │ │
│  │  └─────────────────────────────┘ │ │
│  │           ↓                       │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │  Hardware Signature         │ │ │
│  │  │  (WebAuthn/Secure Enclave)  │ │ │
│  │  │  Non-exportable key         │ │ │
│  │  └─────────────────────────────┘ │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Annotations:**
- "Tampering breaks signatures"
- "Encryption key tied to device"
- "Hardware signature = proof of device possession"

---

## FIGURE 7: Server Validation Pipeline

**Title:** Parallel Multi-Factor Validation Architecture

**Description:**
Diagram showing parallel validation:

**Input:**
```
[Submission Received]
      ↓
   [Fan Out]
   ↙↙↙ ↓ ↘↘↘
```

**Five Parallel Validators:**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Timing   │  │ Crypto   │  │ Replay   │  │ Session  │  │ Student  │
│Validator │  │Validator │  │ Detector │  │Validator │  │Validator │
│          │  │          │  │          │  │          │  │          │
│• T↑?     │  │• Chain✓? │  │• Seen?   │  │• Valid?  │  │• Auth?   │
│• Δt OK?  │  │• Match?  │  │• Frames? │  │• Active? │  │• Exists? │
│• Recent? │  │          │  │• Student?│  │          │  │          │
│          │  │          │  │          │  │          │  │          │
│ 5-10ms   │  │ 15-20ms  │  │  3-5ms   │  │  2-3ms   │  │  2-3ms   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
      ↓            ↓            ↓            ↓            ↓
   [Results collected via Promise.all]
      ↓
   [All pass?]
    ↙   ↘
  Yes    No
   ↓      ↓
[Valid] [Invalid]
   ↓
[Record attendance]
```

**Timeline:**
Total: 20-25ms (parallel) vs 150ms (sequential)

---

## FIGURE 8: Attack Defense Mechanisms

**Title:** Security Model - Attack Scenarios and Defenses

**Description:**
Table/diagram showing attack vectors:

```
┌─────────────────────┬──────────────────┬────────────────┬──────────┐
│ Attack              │ How It Works     │ Defense        │ Result   │
├─────────────────────┼──────────────────┼────────────────┼──────────┤
│ Screenshot          │ Share photo      │ No temporal    │ BLOCKED  │
│ Sharing             │ via WhatsApp     │ progression    │    ✓     │
│                     │                  │ detected       │          │
├─────────────────────┼──────────────────┼────────────────┼──────────┤
│ Screen Recording    │ Record & replay  │ Old timestamps │ BLOCKED  │
│ Replay              │ video later      │ Replay cache   │    ✓     │
├─────────────────────┼──────────────────┼────────────────┼──────────┤
│ Real-Time           │ Stream screen    │ Network latency│ MITIGATED│
│ Forwarding          │ via video call   │ GPS/WiFi check │    ~     │
├─────────────────────┼──────────────────┼────────────────┼──────────┤
│ Challenge           │ Try to predict   │ Cryptographic  │ BLOCKED  │
│ Prediction          │ future codes     │ impossibility  │    ✓     │
├─────────────────────┼──────────────────┼────────────────┼──────────┤
│ Frame               │ Insert fake      │ Chain breaks   │ BLOCKED  │
│ Injection           │ frames           │ Hash mismatch  │    ✓     │
├─────────────────────┼──────────────────┼────────────────┼──────────┤
│ Time                │ Change device    │ Server time    │ BLOCKED  │
│ Manipulation        │ clock            │ validation     │    ✓     │
├─────────────────────┼──────────────────┼────────────────┼──────────┤
│ Offline Proof       │ Fabricate CAP    │ Hardware       │ BLOCKED  │
│ Forgery             │                  │ signature      │    ✓     │
└─────────────────────┴──────────────────┴────────────────┴──────────┘
```

---

## FIGURE 9: Temporal Coherence Analysis

**Title:** Multi-Layer Coherence Scoring Algorithm

**Description:**
Diagram showing three analysis layers:

**Layer 1: Timing Coherence (40% weight)**
```
┌─────────────────────────────────┐
│ Timestamps: [T1, T2, T3, T4, T5]│
│                                 │
│ Check 1: Increasing? ✓          │
│ Check 2: Δt = 16.67ms? ✓        │
│ Check 3: Jump ratio < 3? ✓      │
│ Check 4: Recent? ✓              │
│                                 │
│ Score: 0.95 (out of 1.0)        │
└─────────────────────────────────┘
```

**Layer 2: Cryptographic Coherence (40% weight)**
```
┌─────────────────────────────────┐
│ Challenges: [C1, C2, C3, C4, C5]│
│ Prev Links: [P1, P2, P3, P4, P5]│
│                                 │
│ Check 1: Chain valid? ✓         │
│ Check 2: Match expected? ✓      │
│                                 │
│ Score: 1.0 (out of 1.0)         │
└─────────────────────────────────┘
```

**Layer 3: Visual Coherence (20% weight)**
```
┌─────────────────────────────────┐
│ Rotations: [0°, 2°, 4°, 6°, 8°] │
│                                 │
│ Check 1: Smooth progression? ✓  │
│ Check 2: Step = 2°? ✓           │
│                                 │
│ Score: 1.0 (out of 1.0)         │
└─────────────────────────────────┘
```

**Final Calculation:**
```
Overall = (0.95 × 0.4) + (1.0 × 0.4) + (1.0 × 0.2)
        = 0.38 + 0.40 + 0.20
        = 0.98

Threshold = 0.8
0.98 > 0.8 → VALID ✓
```

---

## FIGURE 10: User Experience Flows

**Title:** Student and Teacher UX Flowcharts

**Description:**
Two parallel flowcharts:

**Teacher Flow (Left):**
```
[Open attendance app]
      ↓
[Start new session]
      ↓
[Select course]
      ↓
[Project animated QR on screen]
      ↓
[Dashboard shows students checking in]
      ↓
┌─────────────────────────┐
│ Students Present: 45/50 │
│ ■■■■■■■■■■■■■■■■■■░░    │
│                         │
│ Online: 42 ✓            │
│ Offline: 3 🔄           │
│ Failed: 0 ✗             │
└─────────────────────────┘
      ↓
[End session]
      ↓
[Export attendance report]
```

**Student Flow (Right - Online):**
```
[Open app]
      ↓
[Point at screen]
      ↓
[Auto-capture (300ms)]
      ↓
[Processing...]
      ↓
[✓ Attendance Confirmed!]
```

**Student Flow (Right - Offline):**
```
[Open app]
      ↓
[📵 No connection]
      ↓
[Point at screen]
      ↓
[Auto-capture (300ms)]
      ↓
[Processing...]
      ↓
[✓ Offline - Will sync]
[🔄 2 proofs pending]
      ↓
(Later, when online)
      ↓
[🔄 Syncing...]
      ↓
[✓ All synced!]
```

---

## FIGURE 11: Data Structure Diagrams

**Title:** Frame Data Payload Structure

**Description:**
JSON structure diagram:

```
FrameData {
  // Session (orange box)
  session: "uuid-1234-5678-...",
  course: "CS101",

  // Temporal (green box)
  t: 1700000000123,  // ms timestamp
  f: 42,              // frame number

  // Cryptographic (blue box)
  c: "a3f9e2b7...",  // 16-char challenge
  p: "7b4d3f...",     // 8-char prev link

  // Visual (purple box)
  m: {
    rotation: 84.0,   // degrees
    phase: 2.5,       // pixels
    scale: 1.01       // ratio
  },

  // Offline (yellow box)
  offline: {
    validationKey: "d8a2...",
    validFrom: 1700000000000,
    validUntil: 1700007200000,
    expectedFrameRate: 60
  }
}
```

**Size:** ~250-300 bytes (JSON serialized)

---

## FIGURE 12: Performance Metrics

**Title:** System Performance Breakdown

**Description:**
Timeline/Gantt chart showing performance:

**Online Mode Timeline:**
```
0ms        200ms      250ms      300ms      350ms      400ms
|-----------|----------|----------|----------|----------|
| Capture   | Network  | Validate |  Record  | Response |
| (Camera)  | Transfer | (Server) |(Database)| (Network)|
|  200ms    |   50ms   |   25ms   |   15ms   |   10ms   |
|-----------|----------|----------|----------|----------|
                                             Total: 300ms
```

**Offline Mode Timeline:**
```
0ms        200ms      250ms      300ms      350ms      400ms
|-----------|----------|----------|----------|----------|
| Capture   | Validate | Generate |   Sign   |  Store   |
| (Camera)  | (Local)  |   CAP    |(Hardware)| (Local)  |
|  200ms    |   50ms   |   50ms   |   20ms   |   30ms   |
|-----------|----------|----------|----------|----------|
                                             Total: 350ms
```

**Comparison Chart:**
```
Biometric:     ████████████████████ 5,000ms
Static QR:     ██ 500ms (but insecure)
Our System:    █ 300ms (online)
Our System:    █ 350ms (offline)
```

---

## FIGURE 13: Device Attestation Components

**Title:** Device Fingerprinting for Fraud Detection

**Description:**
Mind map showing attestation data:

```
              [Device Attestation]
                      |
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
   [Hardware]    [Software]    [Sensors]
        |             |             |
    ┌───┴───┐     ┌───┴───┐    ┌───┴───┐
    ↓       ↓     ↓       ↓    ↓       ↓
  Screen  Camera  OS   Browser Accel  Gyro
  Props   Props   Info   Info   Data   Data

  [Fingerprint Hash]
         ↓
    Unique ID
    (for this device)
```

**Components:**
- Screen: Width, height, DPI
- Camera: Resolution, FPS capability
- OS: Platform, version
- Browser: User agent
- Accelerometer: X, Y, Z readings
- Gyroscope: Alpha, beta, gamma
- Plus: Timezone, language, battery

**Purpose:** Detect emulators and fraud

---

## FIGURE 14: Sync Queue Architecture

**Title:** Offline-to-Online Synchronization Management

**Description:**
State machine diagram:

**Queue States:**
```
┌─────────────┐
│   Captured  │ (offline)
└──────┬──────┘
       ↓
┌─────────────┐
│   Pending   │ (waiting for network)
└──────┬──────┘
       ↓ (online detected)
┌─────────────┐
│   Syncing   │ (upload in progress)
└──┬────┬─────┘
   ↓    ↓ (failed)
Success Retry ← (attempt < 3)
   ↓       ↓ (attempt >= 3)
Completed Failed
```

**Queue Management:**
```
┌───────────────────────────────┐
│ Sync Queue Manager            │
├───────────────────────────────┤
│ • Listen for 'online' event   │
│ • Periodic sync attempt (30s) │
│ • Exponential backoff         │
│ • Max 3 retries               │
│ • Failed queue for review     │
└───────────────────────────────┘
```

---

## FIGURE 15: Deployment Architecture

**Title:** Production Deployment Topology

**Description:**
Network architecture diagram:

**Frontend (Client-Side):**
```
┌────────────────────────────┐
│  Students' Smartphones     │
│  • Progressive Web App     │
│  • Native Mobile App       │
│  • Camera + Scanner        │
└────────┬───────────────────┘
         │ HTTPS
         ↓
┌────────────────────────────┐
│  Teacher's Display Device  │
│  • Web Browser             │
│  • QR Generator            │
│  • Dashboard               │
└────────┬───────────────────┘
         │ HTTPS
         ↓
```

**Backend (Server-Side):**
```
┌────────────────────────────┐
│  Load Balancer (NGINX)     │
└────────┬───────────────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌─────────┐
│ App     │ │ App     │  (Node.js servers)
│ Server 1│ │ Server 2│
└────┬────┘ └────┬────┘
     │           │
     └─────┬─────┘
           ↓
   ┌──────────────┐
   │ Redis Cache  │ (replay detection)
   └──────────────┘
           ↓
   ┌──────────────┐
   │ Database     │ (PostgreSQL)
   │ • Sessions   │
   │ • Attendance │
   │ • Students   │
   └──────────────┘
```

**Scalability:**
- Horizontal scaling (add more app servers)
- Redis for fast validation
- Database replication for reads
- CDN for static assets

---

## FIGURE 16: Comparison with Prior Art

**Title:** Feature Comparison Matrix

**Description:**
Comparison table:

```
┌──────────────────┬─────────┬─────────┬─────────┬─────────┐
│ Feature          │ Manual  │Biometric│Static QR│Our System│
├──────────────────┼─────────┼─────────┼─────────┼─────────┤
│ Screenshot-proof │   N/A   │   N/A   │   ✗     │   ✓     │
│ Speed            │   ✗     │   ~     │   ✓     │   ✓     │
│ Cost             │   ✓     │   ✗     │   ✓     │   ✓     │
│ Offline support  │   ✓     │   ✗     │   ✗     │   ✓     │
│ Accuracy         │   ✗     │   ✓     │   ✗     │   ✓     │
│ Privacy          │   ✓     │   ✗     │   ✓     │   ✓     │
│ No special HW    │   ✓     │   ✗     │   ✓     │   ✓     │
│ Scalability      │   ✗     │   ✗     │   ✓     │   ✓     │
└──────────────────┴─────────┴─────────┴─────────┴─────────┘

Legend: ✓ = Good, ~ = Moderate, ✗ = Poor
```

---

## NOTES FOR PROFESSIONAL ILLUSTRATION

When creating formal diagrams:
1. Use standard patent diagram conventions (black and white, clear labels)
2. Number all figures consecutively
3. Use consistent symbology throughout
4. Include figure titles and brief descriptions
5. Reference figure numbers in main specification text

**Recommended Tools:**
- Microsoft Visio (professional diagrams)
- Draw.io / Diagrams.net (free alternative)
- Lucidchart (online collaboration)
- Adobe Illustrator (publication quality)

**Patent Office Requirements:**
- Minimum line thickness: 0.3mm
- Margins: 2.5cm on all sides
- Labels: Legible at A4 size
- No color (black and white only)
- File format: PDF or TIFF

---

**END OF DIAGRAMS DESCRIPTION**

**Total Figures: 16**

These descriptions provide complete guidance for creating formal patent diagrams. For provisional patent filing, these detailed descriptions are sufficient. For complete patent filing, hire a technical illustrator to create formal drawings based on these specifications.
