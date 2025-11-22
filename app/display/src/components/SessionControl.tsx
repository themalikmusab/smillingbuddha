/**
 * Session Control Component
 * UI for creating and managing attendance sessions
 */

import { useState } from 'react';
import { useDisplayStore } from '@/store/displayStore';
import { formatTime, formatDuration } from '@/utils/format';
import './SessionControl.css';

export function SessionControl() {
  const {
    session,
    sessionState,
    createSession,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
  } = useDisplayStore();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    duration: 60,
    frameRate: 60,
    offlineMode: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    createSession({
      name: formData.name,
      location: formData.location,
      startTime: Date.now(),
      duration: formData.duration,
      frameRate: formData.frameRate,
      offlineMode: formData.offlineMode,
    });
  };

  const handleStart = () => {
    startSession();
  };

  const handlePause = () => {
    pauseSession();
  };

  const handleResume = () => {
    resumeSession();
  };

  const handleEnd = () => {
    if (confirm('Are you sure you want to end this session?')) {
      endSession();
    }
  };

  // Render session creation form
  if (!session) {
    return (
      <div className="session-control">
        <h2>Create Attendance Session</h2>
        <form onSubmit={handleCreateSession} className="session-form">
          <div className="form-group">
            <label htmlFor="name">
              Session Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., CS101 - Lecture 5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">
              Location <span className="required">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Room 301, Main Building"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="1"
              max="480"
            />
          </div>

          <div className="form-group">
            <label htmlFor="frameRate">Frame Rate (FPS)</label>
            <select
              id="frameRate"
              name="frameRate"
              value={formData.frameRate}
              onChange={handleInputChange}
            >
              <option value="30">30 FPS (Lower quality)</option>
              <option value="60">60 FPS (Recommended)</option>
              <option value="120">120 FPS (High quality)</option>
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="offlineMode"
                checked={formData.offlineMode}
                onChange={handleInputChange}
              />
              Enable offline mode
            </label>
          </div>

          <button type="submit" className="btn btn-primary">
            Create Session
          </button>
        </form>
      </div>
    );
  }

  // Render session controls
  return (
    <div className="session-control">
      <div className="session-info">
        <h2>{session.name}</h2>
        <p className="session-meta">
          <span>📍 {session.location}</span>
          <span>⏱️ {formData.duration} minutes</span>
          <span>🎯 {session.frameRate} FPS</span>
        </p>
        <p className="session-id">Session ID: {session.id}</p>
      </div>

      <div className="session-status">
        <div className={`status-badge status-${sessionState.status}`}>
          {sessionState.status.toUpperCase()}
        </div>

        {sessionState.startedAt && (
          <div className="status-info">
            <p>Started: {formatTime(sessionState.startedAt)}</p>
            <p>Frame: {sessionState.currentFrame}</p>
            <p>Students Scanned: {sessionState.studentsScanned}</p>
          </div>
        )}
      </div>

      <div className="session-controls">
        {sessionState.status === 'idle' && (
          <button onClick={handleStart} className="btn btn-success">
            ▶️ Start Session
          </button>
        )}

        {sessionState.status === 'active' && (
          <>
            <button onClick={handlePause} className="btn btn-warning">
              ⏸️ Pause
            </button>
            <button onClick={handleEnd} className="btn btn-danger">
              ⏹️ End Session
            </button>
          </>
        )}

        {sessionState.status === 'paused' && (
          <>
            <button onClick={handleResume} className="btn btn-success">
              ▶️ Resume
            </button>
            <button onClick={handleEnd} className="btn btn-danger">
              ⏹️ End Session
            </button>
          </>
        )}

        {sessionState.status === 'completed' && (
          <div className="session-completed">
            <h3>✅ Session Completed</h3>
            <p>Total Frames: {sessionState.currentFrame}</p>
            <p>Students Scanned: {sessionState.studentsScanned}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              New Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
