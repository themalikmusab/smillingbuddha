/**
 * Main App Component
 * Teacher Dashboard for Temporal 3D QR Code Display
 */

import { useEffect } from 'react';
import { QRGenerator } from './components/QRGenerator';
import { SessionControl } from './components/SessionControl';
import { useDisplayStore } from './store/displayStore';
import './App.css';

function App() {
  const { session, sessionState, settings, updateSettings } = useDisplayStore();

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      updateSettings({ fullscreen: true });
    } else {
      await document.exitFullscreen();
      updateSettings({ fullscreen: false });
    }
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && settings.fullscreen) {
        updateSettings({ fullscreen: false });
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [settings.fullscreen, updateSettings]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🔐 Temporal 3D QR Display</h1>
          <p className="subtitle">Screenshot-Proof Attendance System</p>
        </div>

        {session && (
          <div className="header-actions">
            <button
              onClick={toggleFullscreen}
              className="btn-icon"
              title="Toggle Fullscreen (F)"
            >
              {settings.fullscreen ? '🗗' : '🗖'}
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="content-grid">
          {/* Left Panel: Session Control */}
          <aside className="control-panel">
            <SessionControl />
          </aside>

          {/* Right Panel: QR Display */}
          <section className="display-panel">
            {session && sessionState.status !== 'idle' ? (
              <div className="qr-display-container">
                <QRGenerator
                  sessionId={session.id}
                  frameRate={session.frameRate}
                  onFrameGenerated={(frame) => {
                    // Optional: Send frame data to server for logging
                    console.debug('Frame generated:', frame.f);
                  }}
                  onError={(error) => {
                    console.error('QR Generation error:', error);
                    alert(`Error: ${error.message}`);
                  }}
                />

                <div className="display-instructions">
                  <h3>📱 Instructions for Students</h3>
                  <ol>
                    <li>Open the scanner app on your phone</li>
                    <li>Point camera at the animated QR code</li>
                    <li>Hold steady for 200-300ms (automatic)</li>
                    <li>Wait for confirmation message</li>
                  </ol>

                  <div className="warning-box">
                    <p>⚠️ <strong>Important:</strong> Screenshots will NOT work!</p>
                    <p>The QR code is animated and cryptographically linked.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h2>No Active Session</h2>
                <p>Create a session to start displaying the QR code</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Temporal 3D QR Code System &copy; 2025 | Patent Pending
        </p>
        <p className="footer-meta">
          Session: {session?.id || 'None'} | Status: {sessionState.status}
        </p>
      </footer>

      {/* Keyboard Shortcuts Help */}
      {settings.showInfo && (
        <div className="keyboard-help">
          <p><kbd>F</kbd> Toggle Fullscreen</p>
          <p><kbd>Esc</kbd> Exit Fullscreen</p>
        </div>
      )}
    </div>
  );
}

export default App;
