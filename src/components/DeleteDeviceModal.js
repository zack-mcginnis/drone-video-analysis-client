import React, { useState } from 'react';
import './DeleteDeviceModal.css';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { deleteDevice } from '../services/api';

function DeleteDeviceModal({ isOpen, onClose, device, onDeviceDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      await deleteDevice(device.id);
      onDeviceDeleted(device.id);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete device. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !device) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <div className="delete-header">
            <FaExclamationTriangle className="warning-icon" />
            <h2>Delete Device</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="delete-content">
          <p>Are you sure you want to delete the device "<strong>{device.name || `Device ${device.id}`}</strong>"?</p>
          <p className="warning-text">This action cannot be undone. The device's stream key will be invalidated and any active streams will be terminated.</p>
          {error && <div className="error-message">{error}</div>}
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Device'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteDeviceModal; 