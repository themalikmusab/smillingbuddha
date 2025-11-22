# Implementation Roadmap - Temporal 3D QR Code

**Last Updated:** November 22, 2025

---

## Quick Summary

**Goal:** Build MVP in 2-3 months
**Approach:** Iterative - POC → MVP → Production
**Tech Stack:** React (display), React Native/PWA (scanner), Node.js (backend)

---

## Phase 1: Proof of Concept (Week 1-3)

### Week 1: Display System
**Goal:** Working animated QR generator

**Tasks:**
- [ ] Set up React project
- [ ] Implement QR code generation (qrcode.js)
- [ ] Create challenge generation algorithm (SHA-256)
- [ ] Build frame animation loop (60 FPS)
- [ ] Add visual transforms (rotation, phase)
- [ ] Create simple web UI

**Deliverable:** Web app that displays animated QR

**Time:** 3-5 days

---

### Week 2: Scanner App
**Goal:** Working phone scanner

**Tasks:**
- [ ] Choose: PWA vs React Native (recommend PWA for speed)
- [ ] Set up camera capture (MediaStream API)
- [ ] Integrate QR decoder (jsQR)
- [ ] Implement frame collection (5-10 frames)
- [ ] Build temporal coherence analyzer
- [ ] Create simple UI

**Deliverable:** Phone app that scans animated QR

**Time:** 5-7 days

---

### Week 3: Validation Server
**Goal:** Working backend validation

**Tasks:**
- [ ] Set up Node.js + Express project
- [ ] Implement challenge reconstruction
- [ ] Build validation pipeline (timing, crypto, replay)
- [ ] Add PostgreSQL database
- [ ] Add Redis cache
- [ ] Create REST API endpoints

**Deliverable:** Backend that validates submissions

**Time:** 5-7 days

---

### Week 3 End: Integration & Demo
**Goal:** End-to-end working demo

**Tasks:**
- [ ] Connect all three components
- [ ] Test complete flow
- [ ] Fix bugs
- [ ] Create demo video
- [ ] Document setup

**Deliverable:** Working POC demo

**Time:** 2-3 days

---

## Phase 2: MVP Development (Week 4-8)

### Week 4-5: Enhanced Features
**Goal:** Add offline mode and security

**Tasks:**
- [ ] Implement offline proof generation
- [ ] Add WebAuthn hardware signing
- [ ] Build sync queue
- [ ] Enhance security (rate limiting, HTTPS)
- [ ] Add error handling

**Deliverable:** Offline mode working

**Time:** 10-12 days

---

### Week 6-7: User Features
**Goal:** Teacher and student UX

**Tasks:**
- [ ] Teacher dashboard (create session, view attendance)
- [ ] Student app improvements (better UX)
- [ ] Attendance history
- [ ] Export features (CSV, PDF)
- [ ] Notifications (email, SMS)

**Deliverable:** User-friendly interfaces

**Time:** 10-12 days

---

### Week 8: Testing & Polish
**Goal:** Production-ready quality

**Tasks:**
- [ ] Security audit
- [ ] Performance testing (load testing)
- [ ] Bug fixes
- [ ] Documentation
- [ ] Deployment setup

**Deliverable:** MVP ready for pilot

**Time:** 5-7 days

---

## Phase 3: Pilot Program (Week 9-12)

### Week 9: Pilot Deployment
**Goal:** Deploy to 2-3 universities

**Tasks:**
- [ ] Set up production infrastructure (AWS/GCP)
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Configure monitoring (Prometheus, Grafana)
- [ ] Create support documentation

**Deliverable:** Live system in production

**Time:** 5-7 days

---

### Week 10-11: Pilot Run
**Goal:** Real-world testing

**Tasks:**
- [ ] Onboard professors
- [ ] Train students
- [ ] Monitor usage
- [ ] Collect feedback
- [ ] Fix issues

**Deliverable:** User feedback and metrics

**Time:** 10-14 days

---

### Week 12: Iteration
**Goal:** Improve based on feedback

**Tasks:**
- [ ] Analyze feedback
- [ ] Fix critical issues
- [ ] Improve UX
- [ ] Optimize performance
- [ ] Prepare case studies

**Deliverable:** Improved product

**Time:** 5-7 days

---

## Phase 4: Production Launch (Week 13+)

### Marketing & Sales
- [ ] Create marketing materials
- [ ] Build sales pipeline
- [ ] Launch website
- [ ] Social media presence
- [ ] Content marketing

### Scaling
- [ ] Onboard more universities
- [ ] Add new features based on demand
- [ ] Expand to corporate market
- [ ] International expansion

---

## Technology Roadmap

### POC Stack (Simple)
- **Display:** React + qrcode.js
- **Scanner:** PWA + jsQR
- **Backend:** Node.js + Express + SQLite
- **Deployment:** Heroku or Railway

### MVP Stack (Better)
- **Display:** React + qrcode.js
- **Scanner:** PWA or React Native + jsQR (WASM)
- **Backend:** Node.js + Express + PostgreSQL + Redis
- **Deployment:** AWS EC2 or Google Cloud Run

### Production Stack (Best)
- **Display:** React + Next.js (SSR)
- **Scanner:** React Native (iOS + Android) + PWA fallback
- **Backend:** Node.js + Fastify + PostgreSQL + Redis
- **Deployment:** Kubernetes on AWS/GCP
- **Monitoring:** Prometheus + Grafana + Sentry
- **CDN:** CloudFlare

---

## Development Workflow

### Git Workflow
```
main (production)
  ↑
develop (staging)
  ↑
feature/xyz (development)
```

### CI/CD Pipeline
```
Git Push
  ↓
GitHub Actions
  ↓
Run Tests
  ↓
Build Docker Image
  ↓
Deploy to Staging
  ↓
Manual Approval
  ↓
Deploy to Production
```

---

## Resource Requirements

### Team (MVP)
- 1 Full-stack developer (you!)
- 1 Designer (part-time, optional)
- 1 QA tester (part-time, Week 8+)

**Alternative:** Solo development (slower but doable)

### Budget (POC)
- Development: ₹0 (your time)
- Hosting: ₹500-₹1,000/month (Heroku/Railway)
- Domain: ₹500/year
- **Total:** ~₹2,000 for 3 months

### Budget (MVP)
- Development: ₹0 (your time) or hire: ₹2-5 lakh/month
- Hosting: ₹5,000-₹10,000/month (AWS)
- Tools: ₹2,000-₹5,000/month (monitoring, etc.)
- **Total:** ~₹20,000-₹50,000 for 3 months (solo)

---

## Milestones & Checkpoints

### Milestone 1: POC Demo (Week 3)
**Success Criteria:**
- [ ] Can generate animated QR (60 FPS)
- [ ] Phone can scan and decode
- [ ] Backend validates correctly
- [ ] End-to-end demo works

**Deliverable:** Demo video + live demo

---

### Milestone 2: MVP Launch (Week 8)
**Success Criteria:**
- [ ] Offline mode works
- [ ] Teacher dashboard functional
- [ ] Student app polished
- [ ] Security audit passed
- [ ] Load tested (100 concurrent users)

**Deliverable:** Production-ready MVP

---

### Milestone 3: Pilot Success (Week 12)
**Success Criteria:**
- [ ] 100+ students using it
- [ ] 10+ professors onboarded
- [ ] <1% error rate
- [ ] Positive user feedback
- [ ] 2-3 case studies

**Deliverable:** Proven product-market fit

---

### Milestone 4: Scale (Week 16+)
**Success Criteria:**
- [ ] 1,000+ students
- [ ] 10+ universities
- [ ] ₹10+ lakh revenue
- [ ] <0.1% error rate

**Deliverable:** Scalable business

---

## Quick Start Guide

### Step 1: Set Up Environment
```bash
# Install Node.js (v18+)
nvm install 18
nvm use 18

# Install pnpm (fast package manager)
npm install -g pnpm

# Create project structure
mkdir temporal-qr && cd temporal-qr
mkdir display scanner server
```

### Step 2: Display System (React)
```bash
cd display
npx create-react-app .
pnpm install qrcode crypto-js

# Create QR generator component
# See implementation in code examples below
```

### Step 3: Scanner (PWA)
```bash
cd scanner
npx create-react-app .
pnpm install jsqr

# Set up PWA
pnpm install workbox-webpack-plugin
```

### Step 4: Backend (Node.js)
```bash
cd server
pnpm init
pnpm install express pg redis cors

# Create server.js
# See implementation in code examples below
```

---

## Code Examples

### Display: QR Generator Component
```javascript
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import crypto from 'crypto-js';

function QRGenerator({ sessionId }) {
  const [frameNumber, setFrameNumber] = useState(0);
  const [canvasRef, setCanvasRef] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      generateFrame(frameNumber);
      setFrameNumber(f => f + 1);
    }, 16.67); // 60 FPS

    return () => clearInterval(interval);
  }, [frameNumber]);

  function generateFrame(frameNum) {
    const data = {
      session: sessionId,
      t: Date.now(),
      f: frameNum,
      c: generateChallenge(frameNum),
      m: { rotation: (frameNum * 2) % 360 }
    };

    QRCode.toCanvas(
      canvasRef,
      JSON.stringify(data),
      { errorCorrectionLevel: 'H' }
    );
  }

  function generateChallenge(frameNum) {
    const input = `${sessionId}${Date.now()}${frameNum}`;
    return crypto.SHA256(input).toString().substring(0, 16);
  }

  return <canvas ref={setCanvasRef} />;
}
```

### Scanner: Camera Capture
```javascript
import { useEffect, useRef } from 'react';
import jsQR from 'jsqr';

function Scanner({ onFramesCaptured }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const frames = useRef([]);

  useEffect(() => {
    startCamera();
  }, []);

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', frameRate: 60 }
    });

    videoRef.current.srcObject = stream;
    videoRef.current.play();

    requestAnimationFrame(captureFrame);
  }

  function captureFrame() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const qrData = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrData) {
      frames.current.push(JSON.parse(qrData.data));

      if (frames.current.length >= 10) {
        onFramesCaptured(frames.current);
        return; // Stop capturing
      }
    }

    requestAnimationFrame(captureFrame);
  }

  return (
    <>
      <video ref={videoRef} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}
```

### Backend: Validation Server
```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/api/verify', async (req, res) => {
  const { frames, studentId, sessionId } = req.body;

  // Validate timing
  const timingValid = validateTiming(frames);

  // Validate crypto
  const cryptoValid = validateCrypto(frames, sessionId);

  if (timingValid && cryptoValid) {
    // Record attendance
    await recordAttendance(studentId, sessionId);
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

function validateTiming(frames) {
  const timestamps = frames.map(f => f.t);
  return timestamps.every((t, i) => i === 0 || t > timestamps[i - 1]);
}

function validateCrypto(frames, sessionId) {
  // Reconstruct challenges
  const expected = reconstructChallenges(sessionId, frames[0].t, frames.length);
  const actual = frames.map(f => f.c);

  return JSON.stringify(expected) === JSON.stringify(actual);
}

function reconstructChallenges(sessionId, startTime, count) {
  const challenges = [];
  for (let i = 0; i < count; i++) {
    const input = `${sessionId}${startTime + i * 17}${i}`;
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    challenges.push(hash.substring(0, 16));
  }
  return challenges;
}

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Next Steps

**Week 1 Tasks (This Week):**
1. Set up development environment
2. Create Display system (React app)
3. Test QR generation at 60 FPS
4. Create demo video

**Start here:**
```bash
mkdir temporal-qr-poc
cd temporal-qr-poc
npx create-react-app display
cd display
npm install qrcode crypto-js
# Start coding!
```

---

**Ready to build? Let's go! 🚀**

See also:
- [Architecture](./architecture.md) - System design
- [API Specification](./api-specification.md) - REST API docs

**Questions?** Open an issue on GitHub!
