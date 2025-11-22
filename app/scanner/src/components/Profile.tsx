/**
 * Profile Component
 * Student profile setup and management
 */

import { useState } from 'react';
import { useScannerStore } from '@/store/scannerStore';
import type { StudentProfile } from '@/types';
import './Profile.css';

export function Profile() {
  const { student, setStudent } = useScannerStore();
  const [isEditing, setIsEditing] = useState(!student);

  const [formData, setFormData] = useState<StudentProfile>(
    student || {
      id: '',
      name: '',
      email: '',
      rollNumber: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.id) {
      alert('Please fill in required fields');
      return;
    }

    setStudent(formData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!isEditing && student) {
    return (
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{student.name.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h3>{student.name}</h3>
            {student.rollNumber && <p className="roll-number">{student.rollNumber}</p>}
            {student.email && <p className="email">{student.email}</p>}
          </div>
        </div>
        <button onClick={handleEdit} className="btn btn-secondary btn-small">
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <div className="profile-setup">
      <h2>Setup Your Profile</h2>
      <p className="subtitle">Required for attendance verification</p>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="id">
            Student ID <span className="required">*</span>
          </label>
          <input
            type="text"
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="e.g., 2021CS001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="rollNumber">Roll Number</label>
          <input
            type="text"
            id="rollNumber"
            name="rollNumber"
            value={formData.rollNumber || ''}
            onChange={handleChange}
            placeholder="e.g., 21"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="e.g., john@example.com"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save Profile
          </button>
          {student && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
