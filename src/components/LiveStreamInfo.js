import React from 'react';
import { FaSignal, FaClock, FaCircle, FaLock } from 'react-icons/fa';
import './LiveStreamInfo.css';

const LiveStreamInfo = ({ streamState, isAdmin }) => {
    const lastUpdateTime = new Date(streamState.lastUpdate).toLocaleTimeString();

    if (!isAdmin) {
        return (
            <div className="live-stream-info">
                <div className="demo-restriction-message">
                    <FaLock className="lock-icon" />
                    <h3>Demo User Access</h3>
                    <p>Live streaming is not available for demo users. Please contact your administrator to upgrade your account for full access to live streaming features.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="live-stream-info">
            <div className="stream-status-card">
                <div className="status-header">
                    <h3>
                        <FaCircle className={`status-indicator ${streamState.isActive ? 'active' : 'inactive'}`} />
                        Stream Status
                    </h3>
                </div>
                <div className="status-details">
                    <div className="status-item">
                        <FaSignal className="status-icon" />
                        <div className="status-text">
                            <span className="label">Connection Status</span>
                            <span className="value">{streamState.isActive ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>
                    <div className="status-item">
                        <FaClock className="status-icon" />
                        <div className="status-text">
                            <span className="label">Last Update</span>
                            <span className="value">{lastUpdateTime}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveStreamInfo; 