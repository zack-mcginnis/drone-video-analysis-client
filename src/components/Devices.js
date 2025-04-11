import React, { useState, useEffect } from 'react';
import './Devices.css';
import { FaMicrochip, FaKey, FaCopy, FaServer, FaPlus, FaTrash } from 'react-icons/fa';
import AddDeviceModal from './AddDeviceModal';
import DeleteDeviceModal from './DeleteDeviceModal';

function Devices({ devices, onDeviceAdded, onDeviceDeleted }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModalDevice, setDeleteModalDevice] = useState(null);

  const handleCopyStreamKey = (streamKey) => {
    navigator.clipboard.writeText(streamKey);
    setCopiedKey(streamKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyRtmpUrl = (streamKey) => {
    const rtmpUrl = `${process.env.REACT_APP_RTMP_STREAM_URL}/live/${streamKey}`;
    navigator.clipboard.writeText(rtmpUrl);
    setCopiedUrl(streamKey);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDeviceAdded = (newDevice) => {
    if (onDeviceAdded) {
      onDeviceAdded(newDevice);
    }
  };

  const handleDeviceDeleted = (deviceId) => {
    if (onDeviceDeleted) {
      onDeviceDeleted(deviceId);
    }
  };

  return (
    <div className="devices-container">
      <div className="devices-header">
        <h2>Your Devices</h2>
        <button className="add-device-button" onClick={() => setIsAddModalOpen(true)}>
          <FaPlus />
          Add Device
        </button>
      </div>
      {(!devices || devices.length === 0) ? (
        <div className="no-devices">
          <FaMicrochip size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No Devices Found</h3>
          <p>You don't have any devices registered yet.</p>
          <button className="add-first-device-button" onClick={() => setIsAddModalOpen(true)}>
            <FaPlus />
            Add Your First Device
          </button>
        </div>
      ) : (
        <div className="devices-grid">
          {devices.map((device) => (
            <div key={device.id} className="device-card">
              <div className="device-header">
                <div className="device-title">
                  <FaMicrochip className="device-icon" />
                  <h3>{device.name || `Device ${device.id}`}</h3>
                </div>
                <button
                  className="delete-button"
                  onClick={() => setDeleteModalDevice(device)}
                  title="Delete device"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="device-info">
                <div className="stream-key-container">
                  <div className="stream-key-label">
                    <FaKey className="key-icon" />
                    <span>Stream Key:</span>
                  </div>
                  <div className="stream-key-value">
                    <code>{device.stream_key}</code>
                    <button
                      className="copy-button"
                      onClick={() => handleCopyStreamKey(device.stream_key)}
                      title="Copy stream key"
                    >
                      <FaCopy />
                      {copiedKey === device.stream_key && (
                        <span className="copied-tooltip">Copied!</span>
                      )}
                    </button>
                  </div>
                </div>
                <div className="rtmp-url-container">
                  <div className="rtmp-url-label">
                    <FaServer className="server-icon" />
                    <span>RTMP URL:</span>
                  </div>
                  <div className="rtmp-url-value">
                    <code>{`${process.env.REACT_APP_RTMP_STREAM_URL}/live/${device.stream_key}`}</code>
                    <button
                      className="copy-button"
                      onClick={() => handleCopyRtmpUrl(device.stream_key)}
                      title="Copy RTMP URL"
                    >
                      <FaCopy />
                      {copiedUrl === device.stream_key && (
                        <span className="copied-tooltip">Copied!</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onDeviceAdded={handleDeviceAdded}
      />
      <DeleteDeviceModal
        isOpen={deleteModalDevice !== null}
        onClose={() => setDeleteModalDevice(null)}
        device={deleteModalDevice}
        onDeviceDeleted={handleDeviceDeleted}
      />
    </div>
  );
}

export default Devices; 