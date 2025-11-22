/**
 * Main App Component
 * Student Scanner App for Temporal 3D QR Codes
 */

import { useEffect, useState } from 'react';
import { Scanner } from './components/Scanner';
import { Profile } from './components/Profile';
import { useScannerStore } from './store/scannerStore';
import { initDB, getStorageStats } from './utils/storage';
import { initializeStore } from './store/scannerStore';
import './App.css';

function App() {
  const { student, settings, updateSettings } = useScannerStore();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [storageStats, setStorageStats] = useState({ totalProofs: 0, unsyncedProofs: 0, syncedProofs: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  /**
   * Initialize app
   */
  useEffect(() => {
    const init = async () => {
      // Initialize IndexedDB
      await initDB();

      // Initialize store from IndexedDB
      await initializeStore();

      // Get storage stats
      const stats = await getStorageStats();
      setStorageStats(stats);
    };

    init();
  }, []);

  /**
   * Monitor online/offline status
   */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Request notification permission (for future use)
   */
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>📱 QR Scanner</h1>
          {!isOnline && (
            <span className="offline-badge">Offline</span>
          )}
        </div>

        <div className="header-right">
          {storageStats.unsyncedProofs > 0 && (
            <span className="unsynced-badge" title="Unsynced offline proofs">
              {storageStats.unsyncedProofs}
            </span>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-icon"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {!student ? (
          <Profile />
        ) : showProfile ? (
          <Profile />
        ) : (
          <Scanner />
        )}
      </main>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <h2>Settings</h2>

            <div className="settings-group">
              <h3>Capture Settings</h3>

              <div className="setting-item">
                <label>
                  Target Frames
                  <input
                    type="number"
                    min="5"
                    max="15"
                    value={settings.targetFrames}
                    onChange={(e) =>
                      updateSettings({ targetFrames: parseInt(e.target.value) })
                    }
                  />
                </label>
              </div>

              <div className="setting-item">
                <label>
                  Max Capture Time (ms)
                  <input
                    type="number"
                    min="200"
                    max="1000"
                    step="100"
                    value={settings.maxCaptureTime}
                    onChange={(e) =>
                      updateSettings({ maxCaptureTime: parseInt(e.target.value) })
                    }
                  />
                </label>
              </div>
            </div>

            <div className="settings-group">
              <h3>Feedback</h3>

              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.vibrationFeedback}
                    onChange={(e) =>
                      updateSettings({ vibrationFeedback: e.target.checked })
                    }
                  />
                  Vibration Feedback
                </label>
              </div>

              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.soundFeedback}
                    onChange={(e) =>
                      updateSettings({ soundFeedback: e.target.checked })
                    }
                  />
                  Sound Feedback
                </label>
              </div>
            </div>

            <div className="settings-group">
              <h3>Advanced</h3>

              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.offlineMode}
                    onChange={(e) =>
                      updateSettings({ offlineMode: e.target.checked })
                    }
                  />
                  Offline Mode
                </label>
              </div>

              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoSubmit}
                    onChange={(e) =>
                      updateSettings({ autoSubmit: e.target.checked })
                    }
                  />
                  Auto Submit
                </label>
              </div>
            </div>

            {student && (
              <div className="settings-group">
                <h3>Profile</h3>
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setShowSettings(false);
                  }}
                  className="btn btn-secondary"
                >
                  Edit Profile
                </button>
              </div>
            )}

            <div className="settings-actions">
              <button onClick={() => setShowSettings(false)} className="btn btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>Temporal 3D QR Code Scanner</p>
        {student && (
          <p className="footer-meta">
            Logged in as: {student.name} ({student.id})
          </p>
        )}
      </footer>
    </div>
  );
}

export default App;
