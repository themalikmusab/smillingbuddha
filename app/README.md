# Temporal 3D QR Code System - Application Suite

Production-ready implementation of the Temporal 3D QR Code system for attendance verification.

## 📁 Project Structure

```
app/
├── display/          # Teacher Dashboard (React + TypeScript)
├── scanner/          # Student Scanner App (PWA)
└── server/           # Validation Server (Node.js + Express)
```

## ✨ Features

### Display System (Teacher)
- ✅ 60 FPS animated QR code generation
- ✅ Cryptographic challenge chaining (SHA-256)
- ✅ Session management (create, start, pause, end)
- ✅ Real-time student scan counter
- ✅ Fullscreen mode for projection
- ✅ Offline-capable architecture

### Scanner App (Student)
- ✅ Real-time camera QR scanning
- ✅ Screenshot detection & prevention
- ✅ Frame sequence validation
- ✅ Offline mode with IndexedDB storage
- ✅ PWA (installable on phones)
- ✅ Haptic feedback

### Server (Backend)
- ✅ RESTful API for validation
- ✅ Multi-layer frame validation
- ✅ Offline proof synchronization
- ⏳ PostgreSQL database (TODO)
- ⏳ Redis caching (TODO)
- ⏳ Replay attack prevention (TODO)

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git

### 1. Display System

```bash
cd app/display
npm install
npm run dev
```

Open http://localhost:3000

**Usage:**
1. Create a session (fill in details)
2. Click "Start Session"
3. QR code will start animating at 60 FPS
4. Press F for fullscreen (for projector)

### 2. Scanner App

```bash
cd app/scanner
npm install
npm run dev
```

Open http://localhost:3001 on your phone

**Usage:**
1. Set up your profile (Student ID, Name)
2. Click "Scan QR Code"
3. Point camera at the animated QR on display
4. Hold steady for 200-300ms
5. Attendance recorded!

**⚠️ HTTPS Required for Camera Access:**

For camera access on remote devices (not localhost), you need HTTPS. Use one of these methods:

**Option A: ngrok (Easiest)**
```bash
# Install ngrok: https://ngrok.com
npm install -g ngrok

# Run scanner dev server (port 3001)
cd app/scanner
npm run dev

# In another terminal, create HTTPS tunnel
ngrok http 3001

# Use the HTTPS URL provided by ngrok
```

**Option B: Local HTTPS (mkcert)**
```bash
# Install mkcert
# macOS: brew install mkcert
# Windows: choco install mkcert

# Create local CA
mkcert -install

# Generate certificates
mkcert localhost

# Update vite.config.ts to use HTTPS
# See scanner/README.md for details
```

### 3. Server

```bash
cd app/server
npm install
cp .env.example .env  # Edit .env with your settings
npm run dev
```

Server running on http://localhost:3002

**Health check:**
```bash
curl http://localhost:3002/health
```

## 📱 Testing the Complete Flow

1. **Start all three services:**
   - Display: http://localhost:3000
   - Scanner: http://localhost:3001 (or ngrok HTTPS URL)
   - Server: http://localhost:3002

2. **Create a session on Display**
   - Open http://localhost:3000
   - Fill in session details
   - Click "Start Session"

3. **Scan with Scanner**
   - Open Scanner URL on your phone
   - Set up your student profile
   - Click "Scan QR Code"
   - Point camera at the Display screen
   - Hold steady until success message

4. **Verify on Server**
   - Check server console logs
   - Attendance should be recorded

## 🏗️ Building for Production

### Display System

```bash
cd app/display
npm run build

# Output in dist/
# Deploy to any static hosting (Netlify, Vercel, S3, etc.)
```

### Scanner App

```bash
cd app/scanner
npm run build

# Output in dist/ with service worker for PWA
# Deploy to static hosting with HTTPS
```

### Server

```bash
cd app/server
npm run build

# Output in dist/
# Deploy to VPS, AWS, Google Cloud, etc.
```

## 🐳 Docker Deployment (Recommended)

**Coming soon:** Docker Compose configuration for easy deployment of all three services.

## 📊 Database Setup (TODO)

The server currently uses in-memory storage. For production:

### PostgreSQL Schema

```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES sessions(id),
  student_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  frames_captured INTEGER NOT NULL,
  validation_score INTEGER NOT NULL,
  offline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendance_session ON attendance(session_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
```

Run migrations:
```bash
cd app/server
# TODO: Add migration scripts
```

## 🔧 Configuration

### Display (.env)
```env
VITE_API_URL=http://localhost:3002
```

### Scanner (.env)
```env
VITE_API_URL=http://localhost:3002
VITE_ENABLE_DEBUG=false
```

### Server (.env)
```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=temporal_qr
REDIS_HOST=localhost
REDIS_PORT=6379
```

See individual README files in each directory for detailed configuration.

## 🧪 Testing

```bash
# Display
cd app/display
npm run type-check
npm run lint

# Scanner
cd app/scanner
npm run type-check
npm run lint

# Server
cd app/server
npm run type-check
npm run lint
```

## 📱 PWA Installation (Scanner)

Students can install the scanner as a native app:

**Android:**
1. Open scanner URL in Chrome
2. Tap "Add to Home Screen"
3. App installs like native app

**iOS:**
1. Open scanner URL in Safari
2. Tap Share button
3. Tap "Add to Home Screen"

## 🔐 Security Notes

- **Display:** Generates cryptographic challenges using SHA-256
- **Scanner:** Validates frame sequences locally before submission
- **Server:** Multi-layer validation (timing, crypto, visual)
- **Offline:** Proofs stored in IndexedDB with future hardware signing

**IMPORTANT:**
- Always use HTTPS in production
- Keep API keys secure
- Validate all inputs on server
- Implement rate limiting (TODO)

## 🚧 Roadmap

### Week 1-2 (Current)
- [x] Display system with 60 FPS QR
- [x] Scanner with camera capture
- [x] Basic validation server
- [x] Offline mode support

### Week 3-4
- [ ] PostgreSQL database integration
- [ ] Redis caching
- [ ] Advanced validation algorithms
- [ ] Admin dashboard

### Week 5-6
- [ ] User authentication
- [ ] Email notifications
- [ ] Export attendance (CSV, PDF)
- [ ] Analytics dashboard

### Week 7-8
- [ ] Load testing (1000+ concurrent users)
- [ ] Security audit
- [ ] Production deployment
- [ ] Documentation

## 🐛 Troubleshooting

### Camera not working
- Ensure HTTPS (required for camera access)
- Grant camera permissions
- Try different browser (Chrome recommended)

### QR not scanning
- Increase display brightness
- Hold phone steady
- Ensure good lighting
- Try fullscreen mode

### Server connection errors
- Check CORS settings in server
- Verify API_URL in .env files
- Ensure server is running

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Check Node version: `node --version` (should be 18+)

## 📞 Support

For issues or questions:
- Check individual README files in each directory
- Review technical documentation in `/docs/`
- Open an issue on GitHub

## 📜 License

Proprietary - Patent Pending

See `/patent/` directory for patent documentation.

## 👥 Contributing

This is a proprietary project. For licensing inquiries, contact the author.

---

**Made with ❤️ for educators and students**

*Part of the Temporal 3D QR Code System - World's first screenshot-proof QR code*
