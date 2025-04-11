import React from 'react';
import './DeviceSelector.css';
import { FaMicrochip, FaCheckCircle, FaCircle } from 'react-icons/fa';

const DeviceSelector = ({ devices, selectedDevice, onDeviceSelect }) => {
  if (!devices || devices.length === 0) {
    return (
      <div className="device-selector empty">
        <FaMicrochip />
        <p>No devices available</p>
      </div>
    );
  }

  return (
    <div className="device-selector">
      <div className="device-selector-header">
        <FaMicrochip /> Available Devices
      </div>
      <div className="device-cards">
        {devices.map(device => (
          <button
            key={device.id}
            className={`device-card ${selectedDevice?.id === device.id ? 'selected' : ''}`}
            onClick={() => onDeviceSelect(device)}
          >
            <div className="device-card-content">
              <div className="device-info">
                <span className="device-name">{device.name || `Device ${device.id}`}</span>
                <span className="device-id">ID: {device.id}</span>
              </div>
              <div className="device-status">
                {selectedDevice?.id === device.id ? (
                  <FaCheckCircle className="status-icon selected" />
                ) : (
                  <FaCircle className="status-icon" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DeviceSelector; 