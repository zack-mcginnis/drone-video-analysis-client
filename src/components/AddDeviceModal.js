import React, { useState } from 'react';
import './AddDeviceModal.css';
import { FaTimes } from 'react-icons/fa';
import { createDevice } from '../services/api';

function AddDeviceModal({ isOpen, onClose, onDeviceAdded }) {
  const [deviceName, setDeviceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deviceName.trim()) {
      setError('Device name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await createDevice(deviceName.trim());
      setDeviceName('');
      onDeviceAdded(response.data);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create device. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Device</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="deviceName">Device Name</label>
            <input
              type="text"
              id="deviceName"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Enter device name"
              disabled={isSubmitting}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDeviceModal; 